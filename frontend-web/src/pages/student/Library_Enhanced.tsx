import { 
  Book, 
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

interface BookData {
  _id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  description?: string;
  coverImage?: string;
  publisher?: string;
  publishedYear?: number;
  language?: string;
  pages?: number;
  rating?: number;
  tags?: string[];
}

interface BorrowedBook {
  _id: string;
  bookId: BookData;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'borrowed' | 'returned' | 'overdue';
  qrCode?: string;
  fineAmount?: number;
}

interface BookDetailsModal {
  isOpen: boolean;
  book: BookData | null;
}

interface QRModal {
  isOpen: boolean;
  borrowedBook: BorrowedBook | null;
}

const StudentLibrary: React.FC = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<BookData[]>([]);
  const [borrowedBooks, setBorrowedBooks] = useState<BorrowedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [borrowLoading, setBorrowLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState<'browse' | 'borrowed' | 'history'>('browse');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [bookDetailsModal, setBookDetailsModal] = useState<BookDetailsModal>({ isOpen: false, book: null });
  const [qrModal, setQRModal] = useState<QRModal>({ isOpen: false, borrowedBook: null });
  const [favorites, setFavorites] = useState<string[]>([]);

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

  const toggleFavorite = (bookId: string) => {
    const newFavorites = favorites.includes(bookId) 
      ? favorites.filter(id => id !== bookId)
      : [...favorites, bookId];
    
    setFavorites(newFavorites);
    localStorage.setItem('libraryFavorites', JSON.stringify(newFavorites));
    toast.success(favorites.includes(bookId) ? 'Removed from favorites' : 'Added to favorites');
  };

  const borrowBook = async (bookId: string) => {
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
    } catch (error: any) {
      console.error('Error borrowing book:', error);
      toast.error(error.message || 'Failed to borrow book');
    } finally {
      setBorrowLoading(false);
    }
  };

  const returnBook = async (borrowId: string) => {
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
    } catch (error: any) {
      console.error('Error returning book:', error);
      toast.error(error.message || 'Failed to return book');
    } finally {
      setBorrowLoading(false);
    }
  };

  const generateQRCode = (borrowedBook: BorrowedBook) => {
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

  const downloadQRCode = (borrowedBook: BorrowedBook) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'borrowed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'returned': return 'bg-green-100 text-green-800 border-green-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'borrowed': return <BookOpen className="w-4 h-4" />;
      case 'returned': return <CheckCircle className="w-4 h-4" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <BackButton className="mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Library Management</h1>
          <p className="text-gray-600">Browse books, manage borrowings, and track your reading history</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Currently Borrowed</p>
                <p className="text-2xl font-bold text-gray-900">{activeBorrows.length}</p>
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
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Books Read</p>
                <p className="text-2xl font-bold text-gray-900">{borrowHistory.length}</p>
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
              <div className="p-3 rounded-full bg-red-100">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">{overdueBooks.length}</p>
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
              <div className="p-3 rounded-full bg-blue-100">
                <Heart className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Favorites</p>
                <p className="text-2xl font-bold text-gray-900">{favorites.length}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
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
        </div>

        {activeTab === 'browse' && (
          <>
            {/* Search and Controls */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative flex-1">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by title, author, or ISBN..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none"
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
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <List className="w-5 h-5" />
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredBooks.map((book, index) => (
                    <motion.div
                      key={book._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index }}
                      className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow"
                    >
                      <div className="h-48 bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center relative">
                        <Book className="w-16 h-16 text-purple-600" />
                        <button
                          onClick={() => toggleFavorite(book._id)}
                          className="absolute top-2 right-2 p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
                        >
                          <Heart className={`w-4 h-4 ${favorites.includes(book._id) ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                        </button>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{book.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                        <p className="text-xs text-gray-500 mb-3 capitalize">{book.category?.replace('-', ' ')}</p>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-gray-600">
                            Available: {book.availableCopies}/{book.totalCopies}
                          </span>
                          {book.rating && (
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-sm text-gray-600 ml-1">{book.rating}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setBookDetailsModal({ isOpen: true, book })}
                            className="flex-1 px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                          >
                            <Eye className="w-4 h-4 mr-1 inline" />
                            Details
                          </button>
                          <button
                            onClick={() => borrowBook(book._id)}
                            disabled={book.availableCopies === 0 || borrowLoading}
                            className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <BookOpen className="w-4 h-4 mr-1 inline" />
                            Borrow
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
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
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <Book className="w-8 h-8 text-purple-600 mr-3" />
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{book.title}</div>
                                  <div className="text-sm text-gray-500">ISBN: {book.isbn}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{book.author}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                              {book.category?.replace('-', ' ')}
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
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => toggleFavorite(book._id)}
                                  className={favorites.includes(book._id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}
                                >
                                  <Heart className={`w-4 h-4 ${favorites.includes(book._id) ? 'fill-current' : ''}`} />
                                </button>
                                <button
                                  onClick={() => borrowBook(book._id)}
                                  disabled={book.availableCopies === 0 || borrowLoading}
                                  className="text-purple-600 hover:text-purple-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <BookOpen className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {filteredBooks.length === 0 && (
                <div className="text-center py-12">
                  <Book className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No books found matching your criteria</p>
                </div>
              )}
            </motion.div>
          </>
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
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start space-x-4">
                    <Book className="w-12 h-12 text-purple-600 mt-1" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{borrow.bookId.title}</h3>
                      <p className="text-gray-600">by {borrow.bookId.author}</p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Borrowed: {new Date(borrow.borrowDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          Due: {new Date(borrow.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                          new Date(borrow.dueDate) < new Date() ? 'overdue' : borrow.status
                        )}`}>
                          {getStatusIcon(new Date(borrow.dueDate) < new Date() ? 'overdue' : borrow.status)}
                          <span className="ml-1 capitalize">
                            {new Date(borrow.dueDate) < new Date() ? 'Overdue' : borrow.status}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 lg:mt-0 flex space-x-3">
                    <button
                      onClick={() => setQRModal({ isOpen: true, borrowedBook: borrow })}
                      className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      QR Code
                    </button>
                    <button
                      onClick={() => returnBook(borrow._id)}
                      disabled={borrowLoading}
                      className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Return Book
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {activeBorrows.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No books currently borrowed</p>
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
              <h2 className="text-lg font-semibold text-gray-900">Reading History</h2>
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
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Book className="w-8 h-8 text-purple-600 mr-3" />
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(borrow.status)}`}>
                          {getStatusIcon(borrow.status)}
                          <span className="ml-1 capitalize">{borrow.status}</span>
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              {borrowHistory.length === 0 && (
                <div className="text-center py-12">
                  <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No reading history available</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
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
                <h2 className="text-2xl font-bold text-gray-900">Book Details</h2>
                <button
                  onClick={() => setBookDetailsModal({ isOpen: false, book: null })}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <div className="h-64 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                    <Book className="w-20 h-20 text-purple-600" />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{bookDetailsModal.book.title}</h3>
                  <p className="text-gray-600 mb-4">by {bookDetailsModal.book.author}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">ISBN:</span>
                      <span className="ml-2 text-gray-600">{bookDetailsModal.book.isbn}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Category:</span>
                      <span className="ml-2 text-gray-600 capitalize">{bookDetailsModal.book.category?.replace('-', ' ')}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Publisher:</span>
                      <span className="ml-2 text-gray-600">{bookDetailsModal.book.publisher || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Year:</span>
                      <span className="ml-2 text-gray-600">{bookDetailsModal.book.publishedYear || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Pages:</span>
                      <span className="ml-2 text-gray-600">{bookDetailsModal.book.pages || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Language:</span>
                      <span className="ml-2 text-gray-600">{bookDetailsModal.book.language || 'English'}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="font-medium text-gray-700">Availability:</span>
                    <span className="ml-2 text-gray-600">
                      {bookDetailsModal.book.availableCopies}/{bookDetailsModal.book.totalCopies} copies available
                    </span>
                  </div>

                  {bookDetailsModal.book.description && (
                    <div className="mb-4">
                      <span className="font-medium text-gray-700">Description:</span>
                      <p className="mt-1 text-gray-600 text-sm">{bookDetailsModal.book.description}</p>
                    </div>
                  )}

                  {bookDetailsModal.book.tags && bookDetailsModal.book.tags.length > 0 && (
                    <div className="mb-6">
                      <span className="font-medium text-gray-700">Tags:</span>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {bookDetailsModal.book.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <button
                      onClick={() => toggleFavorite(bookDetailsModal.book!._id)}
                      className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      <Heart className={`w-4 h-4 mr-2 ${favorites.includes(bookDetailsModal.book!._id) ? 'text-red-500 fill-current' : ''}`} />
                      {favorites.includes(bookDetailsModal.book!._id) ? 'Remove from Favorites' : 'Add to Favorites'}
                    </button>
                    <button
                      onClick={() => {
                        borrowBook(bookDetailsModal.book!._id);
                        setBookDetailsModal({ isOpen: false, book: null });
                      }}
                      disabled={bookDetailsModal.book.availableCopies === 0 || borrowLoading}
                      className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Borrow Book
                    </button>
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
                <h3 className="text-lg font-semibold text-gray-900">Book QR Code</h3>
                <button
                  onClick={() => setQRModal({ isOpen: false, borrowedBook: null })}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-center">
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900">{qrModal.borrowedBook.bookId.title}</h4>
                  <p className="text-sm text-gray-600">by {qrModal.borrowedBook.bookId.author}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 mb-4">
                  <img
                    src={generateQRCode(qrModal.borrowedBook)}
                    alt="QR Code"
                    className="w-48 h-48 mx-auto"
                  />
                </div>

                <div className="text-sm text-gray-600 mb-4">
                  <p>Due Date: {new Date(qrModal.borrowedBook.dueDate).toLocaleDateString()}</p>
                  <p className="text-xs mt-1">Scan this QR code for quick book return</p>
                </div>

                <button
                  onClick={() => downloadQRCode(qrModal.borrowedBook!)}
                  className="flex items-center justify-center w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <Download className="w-4 h-4 mr-2" />
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