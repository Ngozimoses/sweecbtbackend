// utils/email.js
const nodemailer = require('nodemailer');
const logger = require('../config/logger');

/**
 * Create a reusable Nodemailer transporter
 * Uses Gmail by default (enable "Less secure app access" or use App Password)
 */
const createTransporter = () => {
  // For Gmail
  if (process.env.EMAIL_SERVICE === 'gmail' || !process.env.EMAIL_SERVICE) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  // For other services (e.g., Outlook, custom SMTP)
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const transporter = createTransporter();

/**
 * Send an email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML body (fallback to text if not provided)
 * @param {string} [text] - Plain text body (optional)
 * @returns {Promise<void>}
 */
const sendEmail = async (to, subject, html, text = '') => {
  try {
    const mailOptions = {
      from: `"School CBT System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML tags for plain text
    };

    await transporter.sendMail(mailOptions);
    logger.info(`📧 Email sent to ${to}: ${subject}`);
  } catch (error) {
    logger.error(`❌ Email failed to ${to}: ${error.message}`);
    throw new Error('Email delivery failed');
  }
};

/**
 * Generate password reset URL
 * @param {string} token - Reset token
 * @returns {string} Full reset URL
 */
const getPasswordResetUrl = (token) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
  return `${clientUrl}/reset-password/${token}`;
};

module.exports = {
  sendEmail,
  getPasswordResetUrl
};