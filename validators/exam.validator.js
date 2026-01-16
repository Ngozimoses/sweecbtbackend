// validators/exam.validator.js
const Joi = require('joi');

// Add this schema
const questionItem = Joi.object({
  type: Joi.string().valid('multiple_choice', 'true_false', 'short_answer').required(),
  text: Joi.string().min(5).max(2000).required(),
  marks: Joi.number().min(0.5).max(100).required(),
  options: Joi.array().items(
    Joi.object({
      text: Joi.string().required(),
      isCorrect: Joi.boolean().required()
    })
  ).optional() // Optional for short_answer
});

const createExamSchema = Joi.object({
  title: Joi.string().min(3).max(200).trim().required(),
  class: Joi.string().required(),
  subject: Joi.string().required(),
  duration: Joi.number().integer().min(5).max(300).required(),
  questions: Joi.array().items(questionItem).min(1).required()
});

 
 
const updateExamSchema = Joi.object({
  title: Joi.string().min(3).max(200).trim().optional(),
  duration: Joi.number().integer().min(5).max(300).optional(),
  questions: Joi.array().items(questionItem).optional(),
  status: Joi.string().valid('draft', 'scheduled', 'published', 'completed').optional()
});

const scheduleExamSchema = Joi.object({
  start: Joi.date().required(),
  end: Joi.date().min(Joi.ref('start')).required().messages({
    'date.min': 'End time must be after start time'
  })
});

const submitExamSchema = Joi.object({
  answers: Joi.array().items(
    Joi.object({
      question: Joi.string().required(),
      answer: Joi.alternatives().try(Joi.string(), Joi.number()).required()
    })
  ).required(),
  timeSpent: Joi.number().integer().min(1).required().messages({
    'number.min': 'Time spent must be at least 1 second'
  }),
  warnings: Joi.array().items(Joi.string().valid('switched-tab', 'idle-time', 'screenshot-detected')).optional()
});

module.exports = {
  createExamSchema,
  updateExamSchema,
  scheduleExamSchema,
  submitExamSchema
};