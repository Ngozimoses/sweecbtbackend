// middleware/error.js
const logger = require('../config/logger');

/**
 * Custom API error class (optional but helpful)
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handling middleware
 * Must be registered AFTER all routes
 */
const errorHandler = (err, req, res, next) => {
  // Log all errors (even 4xx)
  logger.error(`ERROR ${req.method} ${req.originalUrl}: ${err.message}`);

  let error = { ...err };
  error.message = err.message;

  // Handle specific errors
  if (err.name === 'CastError') {
    error = new AppError('Invalid ID format.', 400);
  }

  if (err.code === 11000) {
    const message = 'Duplicate field value entered.';
    error = new AppError(message, 400);
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new AppError(message, 400);
  }

  // Final response
  res.status(error.statusCode || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' && !error.isOperational
      ? 'Internal server error.'
      : error.message,
  });
};

module.exports = { errorHandler, AppError };