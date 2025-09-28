const mongoose = require('mongoose');
const { Schema } = mongoose;

const GradeSchema = new Schema({
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
  // Configurable grade components
  components: [{
    name: {
      type: String,
      required: true,
      enum: ['midterm', 'final', 'practical', 'quiz', 'assignment', 'project', 'attendance'],
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    maxScore: {
      type: Number,
      required: true,
      min: 0,
    },
  }],
  // Calculated fields
  totalScore: {
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
    enum: ['incomplete', 'graded', 'published'],
    default: 'incomplete',
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  gradedAt: {
    type: Date,
  },
  remarks: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Compound index to ensure unique grade per student per course per semester
GradeSchema.index({ studentId: 1, courseId: 1, semesterId: 1 }, { unique: true });

// Index for better performance
GradeSchema.index({ courseId: 1 });
GradeSchema.index({ semesterId: 1 });
GradeSchema.index({ studentId: 1 });
GradeSchema.index({ status: 1 });

// Calculate total score and grade before saving
GradeSchema.pre('save', function(next) {
  if (this.components && this.components.length > 0) {
    // Calculate weighted total score
    let totalWeightedScore = 0;
    let totalWeight = 0;

    this.components.forEach(component => {
      if (component.score !== undefined && component.maxScore > 0) {
        const percentage = (component.score / component.maxScore) * 100;
        totalWeightedScore += (percentage * component.weight) / 100;
        totalWeight += component.weight;
      }
    });

    this.totalScore = totalWeight > 0 ? Math.round(totalWeightedScore * 100) / 100 : 0;

    // Calculate grade and grade point
    this.calculateGradeAndGradePoint();
  }
  next();
});

// Method to calculate grade and grade point
GradeSchema.methods.calculateGradeAndGradePoint = function() {
  const score = this.totalScore;

  if (score >= 90) {
    this.grade = 'A+';
    this.gradePoint = 10;
  } else if (score >= 85) {
    this.grade = 'A';
    this.gradePoint = 9;
  } else if (score >= 80) {
    this.grade = 'A-';
    this.gradePoint = 8;
  } else if (score >= 75) {
    this.grade = 'B+';
    this.gradePoint = 7;
  } else if (score >= 70) {
    this.grade = 'B';
    this.gradePoint = 6;
  } else if (score >= 65) {
    this.grade = 'B-';
    this.gradePoint = 5;
  } else if (score >= 60) {
    this.grade = 'C+';
    this.gradePoint = 4;
  } else if (score >= 55) {
    this.grade = 'C';
    this.gradePoint = 3;
  } else if (score >= 50) {
    this.grade = 'C-';
    this.gradePoint = 2;
  } else if (score >= 40) {
    this.grade = 'D';
    this.gradePoint = 1;
  } else {
    this.grade = 'F';
    this.gradePoint = 0;
  }
};

// Static method to calculate SGPA for a semester
GradeSchema.statics.calculateSGPA = function(grades) {
  if (!grades || grades.length === 0) return 0;

  let totalGradePoints = 0;
  let totalCredits = 0;

  grades.forEach(grade => {
    if (grade.courseId && grade.courseId.credits) {
      totalGradePoints += grade.gradePoint * grade.courseId.credits;
      totalCredits += grade.courseId.credits;
    }
  });

  return totalCredits > 0 ? Math.round((totalGradePoints / totalCredits) * 100) / 100 : 0;
};

// Static method to calculate CGPA
GradeSchema.statics.calculateCGPA = function(allGrades) {
  if (!allGrades || allGrades.length === 0) return 0;

  const semesterGrades = {};

  allGrades.forEach(grade => {
    if (!semesterGrades[grade.semesterId]) {
      semesterGrades[grade.semesterId] = [];
    }
    semesterGrades[grade.semesterId].push(grade);
  });

  let totalGradePoints = 0;
  let totalCredits = 0;

  Object.values(semesterGrades).forEach(semesterGradeList => {
    const sgpa = this.calculateSGPA(semesterGradeList);
    const semesterCredits = semesterGradeList.reduce((sum, grade) =>
      sum + (grade.courseId?.credits || 0), 0
    );

    totalGradePoints += sgpa * semesterCredits;
    totalCredits += semesterCredits;
  });

  return totalCredits > 0 ? Math.round((totalGradePoints / totalCredits) * 100) / 100 : 0;
};

module.exports = mongoose.model('Grade', GradeSchema);