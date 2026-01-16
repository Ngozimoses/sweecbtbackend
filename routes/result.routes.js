// routes/result.routes.js
const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const resultValidator = require('../validators/result.validator');
const resultCtrl = require('../controllers/result.controller');

// General results access
router.get('/', protect, resultCtrl.getAllResults);
router.get('/exam/:examId', protect, resultCtrl.getExamResults);
router.get('/student/:studentId', protect, resultCtrl.getStudentResults);
router.get('/class/:classId', protect, resultCtrl.getClassResults);

// ✅ CORRECT: Single grading endpoint
router.patch('/:id/grade', protect, requireRole('teacher'), validate(resultValidator.gradeSubmissionSchema), resultCtrl.gradeSubmission);

// Publishing & re-evaluation
router.post('/exam/:examId/publish', protect, requireRole('teacher'), resultCtrl.publishExamResults);
router.post('/:submissionId/reevaluate', protect, requireRole('student'), resultCtrl.requestReevaluation);

// Analytics & export
router.get('/analytics', protect, resultCtrl.getAnalytics);
router.get('/exam/:examId/export', protect, resultCtrl.exportExamResults);

module.exports = router;