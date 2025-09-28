import {
  BookOpen,
  CheckCircle,
  Clock,
  Plus,
  Search,
  Trash2,
  XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { libraryAPI } from '../../services/api';

const LibraryManagement = () => {
  const [books, setBooks] = useState([]);
  const [borrowRecords, setBorrowRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('books');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    publishedYear: new Date().getFullYear(),
    totalCopies: 1,
    description: '',
    location: ''
    // genre and publisher removed
  });

  useEffect(() => {
    // DEBUG: Make sure your backend is running and the endpoints below exist:
    // - GET    /api/library/books
    // - GET    /api/library/borrow-history
    // - POST   /api/library/books
    // If you get 404, check your backend routes and your libraryAPI config!
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // If you get 404 here, check your backend and libraryAPI.js for correct URLs!
      const [booksResponse, borrowResponse] = await Promise.all([
        libraryAPI.getBooks(),
        libraryAPI.getBorrowHistory()
      ]);
      setBooks(booksResponse.data.data.books || []);
      setBorrowRecords(borrowResponse.data.data.borrowRecords || []);
    } catch (error) {
      // Show endpoint and error for easier debugging
      toast.error(
        `Error: ${error.response?.status} ${error.response?.statusText || ''} - ${error.response?.data?.message || error.message || 'Failed to load library data'}`
      );
      console.error('Error fetching library data:', error.config?.url, error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBook = async () => {
    // Strict required field validation
    if (!newBook.title || !newBook.author || !newBook.isbn || !newBook.category || !newBook.totalCopies) {
      toast.error('Please fill all required fields (Title, Author, ISBN, Category, Total Copies)');
      return;
    }
    try {
      // Only send fields your backend expects!
      // Generate a unique QR code string (simple random string)
      const qrCode = `${newBook.isbn}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
      const bookToCreate = {
        title: newBook.title,
        author: newBook.author,
        isbn: newBook.isbn,
        category: newBook.category,
        publishedYear: newBook.publishedYear,
        totalCopies: Number(newBook.totalCopies),
        availableCopies: Number(newBook.totalCopies),
        description: newBook.description,
        location: newBook.location,
        qrCode
      };
      await libraryAPI.createBook(bookToCreate);
      toast.success('Book added successfully');
      setShowCreateModal(false);
      setNewBook({
        title: '',
        author: '',
        isbn: '',
        category: '',
        publishedYear: new Date().getFullYear(),
        totalCopies: 1,
        description: '',
        location: ''
      });
      fetchData();
    } catch (error) {
      toast.error(
        `Error: ${error.response?.status} ${error.response?.statusText || ''} - ${error.response?.data?.message || error.message || 'Failed to add book'}`
      );
      console.error('Create book error:', error.config?.url, error);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      await libraryAPI.deleteBook(bookId);
      toast.success('Book deleted successfully');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete book');
    }
  };

  const filteredBooks = books.filter(book =>
    book &&
    book.title && book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author && book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.isbn && book.isbn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.genre && book.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBorrowRecords = borrowRecords.filter(record =>
    record.bookId && record.bookId.title && record.bookId.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.userId && record.userId.name && record.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (record.userId && record.userId.studentId && record.userId.studentId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'returned': return 'bg-green-100 text-green-800';
      case 'borrowed': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'returned': return <CheckCircle className="inline w-4 h-4 text-green-500 mr-1" />;
      case 'borrowed': return <Clock className="inline w-4 h-4 text-blue-500 mr-1" />;
      case 'overdue': return <XCircle className="inline w-4 h-4 text-red-500 mr-1" />;
      default: return null;
    }
  };

  const getLibraryStats = () => {
    const totalBooks = books.reduce((sum, book) => sum + (book.totalCopies || 0), 0);
    const availableBooks = books.reduce((sum, book) => sum + (book.availableCopies || 0), 0);
    const borrowedBooks = borrowRecords.filter(record => record.status === 'borrowed').length;
    const overdueBooks = borrowRecords.filter(record => record.status === 'overdue').length;
    return { totalBooks, availableBooks, borrowedBooks, overdueBooks };
  };

  const stats = getLibraryStats();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-500" />
          Library Management
        </h1>
        <div className="text-gray-500">Manage books and borrowing records</div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-1">Total Books</div>
          <div className="text-2xl font-bold">{stats.totalBooks}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-1">Available</div>
          <div className="text-2xl font-bold">{stats.availableBooks}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-1">Borrowed</div>
          <div className="text-2xl font-bold">{stats.borrowedBooks}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-1">Overdue</div>
          <div className="text-2xl font-bold">{stats.overdueBooks}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6 gap-4">
        <button
          onClick={() => setActiveTab('books')}
          className={`py-2 px-4 border-b-2 font-medium text-sm ${
            activeTab === 'books'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Books ({books.length})
        </button>
        <button
          onClick={() => setActiveTab('borrowed')}
          className={`py-2 px-4 border-b-2 font-medium text-sm ${
            activeTab === 'borrowed'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Borrow Records ({borrowRecords.length})
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={activeTab === 'books' ? 'Search books...' : 'Search records...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {activeTab === 'books' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            Add Book
          </button>
        )}
      </div>

      {/* Content */}
      {activeTab === 'books' ? (
        // Books Table
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author & Genre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Availability</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => (
                <tr key={book._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-semibold">{book.title}</div>
                    <div className="text-xs text-gray-500">ISBN: {book.isbn}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div>{book.author}</div>
                    <div className="text-xs text-gray-500">{book.genre}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      {book.availableCopies} / {book.totalCopies}
                    </div>
                    <div className={`text-xs font-semibold ${book.availableCopies > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {book.availableCopies > 0 ? 'Available' : 'Not Available'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {book.location || 'Not specified'}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDeleteBook(book._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete Book"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredBooks.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-gray-500 py-8">
                    No books found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        // Borrow Records Table
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Borrow Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                
              </tr>
            </thead>
            <tbody>
              {filteredBorrowRecords.map((record) => (
                (!record.bookId || !record.userId) ? null : (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold">{record.userId.name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{record.userId.studentId || record.userId.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold">{record.bookId.title || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{record.bookId.author || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">{record.borrowDate ? new Date(record.borrowDate).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4">{record.dueDate ? new Date(record.dueDate).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(record.status)}`}>
                        {getStatusIcon(record.status)}
                        {record.status ? record.status.charAt(0).toUpperCase() + record.status.slice(1) : 'N/A'}
                      </span>
                    </td>
                  </tr>
                )
              ))}
              {filteredBorrowRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-gray-500 py-8">
                    No borrow records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Book Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative animate-fadeInUp">
            <h2 className="text-2xl font-bold mb-6 text-blue-700 flex items-center gap-2">
              <BookOpen className="w-6 h-6" /> Add New Book
            </h2>
            <form
              onSubmit={e => {
                e.preventDefault();
                handleCreateBook();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">Title<span className="text-red-500">*</span></label>
                  <input type="text" value={newBook.title} onChange={e => setNewBook({ ...newBook, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Author<span className="text-red-500">*</span></label>
                  <input type="text" value={newBook.author} onChange={e => setNewBook({ ...newBook, author: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block mb-1 font-medium">ISBN<span className="text-red-500">*</span></label>
                  <input type="text" value={newBook.isbn} onChange={e => setNewBook({ ...newBook, isbn: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Category<span className="text-red-500">*</span></label>
                  <input type="text" value={newBook.category} onChange={e => setNewBook({ ...newBook, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                </div>
                {/* Remove genre and publisher fields from the form */}
                <div>
                  <label className="block mb-1 font-medium">Published Year</label>
                  <input type="number" value={newBook.publishedYear} onChange={e => setNewBook({ ...newBook, publishedYear: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Total Copies<span className="text-red-500">*</span></label>
                  <input type="number" value={newBook.totalCopies} min={1} onChange={e => setNewBook({ ...newBook, totalCopies: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Location</label>
                  <input type="text" value={newBook.location} onChange={e => setNewBook({ ...newBook, location: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block mb-1 font-medium">Description</label>
                <textarea value={newBook.description} onChange={e => setNewBook({ ...newBook, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows={2} />
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Add Book</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryManagement;