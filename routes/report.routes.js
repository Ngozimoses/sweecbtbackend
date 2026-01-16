// routes/report.routes.js
const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const   reportCtrl = require('../controllers/report.controller');

router.get('/system', protect, requireRole('admin'), reportCtrl.getSystemReport);
router.get('/exams', protect, requireRole('admin'), reportCtrl.getExamReport);
router.get('/users', protect, requireRole('admin'), reportCtrl.getUserReport);
router.get('/custom', protect, requireRole('admin'), reportCtrl.getCustomReport);

module.exports = router;