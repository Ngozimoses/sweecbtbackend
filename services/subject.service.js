// services/subject.service.js
const Subject = require('../models/Subject');

class SubjectService {
  async getAllSubjects() {
    return await Subject.find();
  }

  async createSubject(subjectData) {
    const subject = new Subject(subjectData);
    return await subject.save();
  }

  async getSubjectById(id) {
    const subject = await Subject.findById(id);
    if (!subject) throw new Error('Subject not found.');
    return subject;
  }

  async updateSubject(id, updates) {
    const subject = await Subject.findByIdAndUpdate(id, updates, { new: true });
    if (!subject) throw new Error('Subject not found.');
    return subject;
  }

// Update deleteSubject to prevent deletion of assigned subjects
async deleteSubject(id) {
  // Check if subject is assigned to any class
  const classWithSubject = await Class.findOne({ 'subjects.subject': id });
  if (classWithSubject) {
    throw new Error('Cannot delete subject: it is assigned to one or more classes.');
  }
  
  const subject = await Subject.findByIdAndDelete(id);
  if (!subject) throw new Error('Subject not found.');
  return subject;
}
}

module.exports = new SubjectService();