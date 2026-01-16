// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Load environment variables from .env
dotenv.config({ path: path.resolve(__dirname, '.env') });

// 🔍 Critical: Validate MONGODB_URI early
if (!process.env.MONGODB_URI) {
  console.error('❌ FATAL: MONGODB_URI is missing in .env file!');
  process.exit(1);
}
console.log('✅ MONGODB_URI is loaded.');

// Initialize Express app
const app = express();

// Import configurations
const connectDB = require('./config/db');
const logger = require('./config/logger');

// Import middleware
const { errorHandler } = require('./middleware/error');
const { handleUploadError } = require('./middleware/upload');
const teacherRoutes = require('./routes/teacher.routes'); 
const adminRoutes = require('./routes/admin.routes'); 

const materialRoutes = require('./routes/material.routes');
// Connect to MongoDB
connectDB();
 
// ========================
// SECURITY MIDDLEWARE
// ========================
app.use(helmet());

// ✅ FIXED CORS: Allow ONLY your Vite frontend origin (use localhost, not 127.0.0.1)
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true, // Required for cookies/auth headers
    optionsSuccessStatus: 200
  })
);

// ========================
// LOGGING MIDDLEWARE
// ========================
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      skip: (req, res) => res.statusCode < 400,
      stream: { write: (message) => logger.info(message.trim()) }
    })
  );
  app.use(
    morgan('combined', {
      skip: (req, res) => res.statusCode >= 400,
      stream: { write: (message) => logger.error(message.trim()) }
    })
  );
}

// ========================
// BODY PARSING
// ========================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ========================
// ROUTES
// ========================
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/classes', require('./routes/class.routes'));
app.use('/api/subjects', require('./routes/subject.routes'));
app.use('/api/exams', require('./routes/exam.routes'));
app.use('/api/questions', require('./routes/question.routes'));
app.use('/api/results', require('./routes/result.routes'));
app.use('/api/reports', require('./routes/report.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/upload', require('./routes/upload.routes'));
app.use('/api/admin', adminRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/students', require('./routes/student.routes'));
app.use('/api/materials', materialRoutes); 
app.use('/api/submissions', require('./routes/submission.routes'));
app.use('/api/teachers', teacherRoutes);
  // Teacher-specific routes
// ========================
// HEALTH CHECK & STATIC FILES
// ========================
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: process.uptime()
  });
});

app.use('/api/upload', express.static(path.join(__dirname, 'uploads')));

// ========================
// ERROR HANDLING
// ========================
app.use(handleUploadError);
app.use(errorHandler);

// ========================
// START SERVER
// ========================
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 School CBT Backend running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  logger.info(`🌐 Frontend origin allowed: ${CLIENT_URL}`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

// ========================
// GRACEFUL SHUTDOWN
// ========================
process.on('unhandledRejection', (reason) => {
  logger.error('UNHANDLED REJECTION:', reason);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (error) => {
  logger.error('UNCAUGHT EXCEPTION:', error);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => logger.info('Process terminated.'));
});

module.exports = app;