// routes/upload.routes.js
const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');
const   uploadCtrl = require('../controllers/upload.controller');

// Exam answer upload (student)
router.post(
  '/exam-answer',
  protect,
  requireRole('student'),
  upload.single('file'),
  handleUploadError,
  uploadCtrl.uploadExamAnswer
);

// Study material upload (teacher)
router.post(
  '/material',
  protect,
  requireRole('teacher', 'admin'),
  upload.single('file'),
  handleUploadError,
  uploadCtrl.uploadMaterial
);

// File download
router.get('/:fileId', protect, uploadCtrl.downloadFile);

module.exports = router;