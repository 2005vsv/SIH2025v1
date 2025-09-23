
import { Request, Response } from 'express';
import QRCode from 'qrcode';
import { AuthenticatedRequest } from '../middleware/roleCheck';
import Book from '../models/Book';
import BorrowRecord from '../models/BorrowRecord';

// Get all books
export const getBooks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search, genre, author, availability } = req.query;
    
    const query: any = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (genre) query.genre = genre;
    if (author) query.author = { $regex: author, $options: 'i' };
    if (availability) query.availableCopies = availability === 'true' ? { $gt: 0 } : 0;

    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sort: 'title',
    };

    const books = await Book.find(query)
      .sort(options.sort)
      .limit(options.limit * options.page)
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
export const getBookById = async (req: Request, res: Response): Promise<void> => {
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
export const createBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const book = new Book(req.body);
    await book.save();

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: { book },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create book',
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
  }
};

// Update book (Admin only)
export const updateBook = async (req: Request, res: Response): Promise<void> => {
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
export const deleteBook = async (req: Request, res: Response): Promise<void> => {
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
export const borrowBook = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

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
      userId: userId,
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
      userId: userId,
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
export const returnBook = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const borrowRecord = await BorrowRecord.findOne({
      _id: id,
      userId: userId,
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
export const getBorrowHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const isAdmin = req.user?.role === 'admin';
    const userId = req.user?.id;

    const query: any = {};
    
    // Students can only see their own records
    if (!isAdmin) {
      query.userId = userId;
    }
    
    if (status) query.status = status;

    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sort: '-borrowDate',
      populate: [
        { path: 'bookId', select: 'title author isbn' },
        ...(isAdmin ? [{ path: 'userId', select: 'name email studentId' }] : [])
      ],
    };

    const borrowRecords = await BorrowRecord.find(query)
      .populate(options.populate)
      .sort(options.sort)
      .limit(options.limit * options.page)
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
export const getLibraryStats = async (req: Request, res: Response): Promise<void> => {
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

export const getBookQR = async (req: Request, res: Response): Promise<void> => {
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