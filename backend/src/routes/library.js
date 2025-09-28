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
const { deleteBorrowRecord } = require('../controllers/deleteBorrowRecordController');
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
// RESTful borrow route for students
router.post('/books/:id/borrow', auth, borrowBook);
// Legacy borrow route (if needed)
router.post('/borrow', auth, borrowBook);

// Return book
// RESTful return route for students
router.post('/borrow/:id/return', auth, returnBook);
// Legacy return route (if needed)
router.post('/return', auth, returnBook);

// Get borrow history
router.get('/history', auth, getBorrowHistory);
// Alias for admin portal compatibility
router.get('/borrow-history', auth, getBorrowHistory);

// Delete borrow record (Admin only)
router.delete('/borrow/:id', auth, requireRole('admin'), deleteBorrowRecord);

module.exports = router;
