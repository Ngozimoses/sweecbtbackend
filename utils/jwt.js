// utils/jwt.js
const jwt = require('jsonwebtoken');

/**
 * Generate an access token (short-lived)
 * @param {string} userId - User ID
 * @param {string} role - User role (e.g., 'admin', 'teacher', 'student')
 * @returns {string} JWT access token
 */
const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '15m' }
  );
};

/**
 * Generate a refresh token (long-lived)
 * @param {string} userId - User ID
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '7d' }
  );
};

/**
 * Verify a JWT token
 * @param {string} token - The JWT to verify
 * @param {string} secret - Secret key (default: JWT_SECRET)
 * @returns {object|null} Decoded payload or null if invalid
 */
const verifyToken = (token, secret = process.env.JWT_SECRET) => {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken
};