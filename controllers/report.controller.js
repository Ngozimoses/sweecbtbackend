// controllers/report.controller.js
const User = require('../models/User');
const Exam = require('../models/Exam');
const Submission = require('../models/Submission');

const getSystemReport = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const examCount = await Exam.countDocuments();
    const submissionCount = await Submission.countDocuments();
    
    res.json({
      totalUsers: userCount,
      totalExams: examCount,
      totalSubmissions: submissionCount,
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate system report.' });
  }
};

const getExamReport = async (req, res) => {
  try {
    const exams = await Exam.aggregate([
      { $lookup: { from: 'submissions', localField: '_id', foreignField: 'exam', as: 'submissions' }},
      { $addFields: { completionRate: { $divide: [{ $size: '$submissions' }, 100 ] }}}
    ]);
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate exam report.' });
  }
};

const getUserReport = async (req, res) => {
  try {
    const users = await User.find().select('name email role createdAt');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate user report.' });
  }
};

const getCustomReport = async (req, res) => {
  res.status(501).json({ message: 'Custom reports not implemented.' });
};

module.exports = {
  getSystemReport,
  getExamReport,
  getUserReport,
  getCustomReport
};