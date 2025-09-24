import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  Download,
  Users,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
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
    genre: '',
    publisher: '',
    publishedYear: new Date().getFullYear(),
    totalCopies: 1,
    description: '',
    location: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [booksResponse, borrowResponse] = await Promise.all([
        libraryAPI.getBooks(),
        libraryAPI.getBorrowHistory()
      ]);
      setBooks(booksResponse.data.data.books || []);
      setBorrowRecords(borrowResponse.data.data.borrowRecords || []);
    } catch (error) {
      console.error('Error fetching library data:', error);
      toast.error('Failed to load library data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBook = async () => {
    try {
      await libraryAPI.createBook(newBook);
      toast.success('Book added successfully');
      setShowCreateModal(false);
      setNewBook({
        title: '',
        author: '',
        isbn: '',
        genre: '',
        publisher: '',
        publishedYear: new Date().getFullYear(),
        totalCopies: 1,
        description: '',
        location: ''
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add book');
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
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.isbn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBorrowRecords = borrowRecords.filter(record =>
    record.bookId.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (record.userId.studentId && record.userId.studentId.toLowerCase().includes(searchTerm.toLowerCase()))
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBorrowRecords.map((record) => (
                <tr key={record._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-semibold">{record.userId.name}</div>
                    <div className="text-xs text-gray-500">{record.userId.studentId || record.userId.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold">{record.bookId.title}</div>
                    <div className="text-xs text-gray-500">{record.bookId.author}</div>
                  </td>
                  <td className="px-6 py-4">{new Date(record.borrowDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{new Date(record.dueDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(record.status)}`}>
                      {getStatusIcon(record.status)}
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {/* Add actions for borrow records if needed */}
                  </td>
                </tr>
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
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Book</h2>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Title</label>
              <input
                type="text"
                value={newBook.title}
                onChange={e => setNewBook({ ...newBook, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Author</label>
              <input
                type="text"
                value={newBook.author}
                onChange={e => setNewBook({ ...newBook, author: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">ISBN</label>
              <input
                type="text"
                value={newBook.isbn}
                onChange={e => setNewBook({ ...newBook, isbn: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Genre</label>
              <input
                type="text"
                value={newBook.genre}
                onChange={e => setNewBook({ ...newBook, genre: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Publisher</label>
              <input
                type="text"
                value={newBook.publisher}
                onChange={e => setNewBook({ ...newBook, publisher: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Published Year</label>
              <input
                type="number"
                value={newBook.publishedYear}
                onChange={e => setNewBook({ ...newBook, publishedYear: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Total Copies</label>
              <input
                type="number"
                value={newBook.totalCopies}
                min={1}
                onChange={e => setNewBook({ ...newBook, totalCopies: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Location</label>
              <input
                type="text"
                value={newBook.location}
                onChange={e => setNewBook({ ...newBook, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Description</label>
              <textarea
                value={newBook.description}
                onChange={e => setNewBook({ ...newBook, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={2}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBook}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Add Book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryManagement;