// models/Report.js
const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['system', 'exam', 'user', 'custom'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed, // JSON object
    required: true
  },
  filters: {
    type: Object // e.g., { class: '...', dateRange: [...] }
  },
  generatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

ReportSchema.index({ type: 1 });
ReportSchema.index({ createdAt: 1 });

module.exports = mongoose.model('Report', ReportSchema);