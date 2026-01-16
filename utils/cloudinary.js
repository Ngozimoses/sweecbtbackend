// utils/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage configuration for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'school-cbt',
    allowed_formats: ['jpg', 'png', 'pdf', 'doc', 'docx', 'ppt', 'pptx', 'mp4', 'mov'],
    transformation: (req, file) => {
      // Apply transformations based on file type if needed
      if (file.mimetype.startsWith('image/')) {
        return { width: 1200, height: 800, crop: 'limit' };
      }
      return {};
    }
  }
});

// Upload function
const uploadToCloudinary = async (filePath, folder = 'school-cbt') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto' // Automatically detect resource type
    });
    
    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
      thumbnail_url: result.thumbnail_url || null
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload to Cloudinary');
  }
};

// Delete function
const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
};

module.exports = {
  cloudinary,
  storage,
  uploadToCloudinary,
  deleteFromCloudinary
};