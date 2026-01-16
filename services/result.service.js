// services/result.service.js
const Submission = require('../models/Submission');
const User = require('../models/User'); 
const Exam = require('../models/Exam');
const Subject = require('../models/Subject');

class ResultService {
  async getAllResults(filters = {}) {
    const query = {};
    if (filters.exam) query.exam = filters.exam;
    if (filters.student) query.student = filters.student;
    if (filters.class) {
      const students = await User.find({ class: filters.class }, '_id');
      query.student = { $in: students.map(s => s._id) };
    }

    return await Submission.find(query)
      .populate('exam', 'title')
      .populate('student', 'name email')
      .populate('gradedBy', 'name');
  }

  async getExamResults(examId) {
    return await Submission.find({ exam: examId })
      .populate('student', 'name')
      .populate('gradedBy', 'name');
  }

  async getStudentResults(studentId) {
    return await Submission.find({ student: studentId })
      .populate('exam', 'title')
      .populate('gradedBy', 'name');
  }

  async getClassResults(classId) {
    const students = await User.find({ class: classId }, '_id');
    return await Submission.find({ student: { $in: students.map(s => s._id) } })
      .populate('exam', 'title')
      .populate('student', 'name')
      .populate('gradedBy', 'name');
  }

// Add this method
async gradeSubmission(submissionId, gradeData, graderId) {
  const submission = await Submission.findById(submissionId);
  if (!submission) throw new Error('Submission not found.');

  // Update scores
  submission.totalScore = gradeData.totalScore;
  submission.feedback = gradeData.feedback;
  submission.gradedBy = graderId;
  submission.status = 'graded';
  
  await submission.save();
  return submission;
}
  async publishExamResults(examId) {
    const result = await Submission.updateMany(
      { exam: examId },
      { status: 'published' }
    );
    if (result.modifiedCount === 0) throw new Error('No results to publish.');
    return result;
  }

  async requestReevaluation(submissionId, studentId) {
    const submission = await Submission.findById(submissionId);
    if (!submission) throw new Error('Submission not found.');
    if (submission.student.toString() !== studentId) {
      throw new Error('Access denied.');
    }

    submission.reevaluationRequested = true;
    submission.status = 'reeval-requested';
    return await submission.save();
  }
 
  async getAnalytics(filters = {}) {
    try {
      if (filters.type === 'subject') {
        const data = await Submission.aggregate([
          // Join with Exam
          {
            $lookup: {
              from: 'exams',
              localField: 'exam',
              foreignField: '_id',
              as: 'examData'
            }
          },
          { $unwind: '$examData' },
          // Join with Subject
          {
            $lookup: {
              from: 'subjects',
              localField: 'examData.subject',
              foreignField: '_id',
              as: 'subjectData'
            }
          },
          { $unwind: '$subjectData' },
          // Group by subject
          {
            $group: {
              _id: '$subjectData.name',
              avgScore: { $avg: '$totalScore' },
              passRate: {
                $avg: {
                  $cond: [{ $gte: ['$totalScore', 50] }, 100, 0]
                }
              },
              totalExams: { $sum: 1 }
            }
          },
          { $sort: { avgScore: -1 } }
        ]);

        return data.map(item => ({
          subject: item._id || 'Unknown',
          avgScore: parseFloat((item.avgScore || 0).toFixed(1)),
          passRate: parseFloat((item.passRate || 0).toFixed(1)),
          totalExams: item.totalExams || 0
        }));
      }

      // Default fallback
      return [];
    } catch (error) {
      console.error('Analytics error:', error);
      return []; // Always return array to avoid frontend crash
    }
  }
 
  async exportExamResults(examId) {
    throw new Error('Export not implemented.');
  }
}

module.exports = new ResultService();