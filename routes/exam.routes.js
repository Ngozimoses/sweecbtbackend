const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const examValidator = require('../validators/exam.validator');
const examCtrl = require('../controllers/exam.controller');
const submissionValidator = require('../validators/submission.validator');

// General exam management (Teacher/Admin)
router.route('/')
  .get(protect, examCtrl.getAllExams)
  .post(protect, requireRole('teacher', 'admin'), validate(examValidator.createExamSchema), examCtrl.createExam);

// Single exam routes
router.route('/:id')
  .get(protect, requireRole('student','teacher', 'admin'), examCtrl.getExamById)
  .patch(protect, requireRole('teacher', 'admin'), validate(examValidator.updateExamSchema), examCtrl.updateExam)
  .delete(protect, requireRole('admin'), examCtrl.deleteExam);

// ✅ CORRECT: Separate route for submissions
router.post('/:id/submissions', 
  protect, 
  requireRole('student'), 
  validate(submissionValidator.createSubmissionSchema), 
  examCtrl.submitExam
);

// Exam management routes
router.post('/:id/publish', protect, requireRole('teacher', 'admin'), examCtrl.publishExam);
router.post('/:id/schedule', protect, requireRole('teacher', 'admin'), validate(examValidator.scheduleExamSchema), examCtrl.scheduleExam);

// Submissions routes
router.get('/:id/submissions', protect, requireRole('teacher'), examCtrl.getExamSubmissions);

// Student-specific routes
router.get('/active', protect, requireRole('student'), examCtrl.getActiveExams);
router.post('/:id/submit', protect, requireRole('student'), validate(examValidator.submitExamSchema), examCtrl.submitExam);
router.get('/:id/results', protect, requireRole('student'), examCtrl.getStudentExamResult);

router.post('/:id/start', protect, requireRole('student'), examCtrl.startExam);
module.exports = router;