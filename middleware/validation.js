// middleware/validation.js
const logger = require('../config/logger');

/**
 * Generic validation middleware using Joi
 * Usage: validate(createUserSchema)
 */
const validate = (schema) => {
  return (req, res, next) => {
    const validSchema = {
      body: schema.body || {},
      params: schema.params || {},
      query: schema.query || {}
    };

    const validData = {};

    // Validate each part of the request
    for (const key of ['body', 'params', 'query']) {
      if (Object.keys(validSchema[key]).length === 0) continue;

      const { error, value } = validSchema[key].validate(req[key], {
        abortEarly: false,
        stripUnknown: true
      });

      if (error) {
        const errorMessage = error.details.map(d => d.message).join(', ');
        logger.warn(`Validation failed: ${errorMessage}`);
        return res.status(400).json({
          message: 'Validation failed',
          details: errorMessage
        });
      }

      validData[key] = value;
    }

    // Attach cleaned data to request
    Object.assign(req, validData);
    next();
  };
};

module.exports = { validate };