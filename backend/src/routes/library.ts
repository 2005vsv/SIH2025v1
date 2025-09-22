import express from 'express';
import {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  borrowBook,
  returnBook,
  getBorrowHistory,
  getLibraryStats,
} from '../controllers/libraryController';
import { auth } from '../middleware/auth';
import { requireRole } from '../middleware/roleCheck';

const router = express.Router();

// Get all books
router.get('/books', auth, getBooks);

// Get library statistics
router.get('/stats', auth, getLibraryStats);

// Get book by ID
router.get('/books/:id', auth, getBookById);

// Create book (Admin only)
router.post('/books', auth, requireRole('admin'), createBook);

// Update book (Admin only)
router.put('/books/:id', auth, requireRole('admin'), updateBook);

// Delete book (Admin only)
router.delete('/books/:id', auth, requireRole('admin'), deleteBook);

// Borrow book
router.post('/books/:id/borrow', auth, borrowBook);

// Return book
router.post('/borrow/:id/return', auth, returnBook);

// Get borrow history
router.get('/borrow-history', auth, getBorrowHistory);

export default router;