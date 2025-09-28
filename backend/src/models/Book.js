const mongoose = require('mongoose');
const { Schema } = mongoose;

const BookSchema = new Schema({
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
      validator: function (v) {
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
  // Digital library fields
  isDigital: {
    type: Boolean,
    default: false,
  },
  digitalFile: {
    url: {
      type: String,
      trim: true,
    },
    format: {
      type: String,
      enum: ['pdf', 'epub', 'mobi', 'txt'],
    },
    size: {
      type: Number, // in bytes
    },
    pages: {
      type: Number,
    },
  },
  language: {
    type: String,
    default: 'English',
    trim: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  rating: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  coverImage: {
    type: String,
    trim: true,
  },
  publisher: {
    type: String,
    trim: true,
  },
  edition: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Indexes
BookSchema.index({ title: 'text', author: 'text', description: 'text', tags: 'text' });
BookSchema.index({ category: 1 });
BookSchema.index({ isbn: 1 });
BookSchema.index({ qrCode: 1 });
BookSchema.index({ isDigital: 1 });
BookSchema.index({ language: 1 });
BookSchema.index({ tags: 1 });
BookSchema.index({ 'rating.average': -1 });
BookSchema.index({ publishedYear: -1 });
BookSchema.index({ publisher: 1 });

module.exports = mongoose.model('Book', BookSchema);