
import { motion } from 'framer-motion';
import { AlertCircle, BookOpen, Search, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { libraryAPI } from '../../services/api';

const StudentLibrary = () => {
  const [books, setBooks] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('browse');


  useEffect(() => {
    fetchBooks();
    fetchBorrowedBooks();
    // Optionally, add polling or websocket for real-time updates
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await libraryAPI.getBooks();
      // Defensive: support both array and paginated object
      let booksData = response?.data?.data;
      if (Array.isArray(booksData)) {
        setBooks(booksData);
      } else if (booksData?.books) {
        setBooks(booksData.books);
      } else {
        setBooks([]);
      }
    } catch (error) {
      setBooks([]);
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBorrowedBooks = async () => {
    try {
      setLoading(true);
      // Defensive: try both endpoints for compatibility
      let response = null;
      try {
        response = await libraryAPI.getBorrowHistory();
      } catch (e) {
        // fallback or log
      }
      let borrowedData = response?.data?.data;
      if (Array.isArray(borrowedData)) {
        setBorrowedBooks(borrowedData);
      } else if (borrowedData?.borrowRecords) {
        setBorrowedBooks(borrowedData.borrowRecords);
      } else if (borrowedData?.borrowedBooks) {
        setBorrowedBooks(borrowedData.borrowedBooks);
      } else {
        setBorrowedBooks([]);
      }
    } catch (error) {
      setBorrowedBooks([]);
      console.error('Error fetching borrowed books:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleBorrowBook = async (bookId) => {
    try {
      await libraryAPI.borrowBook(bookId);
      fetchBooks();
      fetchBorrowedBooks();
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to borrow book');
      console.error('Error borrowing book:', error);
    }
  };


  const handleReturnBook = async (borrowId) => {
    try {
      await libraryAPI.returnBook(borrowId);
      fetchBooks();
      fetchBorrowedBooks();
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to return book');
      console.error('Error returning book:', error);
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.isbn.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(books.map(book => book.category))];
  const activeBorrowedBooks = borrowedBooks.filter(b => b.status === 'borrowed');
  const overdueBooks = borrowedBooks.filter(b => b.status === 'overdue');

  const isBookBorrowed = (bookId) => {
    return activeBorrowedBooks.some(b => b.bookId._id === bookId);
  };

  const getDaysUntilDue = (dueDate) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Library</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Browse and manage your borrowed books
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Books Borrowed
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {activeBorrowedBooks.length}
                  </dd>
                </dl>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Available Books
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {books.length}
                  </dd>
                </dl>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Overdue
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {overdueBooks.length}
                  </dd>
                </dl>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">{/* Tab buttons */}
          
            <button
              onClick={() => setActiveTab('browse')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'browse'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Browse Books
            </button>
            <button
              onClick={() => setActiveTab('borrowed')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'borrowed'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              My Borrowed Books ({activeBorrowedBooks.length})
            </button>
          </nav>
        </div>

        {activeTab === 'browse' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search books by title, author, or ISBN..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <select
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Books Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book) => (
                <motion.div
                  key={book._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
                >
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {book.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        by {book.author}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ISBN: {book.isbn}
                      </p>
                      <span className="inline-block px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-200">
                        {book.category}
                      </span>
                    </div>
                    
                    {book.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                        {book.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Available: {book.availableCopies}/{book.totalCopies}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">4.5</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleBorrowBook(book._id)}
                      disabled={book.availableCopies === 0 || isBookBorrowed(book._id)}
                      className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                        book.availableCopies === 0 || isBookBorrowed(book._id)
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
                          : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                      }`}
                    >
                      {isBookBorrowed(book._id) ? 'Already Borrowed' : 
                       book.availableCopies === 0 ? 'Out of Stock' : 'Borrow Book'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredBooks.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No books found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'borrowed' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeBorrowedBooks.map((borrowedBook) => (
                <motion.div
                  key={borrowedBook._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
                >
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {borrowedBook.bookId.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        by {borrowedBook.bookId.author}
                      </p>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Borrowed: {new Date(borrowedBook.borrowDate).toLocaleDateString()}
                        </p>
                        <p className={`text-sm font-medium ${
                          getDaysUntilDue(borrowedBook.dueDate) < 0 ? 'text-red-600 dark:text-red-400' :
                          getDaysUntilDue(borrowedBook.dueDate) <= 3 ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-green-600 dark:text-green-400'
                        }`}>
                          Due: {new Date(borrowedBook.dueDate).toLocaleDateString()}
                          ({getDaysUntilDue(borrowedBook.dueDate) < 0 ? 
                            `${Math.abs(getDaysUntilDue(borrowedBook.dueDate))} days overdue` :
                            `${getDaysUntilDue(borrowedBook.dueDate)} days left`})
                        </p>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        borrowedBook.status === 'borrowed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                        borrowedBook.status === 'overdue' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        {borrowedBook.status.charAt(0).toUpperCase() + borrowedBook.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleReturnBook(borrowedBook._id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                      >
                        Return Book
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {activeBorrowedBooks.length === 0 && (
                <div className="col-span-2 text-center py-12">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No borrowed books</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Browse the library to borrow your first book!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentLibrary;
