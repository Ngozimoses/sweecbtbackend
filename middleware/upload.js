const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('../config/logger');

// Ensure upload directories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const UPLOAD_BASE = path.join(__dirname, '../uploads');
ensureDir(path.join(UPLOAD_BASE, 'materials'));
ensureDir(path.join(UPLOAD_BASE, 'exam-answers'));
ensureDir(path.join(UPLOAD_BASE, 'temp')); // For temporary processing

// Enhanced storage configuration with better routing logic
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadDir = path.join(UPLOAD_BASE, 'materials');

    // Determine upload directory based on route and context
    if (req.baseUrl?.includes('exam-answer') || req.body?.type === 'answer') {
      uploadDir = path.join(UPLOAD_BASE, 'exam-answers');
    } 
    // Materials routes
    else if (req.baseUrl?.includes('/materials') || req.body?.context === 'materials') {
      uploadDir = path.join(UPLOAD_BASE, 'materials');
    }
    // Fallback for other document uploads
    else if (req.body?.type === 'document' || file.mimetype.includes('application')) {
      uploadDir = path.join(UPLOAD_BASE, 'documents');
      ensureDir(uploadDir);
    }

    ensureDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanFileName = file.originalname
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^a-zA-Z0-9._-]/g, '') // Remove special characters
      .substring(0, 100); // Limit filename length
    const filename = `${cleanFileName}-${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

// Enhanced file filter with comprehensive material support
const fileFilter = (req, file, cb) => {
  // Define allowed file types by category
  const ALLOWED_TYPES = {
    documents: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv'
    ],
    images: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ],
    videos: [
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-matroska'
    ],
    audio: [
      'audio/mpeg',
      'audio/wav',
      'audio/ogg'
    ]
  };

  // Combine all allowed types for materials
  const allAllowedTypes = [
    ...ALLOWED_TYPES.documents,
    ...ALLOWED_TYPES.images,
    ...ALLOWED_TYPES.videos,
    ...ALLOWED_TYPES.audio
  ];

  // Check if file type is allowed
  if (allAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const errorMsg = `Invalid file type: ${file.mimetype}. Allowed types: PDF, DOC, PPT, XLS, TXT, CSV, JPG, PNG, GIF, MP4, MOV, MP3, WAV`;
    logger.warn(`Blocked upload: ${errorMsg}`);
    cb(new Error(errorMsg), false);
  }
};

// Enhanced Multer upload instance with dynamic limits
const getUploadConfig = (req) => {
  const DEFAULT_LIMIT = 10 * 1024 * 1024; // 10 MB
  
  // Allow larger files for video uploads
  if (req.body?.type === 'video' || req.baseUrl?.includes('video')) {
    return 100 * 1024 * 1024; // 100 MB for videos
  }
  
  // Standard limit for documents and images
  return DEFAULT_LIMIT;
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Default 10MB, can be overridden per route
    files: 5, // Max 5 files per request
    fieldNameSize: 100,
    fieldSize: 1024 * 1024, // 1MB for text fields
    headerPairs: 2000
  }
});

// Enhanced error handler with detailed messages
const handleUploadError = (err, req, res, next) => {
  logger.error('Upload error:', { 
    error: err.message, 
    route: req.originalUrl, 
    user: req.user?.id 
  });

  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({ 
          message: 'File too large. Max size: 10MB for documents, 100MB for videos.' 
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({ 
          message: 'Too many files. Maximum 5 files per upload.' 
        });
      case 'LIMIT_FIELD_KEY':
        return res.status(400).json({ 
          message: 'Field name too long.' 
        });
      case 'LIMIT_FIELD_VALUE':
        return res.status(400).json({ 
          message: 'Field value too large.' 
        });
      default:
        return res.status(400).json({ 
          message: 'File upload error. Please try again.' 
        });
    }
  }
  
  // Handle custom validation errors
  if (err.message?.includes('Invalid file type')) {
    return res.status(400).json({ 
      message: err.message,
      allowedTypes: 'PDF, DOC/DOCX, PPT/PPTX, XLS/XLSX, TXT, CSV, JPG/JPEG, PNG, GIF, MP4, MOV, MP3, WAV'
    });
  }
  
  // Handle generic errors
  logger.error('Unexpected upload error:', err);
  return res.status(500).json({ 
    message: 'Server error during file upload. Please contact support.' 
  });
};

// Utility function to clean up uploaded files (useful for rollback scenarios)
const cleanupUploadedFiles = (files) => {
  if (!files) return;
  
  const fileList = Array.isArray(files) ? files : [files];
  fileList.forEach(file => {
    if (file?.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
      logger.info(`Cleaned up file: ${file.path}`);
    }
  });
};

// Middleware for materials-specific uploads
const materialsUpload = upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]);

// Middleware for single file uploads
const singleFileUpload = upload.single('file');

// Middleware for multiple file uploads
const multiFileUpload = upload.array('files', 5);

module.exports = {
  upload,
  singleFileUpload,
  multiFileUpload,
  materialsUpload,
  handleUploadError,
  cleanupUploadedFiles,
  // Export storage and fileFilter for custom configurations if needed
  storage,
  fileFilter
};