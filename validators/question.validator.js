// validators/question.validator.js
const Joi = require('joi');

const optionSchema = Joi.object({
  text: Joi.string().required(),
  isCorrect: Joi.boolean().default(false)
});
const questionOption = Joi.object({
  text: Joi.string().required(),
  isCorrect: Joi.boolean().required()
});

const createQuestionSchema = Joi.object({
  text: Joi.string().min(5).max(1000).required(),
  type: Joi.string().valid('multiple-choice', 'true-false', 'short-answer').default('multiple-choice'),
  options: Joi.when('type', {
    is: Joi.valid('multiple-choice', 'true-false'),
    then: Joi.array().items(optionSchema).min(2).required(),
    otherwise: Joi.array().optional()
  }),
  expectedAnswer: Joi.when('type', {
    is: 'short-answer',
    then: Joi.string().max(200).required(),
    otherwise: Joi.string().optional()
  }),
  subject: Joi.string().required(),
  topic: Joi.string().max(100).optional(),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').default('medium'),
  sharedWith: Joi.array().items(Joi.string()).optional()
});

const updateQuestionSchema = Joi.object({
  text: Joi.string().min(5).max(1000).optional(),
  type: Joi.string().valid('multiple-choice', 'true-false', 'short-answer').optional(),
  options: Joi.array().items(optionSchema).optional(),
  expectedAnswer: Joi.string().max(200).optional(),
  subject: Joi.string().optional(),
  topic: Joi.string().max(100).optional(),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').optional(),
  sharedWith: Joi.array().items(Joi.string()).optional()
});

const shareQuestionSchema = Joi.object({
  teacherIds: Joi.array().items(Joi.string()).min(1).required()
});

module.exports = {
  createQuestionSchema,
  updateQuestionSchema,
  shareQuestionSchema,questionOption
};