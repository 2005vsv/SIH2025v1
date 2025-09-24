import { 
  BookOpen, 
  Clock, 
  Search, 
  Star, 
  QrCode,
  Download,
  Eye,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Filter,
  Grid,
  List,
  ArrowLeft,
  Heart,
  Share2,
  BookMarked,
  User,
  Tag,
  RotateCcw,
  X,
  Plus,
  History
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { libraryAPI } from '../../services/api';
import BackButton from '../../components/BackButton';

const StudentLibrary = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [borrowLoading, setBorrowLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('browse');
  const [viewMode, setViewMode] = useState('grid');
  const [bookDetailsModal, setBookDetailsModal] = useState({ isOpen: false, book: null });
  const [qrModal, setQRModal] = useState({ isOpen: false, borrowedBook: null });
  const [favorites, setFavorites] = useState([]);

  const categories = ['all', 'computer-science', 'mathematics', 'physics', 'chemistry', 'literature', 'history', 'fiction', 'reference'];

  useEffect(() => {
    fetchBooks();
    fetchBorrowedBooks();
    loadFavorites();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await libraryAPI.getBooks();
      if (response.data.success) {
        setBooks(response.data.data.books || []);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const fetchBorrowedBooks = async () => {
    try {
      const response = await libraryAPI.getBorrowHistory();
      if (response.data.success) {
        setBorrowedBooks(response.data.data.borrowHistory || []);
      }
    } catch (error) {
      console.error('Error fetching borrowed books:', error);
    }
  };

  const loadFavorites = () => {
    const savedFavorites = localStorage.getItem('libraryFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  };

  const toggleFavorite = (bookId) => {
    const newFavorites = favorites.includes(bookId) 
      ? favorites.filter(id => id !== bookId)
      : [...favorites, bookId];
    
    setFavorites(newFavorites);
    localStorage.setItem('libraryFavorites', JSON.stringify(newFavorites));
    toast.success(favorites.includes(bookId) ? 'Removed from favorites' : 'Added to favorites');
  };

  const borrowBook = async (bookId) => {
    try {
      setBorrowLoading(true);
      const response = await libraryAPI.borrowBook(bookId);
      
      if (response.data.success) {
        toast.success('Book borrowed successfully!');
        fetchBooks();
        fetchBorrowedBooks();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error borrowing book:', error);
      toast.error(error.message || 'Failed to borrow book');
    } finally {
      setBorrowLoading(false);
    }
  };

  const returnBook = async (borrowId) => {
    try {
      setBorrowLoading(true);
      const response = await libraryAPI.returnBook(borrowId);
      
      if (response.data.success) {
        toast.success('Book returned successfully!');
        fetchBooks();
        fetchBorrowedBooks();
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error returning book:', error);
      toast.error(error.message || 'Failed to return book');
    } finally {
      setBorrowLoading(false);
    }
  };

  const generateQRCode = (borrowedBook) => {
    // In a real implementation, this would generate a QR code
    const qrData = {
      borrowId: borrowedBook._id,
      bookId: borrowedBook.bookId._id,
      title: borrowedBook.bookId.title,
      dueDate: borrowedBook.dueDate
    };
    
    // Mock QR code URL - in production this would be generated server-side
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify(qrData))}`;
    
    return qrCodeUrl;
  };

  const downloadQRCode = (borrowedBook) => {
    const qrCodeUrl = generateQRCode(borrowedBook);
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `qr-code-${borrowedBook.bookId.title.replace(/\s+/g, '-')}.png`;
    link.click();
    toast.success('QR code downloaded!');
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.isbn.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const activeBorrows = borrowedBooks.filter(borrow => borrow.status === 'borrowed');
  const borrowHistory = borrowedBooks.filter(borrow => borrow.status === 'returned');
  const overdueBooks = borrowedBooks.filter(borrow => 
    borrow.status === 'borrowed' && new Date(borrow.dueDate) < new Date()
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'borrowed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'returned': return 'bg-green-100 text-green-800 border-green-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'borrowed': return <BookOpen className="h-4 w-4" />;
      case 'returned': return <CheckCircle className="h-4 w-4" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <BackButton />
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Library Management</h1>
          <p className="mt-2 text-gray-600">Browse books, manage borrowings, and track your reading history</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Currently Borrowed</dt>
                  <dd className="text-lg font-medium text-gray-900">{activeBorrows.length}</dd>
                </dl>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Books Read</dt>
                  <dd className="text-lg font-medium text-gray-900">{borrowHistory.length}</dd>
                </dl>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Overdue</dt>
                  <dd className="text-lg font-medium text-gray-900">{overdueBooks.length}</dd>
                </dl>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Heart className="h-8 w-8 text-pink-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Favorites</dt>
                  <dd className="text-lg font-medium text-gray-900">{favorites.length}</dd>
                </dl>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('browse')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'browse'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Browse Books
            </button>
            <button
              onClick={() => setActiveTab('borrowed')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'borrowed'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Currently Borrowed
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Reading History
            </button>
          </nav>
        </div>

        {activeTab === 'browse' && (
          <div className="space-y-6">
            {/* Search and Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search by title, author, or ISBN..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div className="relative mt-4">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Grid className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Books Grid/List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBooks.map((book, index) => (
                    <motion.div
                      key={book._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index }}
                      className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
                    >
                      <div className="relative p-6">
                        <button
                          onClick={() => toggleFavorite(book._id)}
                          className="absolute top-2 right-2 p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
                        >
                          <Heart className={`h-5 w-5 ${favorites.includes(book._id) ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                        </button>
                      </div>
                      <div className="px-6 pb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{book.title}</h3>
                        <p className="text-gray-600 mb-2">by {book.author}</p>
                        <span className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full mb-4">
                          {book.category?.replace('-', ' ')}
                        </span>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm text-gray-600">
                            Available: {book.availableCopies}/{book.totalCopies}
                          </span>
                          {book.rating && (
                            <div className="flex items-center">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="ml-1 text-sm text-gray-600">{book.rating}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setBookDetailsModal({ isOpen: true, book })}
                            className="flex-1 px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                          >
                            <Eye className="h-4 w-4 mr-2 inline" />
                            Details
                          </button>
                          <button
                            onClick={() => borrowBook(book._id)}
                            disabled={book.availableCopies === 0 || borrowLoading}
                            className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="h-4 w-4 mr-2 inline" />
                            Borrow
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Availability</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBooks.map((book, index) => (
                        <motion.tr
                          key={book._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{book.title}</div>
                                <div className="text-sm text-gray-500">ISBN: {book.isbn}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.author}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                              {book.category?.replace('-', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              book.availableCopies > 0 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {book.availableCopies}/{book.totalCopies} available
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setBookDetailsModal({ isOpen: true, book })}
                                className="text-purple-600 hover:text-purple-900"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => toggleFavorite(book._id)}
                                className={favorites.includes(book._id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}
                              >
                                <Heart className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => borrowBook(book._id)}
                                disabled={book.availableCopies === 0 || borrowLoading}
                                className="text-purple-600 hover:text-purple-900 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {filteredBooks.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No books found matching your criteria</h3>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {activeTab === 'borrowed' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {activeBorrows.map((borrow, index) => (
              <motion.div
                key={borrow._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <BookOpen className="h-8 w-8 text-purple-600 mr-4" />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{borrow.bookId.title}</h3>
                        <p className="text-sm text-gray-500">by {borrow.bookId.author}</p>
                        <div className="mt-2 flex items-center space-x-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            Borrowed: {new Date(borrow.borrowDate).toLocaleDateString()}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            Due: {new Date(borrow.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                            new Date(borrow.dueDate) < new Date() ? 'overdue' : borrow.status
                          )}`}>
                            {getStatusIcon(new Date(borrow.dueDate) < new Date() ? 'overdue' : borrow.status)}
                            <span className="ml-1">
                              {new Date(borrow.dueDate) < new Date() ? 'Overdue' : borrow.status}
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setQRModal({ isOpen: true, borrowedBook: borrow })}
                      className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      QR Code
                    </button>
                    <button
                      onClick={() => returnBook(borrow._id)}
                      disabled={borrowLoading}
                      className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Return Book
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {activeBorrows.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No books currently borrowed</h3>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Reading History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Borrow Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {borrowHistory.map((borrow, index) => (
                    <motion.tr
                      key={borrow._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <BookOpen className="h-5 w-5 text-purple-600 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{borrow.bookId.title}</div>
                            <div className="text-sm text-gray-500">by {borrow.bookId.author}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(borrow.borrowDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {borrow.returnDate ? new Date(borrow.returnDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(borrow.status)}`}>
                          {getStatusIcon(borrow.status)}
                          <span className="ml-1">{borrow.status}</span>
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {borrowHistory.length === 0 && (
                <div className="text-center py-12">
                  <History className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No reading history available</h3>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>

    {/* Book Details Modal */}
    <AnimatePresence>
      {bookDetailsModal.isOpen && bookDetailsModal.book && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Book Details</h2>
              <button
                onClick={() => setBookDetailsModal({ isOpen: false, book: null })}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <BookOpen className="h-16 w-16 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{bookDetailsModal.book.title}</h3>
                  <p className="text-lg text-gray-600 mt-1">by {bookDetailsModal.book.author}</p>
                  
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">ISBN:</span>
                      <span className="text-sm text-gray-900">{bookDetailsModal.book.isbn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">Category:</span>
                      <span className="text-sm text-gray-900">{bookDetailsModal.book.category?.replace('-', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">Publisher:</span>
                      <span className="text-sm text-gray-900">{bookDetailsModal.book.publisher || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">Year:</span>
                      <span className="text-sm text-gray-900">{bookDetailsModal.book.publishedYear || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">Pages:</span>
                      <span className="text-sm text-gray-900">{bookDetailsModal.book.pages || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">Language:</span>
                      <span className="text-sm text-gray-900">{bookDetailsModal.book.language || 'English'}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Availability:</span>
                    <span className="text-sm text-gray-900">
                      {bookDetailsModal.book.availableCopies}/{bookDetailsModal.book.totalCopies} copies available
                    </span>
                  </div>

                  {bookDetailsModal.book.description && (
                    <div className="mt-4">
                      <span className="text-sm font-medium text-gray-500">Description:</span>
                      <p className="mt-1 text-sm text-gray-900">{bookDetailsModal.book.description}</p>
                    </div>
                  )}

                  {bookDetailsModal.book.tags && bookDetailsModal.book.tags.length > 0 && (
                    <div className="mt-4">
                      <span className="text-sm font-medium text-gray-500">Tags:</span>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {bookDetailsModal.book.tags.map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex space-x-4">
                    <button
                      onClick={() => toggleFavorite(bookDetailsModal.book._id)}
                      className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      {favorites.includes(bookDetailsModal.book._id) ? 'Remove from Favorites' : 'Add to Favorites'}
                    </button>
                    <button
                      onClick={() => {
                        borrowBook(bookDetailsModal.book._id);
                        setBookDetailsModal({ isOpen: false, book: null });
                      }}
                      disabled={bookDetailsModal.book.availableCopies === 0 || borrowLoading}
                      className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Borrow Book
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {/* QR Code Modal */}
    <AnimatePresence>
      {qrModal.isOpen && qrModal.borrowedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Book QR Code</h2>
              <button
                onClick={() => setQRModal({ isOpen: false, borrowedBook: null })}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="text-center space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{qrModal.borrowedBook.bookId.title}</h3>
                <p className="text-sm text-gray-600">by {qrModal.borrowedBook.bookId.author}</p>
              </div>

              <div className="flex justify-center">
                <img
                  src={generateQRCode(qrModal.borrowedBook)}
                  alt="QR Code"
                  className="w-48 h-48 border border-gray-200 rounded-lg"
                />
              </div>

              <div className="text-sm text-gray-600">
                <p>Due Date: {new Date(qrModal.borrowedBook.dueDate).toLocaleDateString()}</p>
                <p className="mt-1">Scan this QR code for quick book return</p>
              </div>

              <button
                onClick={() => downloadQRCode(qrModal.borrowedBook)}
                className="flex items-center justify-center w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <Download className="h-4 w-4 mr-2" />
                Download QR Code
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </div>
  );
};

export default StudentLibrary;
