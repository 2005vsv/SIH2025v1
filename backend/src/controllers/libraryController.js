const QRCode = require('qrcode');
const Book = require('../models/Book');
const BorrowRecord = require('../models/BorrowRecord');
const ReadingProgress = require('../models/ReadingProgress');

// Get all books with advanced search
exports.getBooks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      author,
      availability,
      isDigital,
      language,
      tags,
      publisher,
      minRating,
      maxRating,
      publishedAfter,
      publishedBefore,
      sortBy = 'title',
      sortOrder = 'asc'
    } = req.query;

    const query = {};

    // Advanced text search
    if (search) {
      query.$text = { $search: search };
    }

    // Exact match filters
    if (category) query.category = category;
    if (author) query.author = { $regex: author, $options: 'i' };
    if (isDigital !== undefined) query.isDigital = isDigital === 'true';
    if (language) query.language = language;
    if (publisher) query.publisher = { $regex: publisher, $options: 'i' };

    // Tag search
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Availability filter
    if (availability) {
      if (availability === 'available') {
        query.availableCopies = { $gt: 0 };
      } else if (availability === 'unavailable') {
        query.availableCopies = { $eq: 0 };
      }
    }

    // Rating filters
    if (minRating || maxRating) {
      query['rating.average'] = {};
      if (minRating) query['rating.average'].$gte = parseFloat(minRating);
      if (maxRating) query['rating.average'].$lte = parseFloat(maxRating);
    }

    // Publication year filters
    if (publishedAfter || publishedBefore) {
      query.publishedYear = {};
      if (publishedAfter) query.publishedYear.$gte = parseInt(publishedAfter);
      if (publishedBefore) query.publishedYear.$lte = parseInt(publishedBefore);
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: {},
    };

    // Dynamic sorting
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    switch (sortBy) {
      case 'title':
        options.sort.title = sortDirection;
        break;
      case 'author':
        options.sort.author = sortDirection;
        break;
      case 'publishedYear':
        options.sort.publishedYear = sortDirection;
        break;
      case 'rating':
        options.sort['rating.average'] = sortDirection;
        break;
      case 'popularity':
        options.sort['rating.count'] = sortDirection;
        break;
      default:
        options.sort.title = 1;
    }

    const books = await Book.find(query)
      .sort(options.sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit);

    const total = await Book.countDocuments(query);

    res.json({
      success: true,
      data: {
        books,
        pagination: {
          current: options.page,
          pages: Math.ceil(total / options.limit),
          total,
          limit: options.limit,
        },
        filters: {
          applied: Object.keys(query).length > 0,
          query: process.env.NODE_ENV === 'development' ? query : undefined,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch books',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Get book by ID
exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findById(id);

    if (!book) {
      res.status(404).json({
        success: false,
        message: 'Book not found',
      });
      return;
    }

    res.json({
      success: true,
      data: { book },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch book',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Create book (Admin only)
exports.createBook = async (req, res) => {
  try {
    // Debug: log the incoming request body
    console.log('CreateBook req.body:', req.body);

    // Basic validation: check required fields
    const { title, author, isbn, category, totalCopies } = req.body;
    if (!title || !author || !isbn || !category || !totalCopies) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, author, isbn, category, totalCopies',
      });
    }

    const book = new Book(req.body);
    await book.save();

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: { book },
    });
  } catch (error) {
    // Log the error for debugging
    console.error('CreateBook error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create book',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Update book (Admin only)
exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!book) {
      res.status(404).json({
        success: false,
        message: 'Book not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Book updated successfully',
      data: { book },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update book',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Delete book (Admin only)
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findByIdAndDelete(id);

    if (!book) {
      res.status(404).json({
        success: false,
        message: 'Book not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Book deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete book',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Borrow book
exports.borrowBook = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user && req.user.id;

    const book = await Book.findById(id);

    if (!book) {
      res.status(404).json({
        success: false,
        message: 'Book not found',
      });
      return;
    }

    if (book.availableCopies <= 0) {
      res.status(400).json({
        success: false,
        message: 'Book is not available for borrowing',
      });
      return;
    }

    // Check if user already has this book borrowed
    const existingBorrow = await BorrowRecord.findOne({
      userId,
      bookId: id,
      status: 'borrowed',
    });

    if (existingBorrow) {
      res.status(400).json({
        success: false,
        message: 'You have already borrowed this book',
      });
      return;
    }

    // Create borrow record
    const borrowRecord = new BorrowRecord({
      userId,
      bookId: id,
      borrowDate: new Date(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      status: 'borrowed',
    });

    await borrowRecord.save();

    // Update book available copies
    book.availableCopies -= 1;
    await book.save();

    await borrowRecord.populate([
      { path: 'bookId', select: 'title author isbn' },
      { path: 'userId', select: 'name email' }
    ]);

    res.json({
      success: true,
      message: 'Book borrowed successfully',
      data: { borrowRecord },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to borrow book',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Return book
exports.returnBook = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user && req.user.id;

    const borrowRecord = await BorrowRecord.findOne({
      _id: id,
      userId,
      status: 'borrowed',
    }).populate('bookId');

    if (!borrowRecord) {
      res.status(404).json({
        success: false,
        message: 'Borrow record not found or book already returned',
      });
      return;
    }

    // Update borrow record
    borrowRecord.status = 'returned';
    borrowRecord.returnDate = new Date();
    await borrowRecord.save();

    // Update book available copies
    const book = await Book.findById(borrowRecord.bookId);
    if (book) {
      book.availableCopies += 1;
      await book.save();
    }

    res.json({
      success: true,
      message: 'Book returned successfully',
      data: { borrowRecord },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to return book',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Get user's borrow history
exports.getBorrowHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const isAdmin = req.user && req.user.role === 'admin';
    const userId = req.user && req.user.id;

    const query = {};

    // Students can only see their own records
    if (!isAdmin) {
      query.userId = userId;
    }

    if (status) query.status = status;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: '-borrowDate',
      populate: [
        { path: 'bookId', select: 'title author isbn' },
        ...(isAdmin ? [{ path: 'userId', select: 'name email studentId' }] : [])
      ],
    };

    const borrowRecords = await BorrowRecord.find(query)
      .populate(options.populate)
      .sort(options.sort)
      .limit(options.limit)
      .skip((options.page - 1) * options.limit);

    const total = await BorrowRecord.countDocuments(query);

    res.json({
      success: true,
      data: {
        borrowRecords,
        pagination: {
          current: options.page,
          pages: Math.ceil(total / options.limit),
          total,
          limit: options.limit,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch borrow history',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Get library statistics
exports.getLibraryStats = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const availableBooks = await Book.countDocuments({ availableCopies: { $gt: 0 } });
    const borrowedBooks = await BorrowRecord.countDocuments({ status: 'borrowed' });
    const overdueBooks = await BorrowRecord.countDocuments({
      status: 'borrowed',
      dueDate: { $lt: new Date() },
    });

    const popularBooks = await BorrowRecord.aggregate([
      { $match: { status: 'borrowed' } },
      { $group: { _id: '$bookId', borrowCount: { $sum: 1 } } },
      { $sort: { borrowCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'books',
          localField: '_id',
          foreignField: '_id',
          as: 'book',
        },
      },
      { $unwind: '$book' },
      {
        $project: {
          title: '$book.title',
          author: '$book.author',
          borrowCount: 1,
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        totalBooks,
        availableBooks,
        borrowedBooks,
        overdueBooks,
        popularBooks,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch library statistics',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

exports.getBookQR = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    if (!book) {
      res.status(404).json({ success: false, message: 'Book not found' });
      return;
    }
    const qrData = JSON.stringify({ bookId: book._id, title: book.title, isbn: book.isbn });
    const qrImage = await QRCode.toDataURL(qrData);
    res.json({ success: true, data: { qrImage } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to generate QR code', error: process.env.NODE_ENV === 'development' ? error : undefined });
  }
};

// Digital Library Features

// Start reading a digital book
exports.startReading = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user && req.user.id;

    const book = await Book.findById(bookId);
    if (!book || !book.isDigital) {
      return res.status(404).json({
        success: false,
        message: 'Digital book not found',
      });
    }

    let progress = await ReadingProgress.findOne({ userId, bookId });

    if (!progress) {
      progress = new ReadingProgress({
        userId,
        bookId,
        totalPages: book.digitalFile?.pages || 1,
      });
      await progress.save();
    }

    res.json({
      success: true,
      message: 'Reading session started',
      data: { progress },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to start reading',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Update reading progress
exports.updateReadingProgress = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { currentPage, readingTime } = req.body;
    const userId = req.user && req.user.id;

    let progress = await ReadingProgress.findOne({ userId, bookId });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Reading progress not found. Start reading first.',
      });
    }

    await progress.updateProgress(currentPage, readingTime);

    res.json({
      success: true,
      message: 'Reading progress updated',
      data: { progress },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update reading progress',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Add bookmark
exports.addBookmark = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { page, note } = req.body;
    const userId = req.user && req.user.id;

    let progress = await ReadingProgress.findOne({ userId, bookId });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Reading progress not found',
      });
    }

    await progress.addBookmark(page, note);

    res.json({
      success: true,
      message: 'Bookmark added successfully',
      data: { progress },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add bookmark',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Remove bookmark
exports.removeBookmark = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { page } = req.body;
    const userId = req.user && req.user.id;

    const progress = await ReadingProgress.findOne({ userId, bookId });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Reading progress not found',
      });
    }

    await progress.removeBookmark(page);

    res.json({
      success: true,
      message: 'Bookmark removed successfully',
      data: { progress },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to remove bookmark',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Get user's reading progress
exports.getReadingProgress = async (req, res) => {
  try {
    const { bookId } = req.params;
    const userId = req.user && req.user.id;

    const progress = await ReadingProgress.findOne({ userId, bookId })
      .populate('bookId', 'title author coverImage');

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Reading progress not found',
      });
    }

    res.json({
      success: true,
      data: { progress },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reading progress',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Get user's reading history
exports.getReadingHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const userId = req.user && req.user.id;

    const query = { userId };
    if (status) query.isCompleted = status === 'completed';

    const progress = await ReadingProgress.find(query)
      .populate('bookId', 'title author coverImage category rating')
      .sort('-lastReadAt')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await ReadingProgress.countDocuments(query);

    res.json({
      success: true,
      data: {
        progress,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reading history',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Rate and review a book
exports.rateBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { rating, review } = req.body;
    const userId = req.user && req.user.id;

    let progress = await ReadingProgress.findOne({ userId, bookId });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Reading progress not found',
      });
    }

    progress.rating = rating;
    progress.review = review;
    await progress.save();

    // Update book's average rating
    const allRatings = await ReadingProgress.find({ bookId, rating: { $exists: true } });
    const avgRating = allRatings.reduce((sum, p) => sum + p.rating, 0) / allRatings.length;

    await Book.findByIdAndUpdate(bookId, {
      'rating.average': Math.round(avgRating * 10) / 10,
      'rating.count': allRatings.length,
    });

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      data: { progress },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit rating',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Get book recommendations
exports.getRecommendations = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const userId = req.user && req.user.id;

    // Get user's reading history and preferences
    const userProgress = await ReadingProgress.find({ userId })
      .populate('bookId', 'category tags author')
      .sort('-lastReadAt')
      .limit(20);

    const preferredCategories = [...new Set(userProgress.map(p => p.bookId?.category).filter(Boolean))];
    const preferredAuthors = [...new Set(userProgress.map(p => p.bookId?.author).filter(Boolean))];
    const preferredTags = [...new Set(userProgress.flatMap(p => p.bookId?.tags || []).filter(Boolean))];

    // Find books user hasn't read
    const readBookIds = userProgress.map(p => p.bookId?._id).filter(Boolean);

    const recommendations = await Book.find({
      _id: { $nin: readBookIds },
      $or: [
        { category: { $in: preferredCategories } },
        { author: { $in: preferredAuthors } },
        { tags: { $in: preferredTags } },
        { 'rating.average': { $gte: 4.0 } }, // High-rated books
      ],
    })
    .sort('-rating.average -rating.count')
    .limit(parseInt(limit));

    res.json({
      success: true,
      data: { recommendations },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendations',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Get reading statistics
exports.getReadingStats = async (req, res) => {
  try {
    const userId = req.user && req.user.id;

    const stats = await ReadingProgress.getUserStats(userId);

    res.json({
      success: true,
      data: { stats: stats[0] || {} },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reading statistics',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};