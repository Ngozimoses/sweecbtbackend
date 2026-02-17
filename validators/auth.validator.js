// validators/auth.validator.js
const Joi = require('joi');

const registerSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(100).trim().required().messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 100 characters'
    }),
    email: Joi.string().email().lowercase().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Must be a valid email'
    }),
    password: Joi.string().min(6).max(128).required().messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters'
    }),
    role: Joi.string().valid('admin', 'teacher', 'student').optional(),
    class: Joi.string().optional()
  })
};

const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().lowercase().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Must be a valid email'
    }),
    password: Joi.string().min(1).required().messages({
      'string.empty': 'Password is required'
    })
  })
};

const forgotPasswordSchema = {
  body: Joi.object({
    email: Joi.string().email().lowercase().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Must be a valid email'
    })
  })
};

const resetPasswordSchema = {
  body: Joi.object({
    password: Joi.string().min(6).max(128).required().messages({
      'string.empty': 'New password is required',
      'string.min': 'Password must be at least 6 characters'
    })
  })
};

const updateProfileSchema = {
  body: Joi.object({
    name: Joi.string().min(2).max(100).trim().optional(),
    email: Joi.string().email().lowercase().optional()
  })
};

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema
};
// // validators/auth.validator.js
// const Joi = require('joi');

// const registerSchema = Joi.object({
//   name: Joi.string().min(2).max(100).trim().required().messages({
//     'string.empty': 'Name is required',
//     'string.min': 'Name must be at least 2 characters',
//     'string.max': 'Name cannot exceed 100 characters'
//   }),
//   email: Joi.string().email().lowercase().required().messages({
//     'string.empty': 'Email is required',
//     'string.email': 'Must be a valid email'
//   }),
//   password: Joi.string().min(6).max(128).required().messages({
//     'string.empty': 'Password is required',
//     'string.min': 'Password must be at least 6 characters'
//   }),
//   role: Joi.string().valid('admin', 'teacher', 'student').optional(),
//   class: Joi.string().optional() // ObjectId string for students
// });

// const loginSchema = Joi.object({
//   email: Joi.string().email().lowercase().required().messages({
//     'string.empty': 'Email is required',
//     'string.email': 'Must be a valid email'
//   }),
//   password: Joi.string().min(1).required().messages({
//     'string.empty': 'Password is required'
//   })
// });

// const forgotPasswordSchema = Joi.object({
//   email: Joi.string().email().lowercase().required().messages({
//     'string.empty': 'Email is required',
//     'string.email': 'Must be a valid email'
//   })
// });

// const resetPasswordSchema = Joi.object({
//   password: Joi.string().min(6).max(128).required().messages({
//     'string.empty': 'New password is required',
//     'string.min': 'Password must be at least 6 characters'
//   })
// });

// const updateProfileSchema = Joi.object({
//   name: Joi.string().min(2).max(100).trim().optional(),
//   email: Joi.string().email().lowercase().optional()
// });

// module.exports = {
//   registerSchema,
//   loginSchema,
//   forgotPasswordSchema,
//   resetPasswordSchema,
//   updateProfileSchema
// };