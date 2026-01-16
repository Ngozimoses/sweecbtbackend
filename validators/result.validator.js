// validators/result.validator.js
const Joi = require('joi');

const gradeSubmissionSchema = Joi.object({
  totalScore: Joi.number().min(0).required(),
  feedback: Joi.string().optional(),
  shortAnswerScores: Joi.object().optional()
});

module.exports = {
  gradeSubmissionSchema
};