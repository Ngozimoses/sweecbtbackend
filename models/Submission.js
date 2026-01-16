// models/Submission.js
const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.ObjectId,
    ref: 'Question',
    required: true
  },
  answer: mongoose.Schema.Types.Mixed,
  isCorrect: Boolean,
  awardedMarks: { // ✅ Add this field
    type: Number,
    default: 0
  },
  reviewed: {
    type: Boolean,
    default: false
  }
});

const SubmissionSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.ObjectId,
    ref: 'Exam',
    required: true
  },
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  answers: [answerSchema], // ✅ Now includes awardedMarks
  timeSpent: {
    type: Number,
    required: true
  },
  warnings: [{
    type: String,
    enum: ['switched-tab', 'idle-time', 'screenshot-detected']
  }],
  status: {
    type: String,
    enum: ['draft', 'submitted', 'graded', 'published', 'reeval-requested'],
    default: 'draft'
  },
  totalScore: {
    type: Number,
    default: 0
  },
  maxScore: {
    type: Number,
    required: true
  },
  feedback: {
    type: String,
    default: ''
  },
  gradedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  reevaluationRequested: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});
 

// Indexes
SubmissionSchema.index({ exam: 1 });
SubmissionSchema.index({ student: 1 });
SubmissionSchema.index({ status: 1 });
SubmissionSchema.index({ createdAt: 1 });

module.exports = mongoose.model('Submission', SubmissionSchema);
