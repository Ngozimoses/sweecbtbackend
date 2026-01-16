// models/Question.js
const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Question text is required'],
    maxlength: 1000
  },
// In QuestionSchema
type: {
  type: String,
  enum: ['multiple_choice', 'true_false', 'short_answer'],
  default: 'multiple_choice'
},
points: {
  type: Number,
  min: 0.5,
  default: 1
},
// Keep existing fields: text, options, subject, createdBy, etc.
  options: [{
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false }
  }],
  // For short-answer, store expected keywords or regex
  expectedAnswer: {
    type: String,
    maxlength: 200
  },
  subject: {
    type: mongoose.Schema.ObjectId,
    ref: 'Subject',
    required: [true, 'Subject is required']
  },
  topic: {
    type: String,
    trim: true,
    maxlength: 100
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  sharedWith: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

QuestionSchema.index({ subject: 1 });
QuestionSchema.index({ createdBy: 1 });
QuestionSchema.index({ difficulty: 1 });
QuestionSchema.index({ 'sharedWith': 1 });

module.exports = mongoose.model('Question', QuestionSchema);