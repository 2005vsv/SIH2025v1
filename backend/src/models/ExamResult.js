const mongoose = require('mongoose');
const { Schema } = mongoose;

const ExamResultSchema = new Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: [true, 'Exam ID is required'],
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required'],
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required'],
  },
  semesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: [true, 'Semester ID is required'],
  },
  attemptNumber: {
    type: Number,
    default: 1,
    min: 1,
  },
  startedAt: {
    type: Date,
  },
  submittedAt: {
    type: Date,
  },
  timeSpent: {
    type: Number, // in minutes
    min: 0,
  },
  marksObtained: {
    type: Number,
    min: 0,
  },
  maxMarks: {
    type: Number,
    min: 1,
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100,
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'],
  },
  gradePoint: {
    type: Number,
    min: 0,
    max: 10,
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'submitted', 'evaluated', 'absent', 'cancelled'],
    default: 'not_started',
  },
  attendance: {
    type: String,
    enum: ['present', 'absent', 'late'],
    default: 'present',
  },
  answers: [{
    questionId: {
      type: Number,
      required: true,
    },
    answer: {
      type: mongoose.Schema.Types.Mixed, // Can be string, array, or object
    },
    isCorrect: {
      type: Boolean,
    },
    marksAwarded: {
      type: Number,
      min: 0,
    },
    timeSpent: {
      type: Number, // in seconds
      min: 0,
    },
    attempts: {
      type: Number,
      default: 1,
      min: 1,
    },
    answeredAt: {
      type: Date,
    },
  }],
  proctoringData: {
    tabSwitches: {
      type: Number,
      default: 0,
    },
    faceDetectionFailures: {
      type: Number,
      default: 0,
    },
    suspiciousActivities: [{
      type: {
        type: String,
        enum: ['tab_switch', 'face_not_detected', 'multiple_faces', 'screen_share', 'copy_paste'],
      },
      timestamp: Date,
      description: String,
    }],
    webcamSnapshots: [{
      timestamp: Date,
      imageUrl: String,
    }],
    screenSnapshots: [{
      timestamp: Date,
      imageUrl: String,
    }],
  },
  ipAddress: {
    type: String,
    trim: true,
  },
  userAgent: {
    type: String,
    trim: true,
  },
  browserInfo: {
    name: String,
    version: String,
    platform: String,
  },
  remarks: {
    type: String,
    trim: true,
  },
  evaluatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  evaluatedAt: {
    type: Date,
  },
  // For detailed scoring (if needed)
  sectionScores: [{
    sectionName: {
      type: String,
      required: true,
    },
    marksObtained: {
      type: Number,
      min: 0,
    },
    maxMarks: {
      type: Number,
      min: 1,
    },
  }],
}, {
  timestamps: true,
});

// Compound index to ensure unique result per student per exam
ExamResultSchema.index({ examId: 1, studentId: 1 }, { unique: true });

// Index for better performance
ExamResultSchema.index({ studentId: 1 });
ExamResultSchema.index({ courseId: 1 });
ExamResultSchema.index({ semesterId: 1 });
ExamResultSchema.index({ status: 1 });

// Calculate percentage, grade, and grade point before saving
ExamResultSchema.pre('save', function(next) {
  // Calculate percentage
  if (this.marksObtained !== undefined && this.maxMarks > 0) {
    this.percentage = Math.round((this.marksObtained / this.maxMarks) * 100 * 100) / 100;
  }

  // Calculate grade and grade point
  this.calculateGradeAndGradePoint();

  // Set status based on marks
  if (this.attendance === 'absent') {
    this.status = 'absent';
  } else {
    const passingMarks = this.examId?.passingMarks || (this.maxMarks * 0.4); // Default 40% passing
    this.status = this.marksObtained >= passingMarks ? 'pass' : 'fail';
  }

  next();
});

// Method to calculate grade and grade point
ExamResultSchema.methods.calculateGradeAndGradePoint = function() {
  const percentage = this.percentage || 0;

  if (percentage >= 90) {
    this.grade = 'A+';
    this.gradePoint = 10;
  } else if (percentage >= 85) {
    this.grade = 'A';
    this.gradePoint = 9;
  } else if (percentage >= 80) {
    this.grade = 'A-';
    this.gradePoint = 8;
  } else if (percentage >= 75) {
    this.grade = 'B+';
    this.gradePoint = 7;
  } else if (percentage >= 70) {
    this.grade = 'B';
    this.gradePoint = 6;
  } else if (percentage >= 65) {
    this.grade = 'B-';
    this.gradePoint = 5;
  } else if (percentage >= 60) {
    this.grade = 'C+';
    this.gradePoint = 4;
  } else if (percentage >= 55) {
    this.grade = 'C';
    this.gradePoint = 3;
  } else if (percentage >= 50) {
    this.grade = 'C-';
    this.gradePoint = 2;
  } else if (percentage >= 40) {
    this.grade = 'D';
    this.gradePoint = 1;
  } else {
    this.grade = 'F';
    this.gradePoint = 0;
  }
};

// Static method to get exam statistics
ExamResultSchema.statics.getExamStatistics = function(examId) {
  return this.aggregate([
    { $match: { examId: mongoose.Types.ObjectId(examId) } },
    {
      $group: {
        _id: null,
        totalStudents: { $sum: 1 },
        presentStudents: {
          $sum: { $cond: [{ $ne: ['$attendance', 'absent'] }, 1, 0] }
        },
        passedStudents: {
          $sum: { $cond: [{ $eq: ['$status', 'pass'] }, 1, 0] }
        },
        failedStudents: {
          $sum: { $cond: [{ $eq: ['$status', 'fail'] }, 1, 0] }
        },
        absentStudents: {
          $sum: { $cond: [{ $eq: ['$attendance', 'absent'] }, 1, 0] }
        },
        averageMarks: { $avg: '$marksObtained' },
        highestMarks: { $max: '$marksObtained' },
        lowestMarks: { $min: '$marksObtained' },
      }
    }
  ]);
};

// Static method to get student performance in a semester
ExamResultSchema.statics.getStudentSemesterPerformance = function(studentId, semesterId) {
  return this.aggregate([
    {
      $match: {
        studentId: mongoose.Types.ObjectId(studentId),
        semesterId: mongoose.Types.ObjectId(semesterId)
      }
    },
    {
      $lookup: {
        from: 'exams',
        localField: 'examId',
        foreignField: '_id',
        as: 'exam'
      }
    },
    {
      $lookup: {
        from: 'courses',
        localField: 'courseId',
        foreignField: '_id',
        as: 'course'
      }
    },
    {
      $project: {
        courseName: { $arrayElemAt: ['$course.name', 0] },
        courseCode: { $arrayElemAt: ['$course.code', 0] },
        examType: { $arrayElemAt: ['$exam.examType', 0] },
        marksObtained: 1,
        maxMarks: 1,
        percentage: 1,
        grade: 1,
        gradePoint: 1,
        status: 1,
      }
    }
  ]);
};

module.exports = mongoose.model('ExamResult', ExamResultSchema);