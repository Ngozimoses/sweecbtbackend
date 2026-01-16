// routes/subject.routes.js
const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const  subjectValidator = require('../validators/subject.validator');
const   subjectCtrl = require('../controllers/subject.controller');

router.route('/')
  .get(protect, requireRole('admin', 'teacher'), subjectCtrl.getAllSubjects)
  .post(protect, requireRole('admin'), validate(subjectValidator.createSubjectSchema), subjectCtrl.createSubject);

router.route('/:id')
  .get(protect, requireRole('admin'), subjectCtrl.getSubjectById)
  .patch(protect, requireRole('admin'), validate(subjectValidator.updateSubjectSchema), subjectCtrl.updateSubject)
  .delete(protect, requireRole('admin'), subjectCtrl.deleteSubject);

module.exports = router;