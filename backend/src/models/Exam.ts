import mongoose, { Document, Schema } from 'mongoose';

export interface IExam extends Document {
  name: string;
  code: string;
  subject: string;
  department: string;
  semester: number;
  examType: 'mid_term' | 'final' | 'quiz' | 'assignment' | 'practical';
  date: Date;
  duration: number; // in minutes
  totalMarks: number;
  passingMarks: number;
  venue?: string;
  instructions?: string;
  syllabus?: string[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExamSchema = new Schema<IExam>({
  name: {
    type: String,
    required: [true, 'Exam name is required'],
    trim: true,
    maxlength: [200, 'Exam name cannot exceed 200 characters'],
  },
  code: {
    type: String,
    required: [true, 'Exam code is required'],
    unique: true,
    trim: true,
    uppercase: true,
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
  },
  semester: {
    type: Number,
    required: [true, 'Semester is required'],
    min: [1, 'Semester must be at least 1'],
    max: [8, 'Semester cannot exceed 8'],
  },
  examType: {
    type: String,
    required: true,
    enum: ['mid_term', 'final', 'quiz', 'assignment', 'practical'],
  },
  date: {
    type: Date,
    required: [true, 'Exam date is required'],
    index: true,
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [15, 'Duration must be at least 15 minutes'],
    max: [480, 'Duration cannot exceed 480 minutes'],
  },
  totalMarks: {
    type: Number,
    required: [true, 'Total marks is required'],
    min: [1, 'Total marks must be positive'],
  },
  passingMarks: {
    type: Number,
    required: [true, 'Passing marks is required'],
    min: [0, 'Passing marks cannot be negative'],
    validate: {
      validator: function(this: IExam, value: number) {
        return value <= this.totalMarks;
      },
      message: 'Passing marks cannot exceed total marks',
    },
  },
  venue: {
    type: String,
    trim: true,
  },
  instructions: {
    type: String,
    trim: true,
  },
  syllabus: [{
    type: String,
    trim: true,
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

ExamSchema.index({ department: 1, semester: 1 });
ExamSchema.index({ date: 1, isActive: 1 });
ExamSchema.index({ examType: 1, date: 1 });

export default mongoose.model<IExam>('Exam', ExamSchema);