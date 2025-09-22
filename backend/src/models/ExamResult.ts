import mongoose, { Document, Schema } from 'mongoose';

export interface IExamResult extends Document {
  userId: mongoose.Types.ObjectId;
  examId: mongoose.Types.ObjectId;
  marksObtained: number;
  grade: string;
  percentage: number;
  rank?: number;
  remarks?: string;
  isPublished: boolean;
  publishedAt?: Date;
  publishedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExamResultSchema = new Schema<IExamResult>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  examId: {
    type: Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
    index: true,
  },
  marksObtained: {
    type: Number,
    required: [true, 'Marks obtained is required'],
    min: [0, 'Marks cannot be negative'],
  },
  grade: {
    type: String,
    required: true,
    enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
  },
  percentage: {
    type: Number,
    required: true,
    min: [0, 'Percentage cannot be negative'],
    max: [100, 'Percentage cannot exceed 100'],
  },
  rank: {
    type: Number,
    min: [1, 'Rank must be positive'],
  },
  remarks: {
    type: String,
    trim: true,
    maxlength: [500, 'Remarks cannot exceed 500 characters'],
  },
  isPublished: {
    type: Boolean,
    default: false,
    index: true,
  },
  publishedAt: {
    type: Date,
  },
  publishedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

ExamResultSchema.index({ userId: 1, examId: 1 }, { unique: true });
ExamResultSchema.index({ examId: 1, percentage: -1 });

export default mongoose.model<IExamResult>('ExamResult', ExamResultSchema);