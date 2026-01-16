// validators/subject.validator.js
const Joi = require('joi');

const createSubjectSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().required(),
  code: Joi.string().pattern(/^[A-Z]{2,5}\d{1,3}$/).required().messages({
    'string.pattern.base': 'Subject code must be like MATH101'
  }),
  description: Joi.string().max(500).optional()
});

const updateSubjectSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().optional(),
  code: Joi.string().pattern(/^[A-Z]{2,5}\d{1,3}$/).optional(),
  description: Joi.string().max(500).optional()
});

module.exports = {
  createSubjectSchema,
  updateSubjectSchema
};