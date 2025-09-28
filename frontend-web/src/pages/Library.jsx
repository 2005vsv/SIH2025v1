import { motion } from 'framer-motion';
import {
    AlertCircle,
    BookOpen,
    Calendar,
    CheckCircle,
    Clock,
    Filter,
    Plus,
    Search
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { libraryAPI } from '../services/api';

const Library = () => {
  const [books, setBooks] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [borrowingBookId, setBorrowingBookId] = useState(null);

  useEffect(() => {
    fetchLibraryData();
  }, []);

  const fetchLibraryData = async () => {
    try {
      setLoading(true);
      
      // Fetch all books
      const booksResponse = await libraryAPI.getBooks();
      const allBooks = booksResponse.data.data.books || [];
      setBooks(allBooks);

      // Fetch my borrowed books
      try {
        const borrowedResponse = await libraryAPI.getBorrowHistory();
        const myBorrowedBooks = borrowedResponse.data.data.borrowRecords || [];
        setBorrowedBooks(myBorrowedBooks);
      } catch (error) {
        console.log('Error fetching borrowed books:', error);
      }

    } catch (error) {
      console.error('Error fetching library data:', error);
      toast.error('Failed to load library data');
    } finally {
      setLoading(false);
    }
  };

  const handleBorrowBook = async (bookId) => {
    try {
      setBorrowingBookId(bookId);
      await libraryAPI.borrowBook(bookId);
      toast.success('Book borrowed successfully!');
      fetchLibraryData(); // Refresh the data
    } catch (error) {
      console.error('Error borrowing book:', error);
      toast.error(error.response?.data?.message || 'Failed to borrow book');
    } finally {
      setBorrowingBookId(null);
    }
  };

  const handleReturnBook = async (borrowId) => {
    try {
      await libraryAPI.returnBook(borrowId);
      toast.success('Book returned successfully!');
      fetchLibraryData(); // Refresh the data
    } catch (error) {
      console.error('Error returning book:', error);
      toast.error(error.response?.data?.message || 'Failed to return book');
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || book.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(books.map(book => book.category))];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'returned':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'active':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'overdue':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <BookOpen className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'returned':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Digital Library
                </h1>
                <p className="text-gray-600 text-lg">
                  Explore, borrow, and manage your academic resources
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <BookOpen className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-blue-600 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Total Books</p>
                <p className="text-2xl font-bold text-gray-900">{books.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-2xl font-bold text-gray-900">
                  {books.reduce((sum, book) => sum + book.availableCopies, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-blue-600 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Borrowed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {borrowedBooks.filter(book => book.status === 'borrowed').length}
                  </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center">
              <Filter className="w-8 h-8 text-purple-600 mr-4" />
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Books Section */}
          <div className="lg:col-span-2">
            {/* Search and Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 mb-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search books or authors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Books Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {filteredBooks.length === 0 ? (
                <div className="col-span-2 text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
                  <p className="text-gray-600">
                    {searchTerm || categoryFilter !== 'all' 
                      ? 'Try adjusting your search or filters' 
                      : 'No books available in the library'}
                  </p>
                </div>
              ) : (
                filteredBooks.map((book, index) => (
                  <motion.div
                    key={book._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex">
                      <div className="w-16 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                        <BookOpen className="w-8 h-8 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="mb-3">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {book.title}
                          </h3>
                          <p className="text-sm text-gray-600">by {book.author}</p>
                          <p className="text-xs text-gray-500">{book.category} • {book.publishedYear}</p>
                        </div>
                        
                        {book.description && (
                          <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                            {book.description}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              book.availableCopies > 0 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {book.availableCopies > 0 
                                ? `${book.availableCopies} available` 
                                : 'Not available'}
                            </span>
                          </div>
                          {borrowedBooks.some(b => b.bookId && b.bookId._id === book._id && b.status === 'borrowed') ? (
                            <button
                              disabled
                              className="bg-gray-300 text-gray-600 px-4 py-2 rounded-lg flex items-center cursor-not-allowed text-sm"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Borrowed
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBorrowBook(book._id)}
                              disabled={book.availableCopies === 0 || borrowingBookId === book._id}
                              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                              {borrowingBookId === book._id ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Borrowing...
                                </>
                              ) : (
                                <>
                                  <Plus className="w-4 h-4 mr-2" />
                                  Borrow
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </div>

          {/* My Books Section */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20"
            >
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">My Borrowed Books</h2>
              </div>
              <div className="p-6">
                {borrowedBooks.filter(b => b.status === 'borrowed').length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No books currently borrowed</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {borrowedBooks.filter(b => b.status === 'borrowed').map((borrowedBook) => (
                      <div key={borrowedBook._id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start">
                          <div className="w-12 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center mr-3">
                            <BookOpen className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate mb-1">
                              {borrowedBook.bookId.title}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {borrowedBook.bookId.author}
                            </p>
                            <div className="flex items-center mb-2">
                              {getStatusIcon(borrowedBook.status)}
                              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(borrowedBook.status)}`}>
                                {borrowedBook.status.charAt(0).toUpperCase() + borrowedBook.status.slice(1)}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 space-y-1">
                              <div className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                Due: {new Date(borrowedBook.dueDate).toLocaleDateString()}
                              </div>
                            </div>
                            {borrowedBook.status === 'borrowed' && (
                              <button
                                onClick={() => handleReturnBook(borrowedBook._id)}
                                className="mt-2 bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                              >
                                Return Book
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-6 border-t border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Borrow History</h2>
                {borrowedBooks.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No borrow history found</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                    {borrowedBooks.map((borrowedBook) => (
                      !borrowedBook.bookId ? null : (
                        <div key={borrowedBook._id} className="p-4 border border-gray-100 rounded-lg bg-gray-50">
                          <div className="flex items-start">
                            <div className="w-10 h-14 bg-gradient-to-br from-gray-400 to-gray-600 rounded flex items-center justify-center mr-3">
                              <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate mb-1">
                                {borrowedBook.bookId.title || 'Unknown'}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">
                                {borrowedBook.bookId.author || 'N/A'}
                              </p>
                              <div className="flex items-center mb-2">
                                {getStatusIcon(borrowedBook.status)}
                                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(borrowedBook.status)}`}>
                                  {borrowedBook.status ? borrowedBook.status.charAt(0).toUpperCase() + borrowedBook.status.slice(1) : 'N/A'}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 space-y-1">
                                <div className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  Borrowed: {borrowedBook.borrowDate ? new Date(borrowedBook.borrowDate).toLocaleDateString() : 'N/A'}
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  Due: {borrowedBook.dueDate ? new Date(borrowedBook.dueDate).toLocaleDateString() : 'N/A'}
                                </div>
                                {borrowedBook.returnDate && (
                                  <div className="flex items-center">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Returned: {new Date(borrowedBook.returnDate).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Library;
