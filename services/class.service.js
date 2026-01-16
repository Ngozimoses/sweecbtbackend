// services/class.service.js
const Class = require('../models/Class');
const User = require('../models/User');
const Subject = require('../models/Subject'); 
const teacherID = require('../models/Subject'); 
class ClassService {
// services/class.service.js
async getAllClasses(filters = {}) {
  const query = {};
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { code: { $regex: filters.search, $options: 'i' } }
    ];
  }
  if (filters.status) query.status = filters.status;

  // Use aggregation to add studentCount
  const pipeline = [
    { $match: query },
    {
      $addFields: {
        studentCount: { $size: { $ifNull: ["$students", []] } }
      }
    },
    { $skip: (filters.page - 1) * filters.limit },
    { $limit: filters.limit }
  ];

  const classes = await Class.aggregate(pipeline);
  const total = await Class.countDocuments(query);

  return { classes, total };
}
  async createClass(classData) {
    const cls = new Class(classData);
    return await cls.save();
  }

  async getClassById(id) {
    const cls = await Class.findById(id)
      .populate('teacher', 'name email')
      .populate('students', 'name email');
    if (!cls) throw new Error('Class not found.');
    return cls;
  }
// Add these methods
async getClassSubjects(classId) {
  const cls = await Class.findById(classId)
    .populate('subjects.subject', 'name code')
    .populate('subjects.teacher', 'name email');
  
  if (!cls) throw new Error('Class not found.');
  
  return cls.subjects || [];
}

async assignSubjectToClass(classId, subjectId, teacherId = null) {
  // Validate subject exists
  const subject = await Subject.findById(subjectId);
  if (!subject) throw new Error('Subject not found.');
  
  // Validate teacher (if provided)
  if (teacherID) {
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      throw new Error('Invalid teacher ID.');
    }
  }
  
  const cls = await Class.findById(classId);
  if (!cls) throw new Error('Class not found.');
  
  // Check for duplicate subject
  const existing = cls.subjects.find(s => s.subject.toString() === subjectId);
  if (existing) throw new Error('Subject already assigned to this class.');
  
  cls.subjects.push({ subject: subjectId, teacher: teacherId });
  await cls.save();
  
  return await Class.findById(classId)
    .populate('subjects.subject', 'name code')
    .populate('subjects.teacher', 'name email')
    .select('subjects -_id')
    .then(doc => doc.subjects[doc.subjects.length - 1]);
}

async removeSubjectFromClass(classId, subjectId) {
  const result = await Class.updateOne(
    { _id: classId },
    { $pull: { subjects: { subject: subjectId } } }
  );
  
  if (result.modifiedCount === 0) {
    throw new Error('Class or subject not found.');
  }
  
  return { message: 'Subject removed from class' };
}
  async updateClass(id, updates) {
    const cls = await Class.findByIdAndUpdate(id, updates, { new: true });
    if (!cls) throw new Error('Class not found.');
    return cls;
  }

  async deleteClass(id) {
    const cls = await Class.findByIdAndDelete(id);
    if (!cls) throw new Error('Class not found.');
    return cls;
  }

  async assignTeacher(classId, teacherId) {
    // Validate teacher
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      throw new Error('Assigned user must be a teacher.');
    }

    const cls = await Class.findByIdAndUpdate(
      classId,
      { teacher: teacherId },
      { new: true }
    ).populate('teacher', 'name');
    if (!cls) throw new Error('Class not found.');
    return cls;
  }

// Add these methods to your class service

/**
 * Enroll multiple students into a class
 * @param {string} classId - Class ID
 * @param {string[]} studentIds - Array of student IDs
 */
async enrollStudents(classId, studentIds) {
  // Validate all students exist and are students
  const students = await User.find({
    _id: { $in: studentIds },
    role: 'student'
  });

  if (students.length !== studentIds.length) {
    const invalidIds = studentIds.filter(id => 
      !students.some(s => s._id.toString() === id)
    );
    throw new Error(`Invalid student IDs: ${invalidIds.join(', ')}`);
  }

  // Add students to class (no duplicates)
  await Class.findByIdAndUpdate(classId, {
    $addToSet: { students: { $each: studentIds } }
  });

  return { message: 'Students enrolled successfully' };
}

/**
 * Remove students from a class
 * @param {string} classId - Class ID
 * @param {string[]} studentIds - Array of student IDs to remove
 */
async unenrollStudents(classId, studentIds) {
  // Validate class exists
  const cls = await Class.findById(classId);
  if (!cls) throw new Error('Class not found.');

  // Remove students from class
  await Class.findByIdAndUpdate(classId, {
    $pull: { students: { $in: studentIds } }
  });

  return { message: 'Students removed from class' };
}
}

module.exports = new ClassService();