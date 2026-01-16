// routes/material.routes.js
const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const materialCtrl = require('../controllers/material.controller');
const { singleFileUpload, handleUploadError } = require('../middleware/upload');

// Admin: Materials Store
router.get('/store', 
  protect, 
  requireRole('admin'), 
  materialCtrl.getMaterialsStore
);

router.post('/store', 
  protect, 
  requireRole('admin'), 
  singleFileUpload, 
  handleUploadError,
  materialCtrl.addMaterialToStore
);

router.delete('/store/:id', 
  protect, 
  requireRole('admin'), 
  materialCtrl.removeMaterialFromStore
);

// ... other routes ...

module.exports = router;