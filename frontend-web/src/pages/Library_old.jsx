import { motion } from 'framer-motion';
import { useState } from 'react';

const Library = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [books] = useState([
    {
      id: 1,
      title: 'React Complete Guide',
      author: 'John Doe',
      isbn: '978-0123456789',
      category: 'Programming',
      status: 'available',
      location: 'Section A, Shelf 3'
    },
    {
      id: 2,
      title: 'JavaScript Fundamentals',
      author: 'Jane Smith',
      isbn: '978-0987654321',
      category: 'Programming',
      status: 'borrowed',
      dueDate: '2024-01-15',
      location: 'Section A, Shelf 2'
    }
  ]);

  const [borrowedBooks] = useState([
    {
      id: 1,
      title: 'Advanced React Patterns',
      author: 'Sarah Wilson',
      borrowDate: '2023-12-01',
      dueDate: '2024-01-01',
      renewalCount: 0,
      fine: 0
    },
    {
      id: 2,
      title: 'Node.js Best Practices',
      author: 'Mike Johnson',
      borrowDate: '2023-11-15',
      dueDate: '2023-12-15',
      renewalCount: 1,
      fine: 5
    }
  ]);

  const tabs = [
    { id: 'search', label: 'Search Books' },
    { id: 'borrowed', label: 'My Books' },
    { id: 'history', label: 'History' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'text-green-600 bg-green-100';
      case 'borrowed': return 'text-red-600 bg-red-100';
      case 'reserved': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const calculateDaysUntilDue = (dueDate) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Library Portal (Old Version)</h1>
            <p className="text-gray-600">Search, borrow, and manage your library resources</p>
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
              <p className="text-gray-600">Books Borrowed</p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{books.filter(b => b.status === 'available').length}</p>
              <p className="text-gray-600">Available Books</p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">2</p>
              <p className="text-gray-600">Overdue Books</p>
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
              <p className="text-gray-600">Reserved Books</p>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6"
          >
            {activeTab === 'search' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Search Books</h3>
                <input
                  type="text"
                  placeholder="Search by title, author, or ISBN..."
                  className="w-full p-3 border border-gray-300 rounded-lg mb-6"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {books.filter(book =>
                    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    book.author.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map((book) => (
                    <motion.div
                      key={book.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <h4 className="font-semibold text-gray-900 mb-2">{book.title}</h4>
                      <p className="text-gray-600 mb-2">by {book.author}</p>
                      <p className="text-sm text-gray-500 mb-3">{book.category}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(book.status)}`}>
                          {book.status}
                        </span>
                        {book.status === 'available' && (
                          <button className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700">
                            Borrow
                          </button>
                        )}
                        {book.status === 'borrowed' && book.dueDate && (
                          <span className="text-xs text-gray-500">
                            Available from: {new Date(book.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'borrowed' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">My Borrowed Books</h3>
                <div className="space-y-4">
                  {borrowedBooks.map((book) => (
                    <motion.div
                      key={book.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-semibold text-gray-900">{book.title}</h4>
                        <p className="text-gray-600">by {book.author}</p>
                        <p className="text-sm text-gray-500">
                          Due: {new Date(book.dueDate).toLocaleDateString()}
                        </p>
                        {book.fine > 0 && (
                          <p className="text-sm text-red-600">Fine: ${book.fine}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          calculateDaysUntilDue(book.dueDate) < 0 
                            ? 'text-red-800 bg-red-100'
                            : calculateDaysUntilDue(book.dueDate) <= 3
                            ? 'text-yellow-800 bg-yellow-100'
                            : 'text-green-800 bg-green-100'
                        }`}>
                          {calculateDaysUntilDue(book.dueDate) < 0 
                            ? `${Math.abs(calculateDaysUntilDue(book.dueDate))} days overdue`
                            : calculateDaysUntilDue(book.dueDate) === 0
                            ? 'Due today'
                            : `${calculateDaysUntilDue(book.dueDate)} days left`
                          }
                        </span>
                        
                        <button className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700">
                          Return
                        </button>
                        
                        {book.renewalCount < 2 && (
                          <button className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700">
                            Renew
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Borrowing History</h3>
                <div className="text-center py-8">
                  <p className="text-gray-600">Your borrowing history will appear here.</p>
                  <p className="text-gray-500 text-sm mt-2">No previous borrowing records found.</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Library;
