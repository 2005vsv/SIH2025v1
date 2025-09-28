const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReadingProgressSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  bookId: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book ID is required'],
    index: true,
  },
  currentPage: {
    type: Number,
    default: 0,
    min: [0, 'Current page cannot be negative'],
  },
  totalPages: {
    type: Number,
    required: [true, 'Total pages is required'],
    min: [1, 'Total pages must be at least 1'],
  },
  progressPercentage: {
    type: Number,
    default: 0,
    min: [0, 'Progress cannot be negative'],
    max: [100, 'Progress cannot exceed 100%'],
  },
  readingTime: {
    type: Number, // in minutes
    default: 0,
    min: [0, 'Reading time cannot be negative'],
  },
  lastReadAt: {
    type: Date,
    default: Date.now,
  },
  bookmarks: [{
    page: {
      type: Number,
      required: true,
      min: [1, 'Page must be positive'],
    },
    note: {
      type: String,
      trim: true,
      maxlength: [500, 'Note cannot exceed 500 characters'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  isCompleted: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
  },
  review: {
    type: String,
    trim: true,
    maxlength: [1000, 'Review cannot exceed 1000 characters'],
  },
}, {
  timestamps: true,
});

// Compound indexes for better query performance
ReadingProgressSchema.index({ userId: 1, bookId: 1 }, { unique: true });
ReadingProgressSchema.index({ userId: 1, isCompleted: 1 });
ReadingProgressSchema.index({ userId: 1, lastReadAt: -1 });
ReadingProgressSchema.index({ bookId: 1, isCompleted: 1 });

// Pre-save middleware to calculate progress percentage
ReadingProgressSchema.pre('save', function (next) {
  if (this.isModified('currentPage') || this.isModified('totalPages')) {
    this.progressPercentage = Math.round((this.currentPage / this.totalPages) * 100);
  }

  if (this.isModified('isCompleted') && this.isCompleted && !this.completedAt) {
    this.completedAt = new Date();
  }

  next();
});

// Virtual for remaining pages
ReadingProgressSchema.virtual('remainingPages').get(function () {
  return this.totalPages - this.currentPage;
});

// Virtual for estimated time to complete (based on reading speed)
ReadingProgressSchema.virtual('estimatedTimeToComplete').get(function () {
  const avgPagesPerMinute = 2; // Assume 2 pages per minute reading speed
  return Math.ceil(this.remainingPages / avgPagesPerMinute);
});

// Method to update reading progress
ReadingProgressSchema.methods.updateProgress = function (page, readingTime = 0) {
  this.currentPage = Math.min(page, this.totalPages);
  this.readingTime += readingTime;
  this.lastReadAt = new Date();

  if (this.currentPage >= this.totalPages) {
    this.isCompleted = true;
  }

  return this.save();
};

// Method to add bookmark
ReadingProgressSchema.methods.addBookmark = function (page, note = '') {
  // Remove existing bookmark on same page
  this.bookmarks = this.bookmarks.filter(bookmark => bookmark.page !== page);

  this.bookmarks.push({
    page,
    note,
    createdAt: new Date(),
  });

  return this.save();
};

// Method to remove bookmark
ReadingProgressSchema.methods.removeBookmark = function (page) {
  this.bookmarks = this.bookmarks.filter(bookmark => bookmark.page !== page);
  return this.save();
};

// Static method to get user's reading statistics
ReadingProgressSchema.statics.getUserStats = function (userId) {
  return this.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        totalBooks: { $sum: 1 },
        completedBooks: {
          $sum: { $cond: [{ $eq: ['$isCompleted', true] }, 1, 0] },
        },
        totalReadingTime: { $sum: '$readingTime' },
        averageRating: { $avg: '$rating' },
        totalPagesRead: { $sum: '$currentPage' },
      },
    },
  ]);
};

// Static method to get book reading statistics
ReadingProgressSchema.statics.getBookStats = function (bookId) {
  return this.aggregate([
    { $match: { bookId } },
    {
      $group: {
        _id: null,
        totalReaders: { $sum: 1 },
        completedReaders: {
          $sum: { $cond: [{ $eq: ['$isCompleted', true] }, 1, 0] },
        },
        averageRating: { $avg: '$rating' },
        averageProgress: { $avg: '$progressPercentage' },
      },
    },
  ]);
};

module.exports = mongoose.model('ReadingProgress', ReadingProgressSchema);