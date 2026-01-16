const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const classValidator = require('../validators/class.validator');
const classCtrl = require('../controllers/class.controller');

// Public routes
router.get('/public', classCtrl.getPublicClasses);

// Admin/Teacher routes
router.route('/')
  .get(protect, requireRole('admin', 'teacher'), classCtrl.getAllClasses)
  .post(protect, requireRole('admin'), validate(classValidator.createClassSchema), classCtrl.createClass);

// Single class routes
router.route('/:id')
  .get(protect, requireRole('admin', 'teacher'), classCtrl.getClassById) // ✅ FIXED
  .patch(protect, requireRole('admin'), validate(classValidator.updateClassSchema), classCtrl.updateClass)
  .delete(protect, requireRole('admin'), classCtrl.deleteClass);

// Teacher assignment (admin only)
router.post('/:id/assign-teacher', protect, requireRole('admin'), validate(classValidator.assignTeacherSchema), classCtrl.assignTeacher);

// Subject management
router.get('/:id/subjects', protect, requireRole('admin', 'teacher'), classCtrl.getClassSubjects); // ✅ Teachers can view
router.post('/:id/subjects', protect, requireRole('admin'), validate(classValidator.assignSubjectSchema), classCtrl.assignSubjectToClass); // Admin only
router.delete('/:id/subjects/:subjectId', protect, requireRole('admin'), classCtrl.removeSubjectFromClass); // Admin only

// Student enrollment (admin only)
router.post('/:id/enroll', protect, requireRole('admin'), validate(classValidator.enrollStudentsSchema), classCtrl.enrollStudents);
router.delete('/:id/unenroll', protect, requireRole('admin'), validate(classValidator.unenrollStudentsSchema), classCtrl.unenrollStudents);

module.exports = router;