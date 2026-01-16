// services/question.service.js
const Question = require('../models/Question');

class QuestionService {
  async createQuestion(questionData, creatorId) {
    const question = new Question({ ...questionData, createdBy: creatorId });
    return await question.save();
  }

  async getQuestionBank(userId, role, filters = {}) {
    const query = role === 'teacher'
      ? { $or: [{ createdBy: userId }, { sharedWith: userId }] }
      : { createdBy: userId };

    if (filters.subject) query.subject = filters.subject;
    if (filters.topic) query.topic = { $regex: filters.topic, $options: 'i' };
    if (filters.difficulty) query.difficulty = filters.difficulty;

    return await Question.find(query).populate('subject', 'name');
  }

  async getQuestionById(questionId, userId, role) {
    const question = await Question.findById(questionId).populate('subject', 'name');
    if (!question) throw new Error('Question not found.');

    if (
      question.createdBy.toString() !== userId &&
      !question.sharedWith.includes(userId) &&
      role !== 'admin'
    ) {
      throw new Error('Access denied.');
    }

    return question;
  }

  async updateQuestion(questionId, updates, userId, role) {
    const question = await Question.findById(questionId);
    if (!question) throw new Error('Question not found.');

    if (question.createdBy.toString() !== userId && role !== 'admin') {
      throw new Error('Access denied.');
    }

    Object.assign(question, updates);
    return await question.save();
  }

  async deleteQuestion(questionId, userId, role) {
    const question = await Question.findById(questionId);
    if (!question) throw new Error('Question not found.');

    if (question.createdBy.toString() !== userId && role !== 'admin') {
      throw new Error('Access denied.');
    }

    await question.deleteOne();
    return question;
  }
// Optional: Add service method
async getTeacherQuestions(teacherId) {
  return await Question.find({ createdBy: teacherId })
    .populate('subject', 'name code')
    .sort({ createdAt: -1 });
}
  async shareQuestion(questionId, teacherIds, userId) {
    const question = await Question.findById(questionId);
    if (!question) throw new Error('Question not found.');

    if (question.createdBy.toString() !== userId) {
      throw new Error('Only owner can share.');
    }

    question.sharedWith = [...new Set([...question.sharedWith, ...teacherIds])];
    return await question.save();
  }

  // Placeholder methods
  async importQuestions(file) {
    throw new Error('Import not implemented.');
  }

  async exportQuestions(filters) {
    throw new Error('Export not implemented.');
  }
}

module.exports = new QuestionService();