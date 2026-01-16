// controllers/upload.controller.js
const path = require('path');
const fs = require('fs');

const getFilePath = (type, filename) => {
  const basePath = path.join(__dirname, '../uploads');
  const dir = type === 'material' ? 'materials' : 'exam-answers';
  return path.join(basePath, dir, filename);
};

const uploadExamAnswer = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  res.json({ 
    message: 'Exam answer uploaded successfully.',
    fileId: req.file.filename,
    url: `/api/upload/${req.file.filename}`
  });
};

const uploadMaterial = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  res.json({ 
    message: 'Study material uploaded successfully.',
    fileId: req.file.filename,
    url: `/api/upload/${req.file.filename}`
  });
};

const downloadFile = async (req, res) => {
  try {
    // In real app: validate user access to file
    const filePath = path.join(__dirname, '../uploads', req.params.fileId);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found.' });
    }
    res.download(filePath);
  } catch (error) {
    res.status(500).json({ message: 'File download failed.' });
  }
};

module.exports = {
  uploadExamAnswer,
  uploadMaterial,
  downloadFile
};