// routes/notification.routes.js
const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const  notificationValidator = require('../validators/notification.validator');
const   notificationCtrl = require('../controllers/notification.controller');

// User notifications
router.get('/', protect, notificationCtrl.getUserNotifications);
router.post('/mark-read/:id', protect, notificationCtrl.markNotificationRead);
router.post('/mark-all-read', protect, notificationCtrl.markAllNotificationsRead);

// Admin/Teacher send notification
router.post('/send', protect, requireRole('admin', 'teacher'), validate(notificationValidator.sendNotificationSchema), notificationCtrl.sendNotification);

module.exports = router;