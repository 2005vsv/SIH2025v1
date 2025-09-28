import { motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, Bell, BellRing, CheckCircle, Download, Filter, MoreVertical, Search, Trash2, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useState } from 'react';
import { notificationAPI } from '../../services/api';
import socketService from '../../services/socket';
import toast from 'react-hot-toast';

const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRead, setFilterRead] = useState('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  // Removed selectedNotifications state as bulk actions are not supported

  useEffect(() => {
    fetchNotifications();

    // Set up real-time notification listener
    const handleNewNotification = (notification) => {
      console.log('Received real-time notification:', notification);
      setNotifications(prev => [notification, ...prev]);
      toast.success('New notification received!');
    };

    socketService.on('notification', handleNewNotification);

    return () => {
      socketService.off('notification', handleNewNotification);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getMy();
      if (response.data.success) {
        setNotifications(response.data.data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRead = async (notificationId) => {
    try {
      const notification = notifications.find(n => n._id === notificationId);
      if (!notification) return;

      if (notification.isRead) {
        // Mark as unread - this might not be supported by the API, so we'll just update locally
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === notificationId ? { ...notif, isRead: false } : notif
          )
        );
      } else {
        // Mark as read
        await notificationAPI.markAsRead(notificationId);
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
      }
    } catch (error) {
      console.error('Error toggling notification read status:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;

    try {
      await notificationAPI.delete(notificationId);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      toast.success('Notification deleted successfully');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error(error.response?.data?.message || 'Failed to delete notification');
    }
  };

  const downloadExamTimetable = (notification) => {
    if (!notification.data) return;

    const examData = notification.data;
    const jsonData = {
      examTimetable: {
        course: `${examData.courseName} (${examData.courseCode})`,
        examType: examData.examType,
        date: new Date(examData.examDate).toLocaleDateString(),
        time: `${examData.startTime} - ${examData.endTime}`,
        duration: `${examData.duration} minutes`,
        room: examData.room,
        building: examData.building || 'N/A',
        instructions: examData.instructions || 'N/A',
        generatedOn: new Date().toISOString()
      }
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam-timetable-${examData.courseCode}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Exam timetable downloaded!');
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n._id));
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesRead = filterRead === 'all' || 
                       (filterRead === 'read' && notification.isRead) ||
                       (filterRead === 'unread' && !notification.isRead);
    return matchesSearch && matchesType && matchesRead;
  });

  const getTypeColor = (type) => {
    const colors = {
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      announcement: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    };
    return colors[type] || colors.info;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
      medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    };
    return colors[priority] || colors.medium;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'error':
        return <AlertCircle className="h-5 w-5" />;
      case 'announcement':
        return <Bell className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading notifications...</p>
        </div>
      </div>
    );
  }

  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.isRead).length,
    urgent: notifications.filter(n => n.priority === 'urgent').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Stay updated with important announcements and updates
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
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 mr-4">
                <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Notifications</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
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
              <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/30 mr-4">
                <BellRing className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Unread</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.unread}</p>
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
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30 mr-4">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Urgent</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.urgent}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center">
                 <Filter className="h-4 w-4 text-gray-400 mr-2" />
               </div>
               <select
                 className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                 value={filterType}
                 onChange={(e) => setFilterType(e.target.value)}
               >
                 <option value="all">All Types</option>
                 <option value="info">Info</option>
                 <option value="success">Success</option>
                 <option value="warning">Warning</option>
                 <option value="error">Error</option>
                 <option value="announcement">Announcement</option>
               </select>
               <select
                 className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                 value={filterRead}
                 onChange={(e) => setFilterRead(e.target.value)}
               >
                 <option value="all">All</option>
                 <option value="read">Read</option>
                 <option value="unread">Unread</option>
               </select>
               <button
                 onClick={() => setSoundEnabled(!soundEnabled)}
                 className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                   soundEnabled
                     ? 'bg-green-600 text-white hover:bg-green-700'
                     : 'bg-gray-600 text-white hover:bg-gray-700'
                 }`}
                 title={soundEnabled ? 'Disable notification sounds' : 'Enable notification sounds'}
               >
                 {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                 {soundEnabled ? 'Sound On' : 'Sound Off'}
               </button>
               <button
                 onClick={handleMarkAllAsRead}
                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
               >
                 Mark All as Read
               </button>
             </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredNotifications.map((notification) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getTypeIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`text-sm font-medium ${
                          notification.isRead ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white font-semibold'
                        }`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                            {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                            {notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1)}
                          </span>
                          {!notification.isRead && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              New
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                      {notification.message}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm">
                        {notification.actionUrl && notification.actionText && (
                          <a
                            href={notification.actionUrl}
                            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                          >
                            {notification.actionText}
                          </a>
                        )}
                        {notification.category === 'exam' && (
                          <button
                            onClick={() => downloadExamTimetable(notification)}
                            className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 font-medium"
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </button>
                        )}
                        {notification.metadata?.sender && (
                          <span className="text-gray-500 dark:text-gray-400">
                            From: {notification.metadata.sender}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleToggleRead(notification._id)}
                          className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {notification.isRead ? 'Mark as unread' : 'Mark as read'}
                        </button>
                        <button
                          onClick={() => handleDeleteNotification(notification._id)}
                          className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredNotifications.length === 0 && (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notifications found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || filterType !== 'all' || filterRead !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'You\'re all caught up! No notifications to display.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentNotifications;
