import mongoose, { Document, Schema } from 'mongoose';

export interface IBook extends Document {
  title: string;
  author: string;
  isbn: string;
  category: string;
  description?: string;
  totalCopies: number;
  availableCopies: number;
  qrCode: string;
  location?: string;
  publishedYear?: number;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters'],
  },
  author: {
    type: String,
    required: [true, 'Author is required'],
    trim: true,
    maxlength: [100, 'Author name cannot be more than 100 characters'],
  },
  isbn: {
    type: String,
    required: [true, 'ISBN is required'],
    unique: true,
    trim: true,
    match: [/^(?:\d{9}[\dX]|\d{13})$/, 'Please provide a valid ISBN'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters'],
  },
  totalCopies: {
    type: Number,
    required: true,
    min: [1, 'Total copies must be at least 1'],
  },
  availableCopies: {
    type: Number,
    required: true,
    min: [0, 'Available copies cannot be negative'],
    validate: {
      validator: function(this: IBook, v: number) {
        return v <= this.totalCopies;
      },
      message: 'Available copies cannot exceed total copies',
    },
  },
  qrCode: {
    type: String,
    required: true,
    unique: true,
  },
  location: {
    type: String,
    trim: true,
  },
  publishedYear: {
    type: Number,
    min: [1000, 'Published year must be valid'],
    max: [new Date().getFullYear(), 'Published year cannot be in the future'],
  },
}, {
  timestamps: true,
});

// Indexes
BookSchema.index({ title: 'text', author: 'text' });
BookSchema.index({ category: 1 });
BookSchema.index({ isbn: 1 });
BookSchema.index({ qrCode: 1 });

export default mongoose.model<IBook>('Book', BookSchema);