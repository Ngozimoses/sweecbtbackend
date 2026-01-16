// models/Subject.js
const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Subject name is required'],
    unique: true,
    trim: true,
    maxlength: 100
  },
  code: {
    type: String,
    required: [true, 'Subject code is required'],
    unique: true,
    uppercase: true,
    match: [/^[A-Z]{2,5}\d{1,3}$/, 'Invalid subject code format (e.g., MATH101)']
  },
  description: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

SubjectSchema.index({ code: 1 });

module.exports = mongoose.model('Subject', SubjectSchema);