const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: false
  },
  type: {
    type: String,
    enum: ['pdf', 'doc', 'ppt', 'video', 'link', 'other'],
    required: true
  },
  fileUrl: {
    type: String,
    required: false // For uploaded files
  },
  externalUrl: {
    type: String,
    required: false // For external links
  },
  thumbnail: {
    type: String,
    required: false
  },
  fileSize: {
    type: Number,
    required: false // in bytes
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: false // null for general materials store
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: false
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedByRole: {
    type: String,
    enum: ['admin', 'teacher'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for better query performance
materialSchema.index({ class: 1, status: 1 });
materialSchema.index({ uploadedBy: 1, status: 1 });
materialSchema.index({ subject: 1, status: 1 });

module.exports = mongoose.model('Material', materialSchema);