// routes/question.routes.js
const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { upload, handleUploadError } = require('../middleware/upload');
const questionValidator = require('../validators/question.validator');
const questionCtrl = require('../controllers/question.controller');

// Question bank - filtered by subject (NEW)
router.get('/bank', protect, requireRole('teacher', 'admin'), questionCtrl.getQuestionBank);

// Get questions by IDs (FIXED - use query parameter instead of duplicate route)
router.get('/bank/ids', protect, requireRole('student','admin', 'teacher'), questionCtrl.getQuestionsByIds);

// Get teacher's subjects
router.get('/subjects', protect, requireRole('admin', 'teacher'), questionCtrl.getTeacherSubjects);

// Teacher-specific question bank (by teacher ID)
router.get('/teacher/:teacherId', protect, requireRole('admin', 'teacher'), questionCtrl.getTeacherQuestions);

// Individual question operations
router.route('/:id')
  .get(protect, requireRole('teacher', 'admin'), questionCtrl.getQuestionById)
  .patch(protect, requireRole('teacher', 'admin'), validate(questionValidator.updateQuestionSchema), questionCtrl.updateQuestion)
  .delete(protect, requireRole('teacher', 'admin'), questionCtrl.deleteQuestion);

// Import/Export
router.post('/import', protect, requireRole('teacher', 'admin'), upload.single('file'), handleUploadError, questionCtrl.importQuestions);
router.get('/export', protect, requireRole('teacher', 'admin'), questionCtrl.exportQuestions);

// Sharing
router.post('/:id/share', protect, requireRole('teacher', 'admin'), validate(questionValidator.shareQuestionSchema), questionCtrl.shareQuestion);

module.exports = router;