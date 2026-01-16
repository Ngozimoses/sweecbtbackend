// validators/notification.validator.js
const Joi = require('joi');

const sendNotificationSchema = Joi.object({
  userIds: Joi.array().items(Joi.string()).min(1).required().messages({
    'array.min': 'At least one user ID is required'
  }),
  title: Joi.string().min(1).max(100).required(),
  message: Joi.string().min(1).max(500).required(),
  type: Joi.string().valid('exam', 'result', 'system', 'general').optional()
});

module.exports = {
  sendNotificationSchema
};