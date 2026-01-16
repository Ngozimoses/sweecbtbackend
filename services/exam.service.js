// services/exam.service.js
const Exam = require('../models/Exam');
const Submission = require('../models/Submission');
const Question = require('../models/Question');
const User = require('../models/User');

class ExamService {
  async getAllExams(filters = {}) {
    const query = {};
    if (filters.class) query.class = filters.class;
    if (filters.subject) query.subject = filters.subject;
    if (filters.status) query.status = filters.status;

    return await Exam.find(query)
      .populate('class', 'name')
      .populate('subject', 'name')
      .populate('createdBy', 'name');
  }

  async createExam(examData, creatorId) {
    const exam = new Exam({ ...examData, createdBy: creatorId });
    return await exam.save();
  }

  async getExamById(examId, user) {
    const exam = await Exam.findById(examId)
      .populate('class', 'name')
      .populate('subject', 'name')
      .populate('createdBy', 'name');

    if (!exam) throw new Error('Exam not found.');

    // Student access control
    if (user.role === 'student') {
      const student = await User.findById(user.id).select('class');
      if (student.class?.toString() !== exam.class._id.toString()) {
        throw new Error('Access denied.');
      }
      // Omit questions if not active
      if (exam.status !== 'published' || !this.isExamActive(exam)) {
        exam.questions = undefined;
      }
    }

    return exam;
  }

  async updateExam(id, updates) {
    const exam = await Exam.findByIdAndUpdate(id, updates, { new: true });
    if (!exam) throw new Error('Exam not found.');
    return exam;
  }
// Add this method
async getExamSubmissions(examId) {
  return await Submission.find({ exam: examId })
    .populate('student', 'name email')
    .populate('gradedBy', 'name');
}
  async deleteExam(id) {
    const exam = await Exam.findByIdAndDelete(id);
    if (!exam) throw new Error('Exam not found.');
    return exam;
  }

  async publishExam(id) {
    const exam = await Exam.findByIdAndUpdate(
      id,
      { status: 'published', publishedAt: new Date() },
      { new: true }
    );
    if (!exam) throw new Error('Exam not found.');
    return exam;
  }

  async scheduleExam(id, start, end) {
    const exam = await Exam.findByIdAndUpdate(
      id,
      { scheduledAt: start, endsAt: end, status: 'scheduled' },
      { new: true }
    );
    if (!exam) throw new Error('Exam not found.');
    return exam;
  }

  async getActiveExams(studentId) {
    const student = await User.findById(studentId).select('class');
    const now = new Date();

    return await Exam.find({
      class: student.class,
      status: 'published',
      scheduledAt: { $lte: now },
      endsAt: { $gte: now }
    })
    .populate('subject', 'name')
    .select('title subject duration scheduledAt endsAt');
  }

  async submitExam(examId, studentId, answers, timeSpent, warnings = []) {
    const exam = await Exam.findById(examId);
    if (!exam || exam.status !== 'published') {
      throw new Error('Exam not available for submission.');
    }

    if (!this.isExamActive(exam)) {
      throw new Error('Exam is not currently active.');
    }

    // Auto-grade
    let totalScore = 0;
    let maxScore = 0;
    const gradedAnswers = [];

    for (const ans of answers) {
      const q = await Question.findById(ans.question);
      if (!q) continue;

      const examQuestion = exam.questions.find(eq => eq.question.toString() === ans.question);
      const points = examQuestion?.points || 1;
      maxScore += points;

      let isCorrect = false;
      if (q.type === 'multiple_choice') {
        const correctOption = q.options.find(opt => opt.isCorrect);
        isCorrect = correctOption && ans.answer === correctOption.text;
      }

      if (isCorrect) totalScore += points;

      gradedAnswers.push({
        question: ans.question,
        answer: ans.answer,
        isCorrect,
        pointsAwarded: isCorrect ? points : 0
      });
    }

    const submission = new Submission({
      exam: examId,
      student: studentId,
      answers: gradedAnswers,
      timeSpent,
      warnings,
      totalScore,
      maxScore,
      status: 'submitted'
    });

    return await submission.save();
  }

  async getStudentExamResult(examId, studentId) {
    const submission = await Submission.findOne({ exam: examId, student: studentId })
      .populate('exam', 'title')
      .populate('answers.question', 'text');

    if (!submission) throw new Error('Submission not found.');
    return submission;
  }

  // Helper
  isExamActive(exam) {
    const now = new Date();
    return exam.scheduledAt <= now && now <= exam.endsAt;
  }
}

module.exports = new ExamService();