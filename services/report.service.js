// services/report.service.js
const User = require('../models/User');
const Exam = require('../models/Exam');
const Submission = require('../models/Submission');

class ReportService {
// services/report.service.js

async getSystemReport() {
  const [userCount, examCount, submissionCount] = await Promise.all([
    User.countDocuments(),
    Exam.countDocuments({ status: 'published' }),
    Submission.countDocuments()
  ]);

  const activeExams = await Exam.countDocuments({
    status: 'published',
    endsAt: { $gt: new Date() }
  });

  const avgScore = await Submission.aggregate([
    { $group: { _id: null, avg: { $avg: '$totalScore' } } }
  ]).then(res => res[0]?.avg?.toFixed(1) || 0);

  return {
    totalUsers: userCount,
    activeExams,
    avgScore,
    issues: 0, // or link to audit logs
    userGrowth: '+12%',
    scoreGrowth: '+5%',
    endingToday: await Exam.countDocuments({
      endsAt: { $gte: new Date(), $lt: new Date(Date.now() + 86400000) }
    }),
    pendingIssues: 0
  };
}

async getExamReport() {
  // Return last 6 months of exam data
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const data = await Exam.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        exams: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Dummy completions for demo
  return data.map(item => ({
    name: new Date(item._id).toLocaleString('default', { month: 'short' }),
    exams: item.exams,
    completions: Math.max(item.exams - 2, 0)
  }));
}

async getUserReport() {
  const distribution = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } }
  ]);

  return distribution.map(item => ({
    name: item._id === 'student' ? 'Students' :
           item._id === 'teacher' ? 'Teachers' : 'Admins',
    value: item.count
  }));
}

  async getCustomReport(filters) {
    throw new Error('Custom reports not implemented.');
  }
}

module.exports = new ReportService();