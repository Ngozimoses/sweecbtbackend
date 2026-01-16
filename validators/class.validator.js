// validators/class.validator.js
const Joi = require('joi');

const createClassSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().required(),
  code: Joi.string().pattern(/^[A-Z0-9]{3,10}$/).required().messages({
    'string.pattern.base': 'Class code must be 3-10 uppercase letters/numbers'
  }),
  teacher: Joi.string().required().messages({
    'any.required': 'A teacher must be assigned'
  })
});
const assignSubjectSchema = Joi.object({
  subjectId: Joi.string().required(),
  teacherId: Joi.string().optional().allow(null, '')
});
const updateClassSchema = Joi.object({
  name: Joi.string().min(2).max(100).trim().optional(),
  code: Joi.string().pattern(/^[A-Z0-9]{3,10}$/).optional(),
  teacher: Joi.string().optional()
});

const assignTeacherSchema = Joi.object({
  teacherId: Joi.string().required()
}); 
const enrollStudentsSchema = Joi.object({
  studentIds: Joi.array().items(Joi.string()).min(1).required()
});

const unenrollStudentsSchema = Joi.object({
  studentIds: Joi.array().items(Joi.string()).min(1).required()
});

 

module.exports = {
  createClassSchema,
  updateClassSchema,
  assignTeacherSchema,
    assignSubjectSchema,  enrollStudentsSchema,
  unenrollStudentsSchema
};