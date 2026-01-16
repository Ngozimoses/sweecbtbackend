// routes/student.routes.js
const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const studentCtrl = require('../controllers/student.controller');

// ✅ EXISTING: Exam history for current user
router.get('/me/exam-history', protect, requireRole('student'), studentCtrl.getMyExamHistory);

// ✅ ADD THESE MISSING ROUTES:
router.get('/me/upcoming-exams', protect, requireRole('student'), studentCtrl.getUpcomingExams);
router.get('/me/recent-results', protect, requireRole('student'), studentCtrl.getRecentResults);
router.get('/me/performance', protect, requireRole('student'), studentCtrl.getPerformance);

// Keep existing :id routes for admin access
router.get('/:id/exam-history', protect, requireRole('admin', 'student'), studentCtrl.getExamHistory);
router.get('/:id/upcoming-exams', protect, requireRole('admin', 'student'), studentCtrl.getUpcomingExams);
router.get('/:id/recent-results', protect, requireRole('admin', 'student'), studentCtrl.getRecentResults);
router.get('/:id/performance', protect, requireRole('admin', 'student'), studentCtrl.getPerformance);
router.get('/:id/exam-result/:examId', protect, requireRole('admin', 'student'), studentCtrl.getExamResult);

module.exports = router;