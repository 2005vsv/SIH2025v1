const express = require('express');
const {
    borrowBook,
    createBook,
    deleteBook,
    getBookById,
    getBookQR,
    getBooks,
    getBorrowHistory,
    getLibraryStats,
    returnBook,
    updateBook,
} = require('../controllers/libraryController');
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

const router = express.Router();

// Get all books
router.get('/books', auth, getBooks);

// Get library statistics
router.get('/stats', auth, getLibraryStats);

// Get book by ID
router.get('/books/:id', auth, getBookById);

// Get QR code for book
router.get('/books/:id/qr', auth, getBookQR);

// Create book (Admin only)
router.post('/books', auth, requireRole('admin'), createBook);

// Update book (Admin only)
router.put('/books/:id', auth, requireRole('admin'), updateBook);

// Delete book (Admin only)
router.delete('/books/:id', auth, requireRole('admin'), deleteBook);

// Borrow book
router.post('/borrow', auth, borrowBook);

// Return book
router.post('/return', auth, returnBook);

// Get borrow history
router.get('/history', auth, getBorrowHistory);

module.exports = router;
