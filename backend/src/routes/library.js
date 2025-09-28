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
    // Digital library features
    startReading,
    updateReadingProgress,
    addBookmark,
    removeBookmark,
    getReadingProgress,
    getReadingHistory,
    rateBook,
    getRecommendations,
    getReadingStats,
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
router.post('/books', auth, requireRole('admin'), (req, res, next) => {
    // Debug: log the incoming request body
    console.log('POST /api/library/books body:', req.body);
    // Call the actual controller
    createBook(req, res, next);
});

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
router.get('/borrow-history', auth, getBorrowHistory);

// Digital Library Routes

// Start reading a digital book
router.post('/books/:bookId/start-reading', auth, startReading);

// Update reading progress
router.put('/books/:bookId/progress', auth, updateReadingProgress);

// Get reading progress for a book
router.get('/books/:bookId/progress', auth, getReadingProgress);

// Add bookmark
router.post('/books/:bookId/bookmarks', auth, addBookmark);

// Remove bookmark
router.delete('/books/:bookId/bookmarks', auth, removeBookmark);

// Rate and review a book
router.post('/books/:bookId/rate', auth, rateBook);

// Get reading history
router.get('/reading-history', auth, getReadingHistory);

// Get reading statistics
router.get('/reading-stats', auth, getReadingStats);

// Get book recommendations
router.get('/recommendations', auth, getRecommendations);

module.exports = router;
