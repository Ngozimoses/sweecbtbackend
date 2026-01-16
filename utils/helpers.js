// utils/helpers.js
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * Hash a password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Compare a plain password with a hashed one
 * @param {string} candidate - Plain text password
 * @param {string} hashed - Hashed password from DB
 * @returns {Promise<boolean>}
 */
const comparePassword = async (candidate, hashed) => {
  return await bcrypt.compare(candidate, hashed);
};

/**
 * Generate a random password reset token (URL-safe)
 * @param {number} length - Token length (default: 32)
 * @returns {string}
 */
const generateResetToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Clean up tokens in DB (e.g., expired refresh tokens)
 * Use in a cron job or manual cleanup
 * @param {Model} Model - Mongoose model (e.g., User)
 * @param {string} tokenField - Field name storing token (e.g., 'refreshToken')
 */
const cleanupExpiredTokens = async (Model, tokenField) => {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
  await Model.updateMany(
    { [tokenField]: { $ne: null }, updatedAt: { $lt: cutoff } },
    { $unset: { [tokenField]: 1 } }
  );
};

/**
 * Format exam duration in human-readable form
 * @param {number} minutes - Duration in minutes
 * @returns {string} e.g., "1h 30m"
 */
const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

module.exports = {
  hashPassword,
  comparePassword,
  generateResetToken,
  cleanupExpiredTokens,
  formatDuration
};