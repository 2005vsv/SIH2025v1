import { motion } from 'framer-motion';
import React, { useState } from 'react';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  status: 'available' | 'borrowed' | 'reserved';
  dueDate?: string;
  location: string;
}

interface BorrowedBook {
  id: string;
  title: string;
  author: string;
  borrowDate: string;
  dueDate: string;
  renewalCount: number;
  fine: number;
}

const Library: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'search' | 'borrowed' | 'history'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [books] = useState<Book[]>([
    {
      id: '1',
      title: 'Introduction to Algorithms',
      author: 'Thomas H. Cormen',
      isbn: '9780262033848',
      category: 'Computer Science',
      status: 'available',
      location: 'CS Section - Shelf 12'
    },
    {
      id: '2',
      title: 'Clean Code',
      author: 'Robert C. Martin',
      isbn: '9780132350884',
      category: 'Software Engineering',
      status: 'available',
      location: 'CS Section - Shelf 8'
    },
    {
      id: '3',
      title: 'Database System Concepts',
      author: 'Abraham Silberschatz',
      isbn: '9780073523323',
      category: 'Database',
      status: 'borrowed',
      dueDate: '2025-10-15',
      location: 'CS Section - Shelf 15'
    },
    {
      id: '4',
      title: 'Machine Learning Yearning',
      author: 'Andrew Ng',
      isbn: '9780999853207',
      category: 'Machine Learning',
      status: 'available',
      location: 'AI Section - Shelf 3'
    }
  ]);

  const [borrowedBooks] = useState<BorrowedBook[]>([
    {
      id: '1',
      title: 'Software Engineering',
      author: 'Ian Sommerville',
      borrowDate: '2025-08-15',
      dueDate: '2025-09-30',
      renewalCount: 1,
      fine: 0
    },
    {
      id: '2',
      title: 'Operating System Concepts',
      author: 'Abraham Silberschatz',
      borrowDate: '2025-09-01',
      dueDate: '2025-10-15',
      renewalCount: 0,
      fine: 0
    }
  ]);

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'borrowed': return 'text-red-600 bg-red-100';
      case 'reserved': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const calculateDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Library Portal</h1>
            <p className="text-gray-600 text-lg">Search, borrow, and manage your library resources</p>
          </div>
        </motion.div>

        {/* Library Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{borrowedBooks.length}</p>
              <p className="text-sm text-gray-600 mt-1">Books Borrowed</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">15,000+</p>
              <p className="text-sm text-gray-600 mt-1">Total Books</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">0</p>
              <p className="text-sm text-gray-600 mt-1">Pending Fines</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">5</p>
              <p className="text-sm text-gray-600 mt-1">Max Limit</p>
            </div>
          </motion.div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'search', label: 'Search Books' },
                { id: 'borrowed', label: 'My Books' },
                { id: 'history', label: 'History' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Search Books Tab */}
        {activeTab === 'search' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="max-w-md mx-auto">
                <input
                  type="text"
                  placeholder="Search by title, author, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Books Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{book.title}</h3>
                      <p className="text-sm text-gray-600">by {book.author}</p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(book.status)}`}>
                      {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm"><span className="text-gray-600">ISBN:</span> {book.isbn}</p>
                    <p className="text-sm"><span className="text-gray-600">Category:</span> {book.category}</p>
                    <p className="text-sm"><span className="text-gray-600">Location:</span> {book.location}</p>
                    {book.dueDate && (
                      <p className="text-sm"><span className="text-gray-600">Available from:</span> {new Date(book.dueDate).toLocaleDateString()}</p>
                    )}
                  </div>

                  <button 
                    disabled={book.status !== 'available'}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      book.status === 'available'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {book.status === 'available' ? 'Borrow Book' : 'Unavailable'}
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Borrowed Books Tab */}
        {activeTab === 'borrowed' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Currently Borrowed Books</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Book</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Borrow Date</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Days Left</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Fine</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {borrowedBooks.map((book) => {
                      const daysLeft = calculateDaysUntilDue(book.dueDate);
                      return (
                        <tr key={book.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{book.title}</div>
                              <div className="text-sm text-gray-500">by {book.author}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(book.borrowDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(book.dueDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${
                              daysLeft < 0 ? 'text-red-600' : daysLeft <= 3 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days`}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{book.fine}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs">
                              Renew
                            </button>
                            <button className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs">
                              Return
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Borrowing History</h2>
            <div className="text-center py-8 text-gray-500">
              <p>Your borrowing history will appear here.</p>
              <p className="text-sm mt-2">No previous borrowing records found.</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Library;