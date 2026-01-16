// validators/user.validator.js
const Joi = require('joi');

const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'teacher', 'student').required(),
  class: Joi.when('role', {
    is: 'student',
    then: Joi.string().required().messages({
      'any.required': 'Class is required for students'
    }),
    otherwise: Joi.string().optional()
  })
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().optional(),
  email: Joi.string().email().lowercase().optional(),
  role: Joi.string().valid('admin', 'teacher', 'student').optional(),
  class: Joi.string().optional()
});
const studentBulkItem = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().lowercase().required(),
  classId: Joi.string().optional(), // Can be validated later
  username: Joi.string().optional()
});

const bulkCreateUsersSchema = Joi.object({
  users: Joi.array().items(studentBulkItem).min(1).required()
});
module.exports = {
  createUserSchema,
  updateUserSchema,bulkCreateUsersSchema
};