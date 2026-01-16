// controllers/admin.controller.js
const Exam = require('../models/Exam');
const User = require('../models/User');
const Submission = require('../models/Submission');
const Subject = require('../models/Subject');

const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    
    const activeExams = await Exam.countDocuments({
      status: 'published',
      scheduledAt: { $lte: now },
      endsAt: { $gte: now }
    });
    
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);
    const endingToday = await Exam.countDocuments({
      status: 'published',
      endsAt: { $gte: now, $lte: todayEnd }
    });
    
    const totalUsers = await User.countDocuments();
    
    const gradedSubmissions = await Submission.find({ 
      status: 'graded',
      totalScore: { $exists: true },
      maxScore: { $exists: true }
    });
    
    const avgScore = gradedSubmissions.length > 0 
      ? Math.round(
          gradedSubmissions.reduce((sum, sub) => {
            const percentage = sub.maxScore > 0 ? (sub.totalScore / sub.maxScore) * 100 : 0;
            return sum + percentage;
          }, 0) / gradedSubmissions.length
        )
      : 0;
    
    const issues = 0;
    const pendingIssues = 0;
    const userGrowth = '+0%';
    const scoreGrowth = '+0%';

    res.json({
      totalUsers,
      activeExams,
      endingToday,
      avgScore,
      issues,
      pendingIssues,
      userGrowth,
      scoreGrowth
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard stats' });
  }
};

const getExamTrend = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const examData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
      
      const exams = await Exam.countDocuments({
        createdAt: { $gte: date, $lt: nextDate }
      });
      
      const completions = await Submission.countDocuments({
        status: 'graded',
        createdAt: { $gte: date, $lt: nextDate }
      });
      
      examData.push({
        name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        exams,
        completions
      });
    }
    
    res.json(examData);
  } catch (error) {
    console.error('Exam trend error:', error);
    res.status(500).json({ message: 'Failed to fetch exam trend' });
  }
};

const getUserDistribution = async (req, res) => {
  try {
    const roles = ['admin', 'teacher', 'student'];
    const distribution = [];
    
    for (const role of roles) {
      const count = await User.countDocuments({ role });
      if (count > 0) {
        distribution.push({
          name: role.charAt(0).toUpperCase() + role.slice(1),
          value: count
        });
      }
    }
    
    res.json(distribution);
  } catch (error) {
    console.error('User distribution error:', error);
    res.status(500).json({ message: 'Failed to fetch user distribution' });
  }
};

const getSubjectPerformance = async (req, res) => {
  try {
    const submissions = await Submission.find({ status: 'graded' })
      .populate('exam', 'subject')
      .populate('exam.subject', 'name');
    
    if (submissions.length === 0) {
      return res.json([]);
    }
    
    const subjectMap = {};
    submissions.forEach(sub => {
      const subjectName = sub.exam?.subject?.name || 'General';
      if (!subjectMap[subjectName]) {
        subjectMap[subjectName] = {
          totalScore: 0,
          maxScore: 0,
          count: 0,
          totalExams: new Set()
        };
      }
      
      subjectMap[subjectName].totalScore += sub.totalScore;
      subjectMap[subjectName].maxScore += sub.maxScore;
      subjectMap[subjectName].count += 1;
      if (sub.exam) {
        subjectMap[subjectName].totalExams.add(sub.exam._id.toString());
      }
    });
    
    const performance = Object.entries(subjectMap).map(([subject, data]) => {
      const avgScore = data.maxScore > 0 ? Math.round((data.totalScore / data.maxScore) * 100) : 0;
      const passRate = data.count > 0 ? Math.round((data.totalScore / data.count / 100) * 100) : 0;
      
      return {
        subject,
        avgScore,
        passRate: Math.min(100, passRate),
        totalExams: data.totalExams.size
      };
    });
    
    res.json(performance);
  } catch (error) {
    console.error('Subject performance error:', error);
    res.status(500).json({ message: 'Failed to fetch subject performance' });
  }
};

module.exports = {
  getDashboardStats,
  getExamTrend,
  getUserDistribution,
  getSubjectPerformance
};