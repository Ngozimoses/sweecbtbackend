// models/Class.js
const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Class name is required'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Class code is required'],
    uppercase: true,
    match: [/^[A-Z0-9]{3,10}$/, 'Code must be 3-10 uppercase letters/numbers']
  },
  teacher: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A teacher must be assigned'],
    validate: {
      validator: async function(teacherId) {
        const teacher = await mongoose.model('User').findById(teacherId);
        return teacher && teacher.role === 'teacher';
      },
      message: 'Assigned user must be a teacher'
    }
  },
  students: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    validate: {
      validator: async function(studentId) {
        const student = await mongoose.model('User').findById(studentId);
        return student && student.role === 'student';
      },
      message: 'Only students can be enrolled'
    }
  }],
  
  // ✅ Class-Subject-Teacher assignments (CORRECT STRUCTURE)
  subjects: [{
    subject: {
      type: mongoose.Schema.ObjectId,
      ref: 'Subject',
      required: true
    },
    teacher: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      validate: {
        validator: async function(teacherId) {
          if (!teacherId) return true; // Optional subject teacher
          const teacher = await mongoose.model('User').findById(teacherId);
          return teacher && teacher.role === 'teacher';
        },
        message: 'Assigned user must be a teacher'
      }
    }
  }]
}, {
  timestamps: true
});

// 🔑 Critical: Compound unique index on name + code
ClassSchema.index({ name: 1, code: 1 }, { unique: true });

// Performance indexes
ClassSchema.index({ code: 1 });
ClassSchema.index({ teacher: 1 });
ClassSchema.index({ 'subjects.subject': 1 }); // ✅ Index for subject lookups

module.exports = mongoose.model('Class', ClassSchema);