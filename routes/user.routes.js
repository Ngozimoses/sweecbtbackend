// routes/user.routes.js
const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const  userValidator = require('../validators/user.validator');
const  userCtrl = require('../controllers/user.controller');

// Admin routes
router.route('/')
  .get(protect, requireRole('admin'), userCtrl.getAllUsers)
  .post(protect, requireRole('admin'), validate(userValidator.createUserSchema), userCtrl.createUser);
router.post('/bulk', protect, requireRole('admin'), validate(userValidator.bulkCreateUsersSchema), userCtrl.bulkCreateUsers);
router.route('/:id')
  .get(protect, requireRole('admin'), userCtrl.getUserById)
  .patch(protect, requireRole('admin'), validate(userValidator.updateUserSchema), userCtrl.updateUser)
  .delete(protect, requireRole('admin'), userCtrl.deleteUser);
// Add these if needed (optional - can use existing endpoints with filters) 
// Current user routes
router.get('/me/classes', protect, userCtrl.getCurrentUserClasses);

module.exports = router;