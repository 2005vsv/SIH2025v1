import { Bell, Calendar, Edit, Eye, Filter, Megaphone, MessageSquare, Plus, Search, Send, Trash2, Users, Volume2, VolumeX } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { notificationAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminNotificationManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [stats, setStats] = useState({
    totalSent: 0,
    scheduled: 0,
    drafts: 0,
    totalRecipients: 0,
    averageReadRate: 0,
    urgentNotifications: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notifications');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showDetails, setShowDetails] = useState(null);

  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info',
    category: 'system',
    recipientType: 'all',
    targetAudience: {},
    priority: 'medium',
    expiresAt: '',
    actionUrl: '',
    actionText: ''
  });

  const [editingNotification, setEditingNotification] = useState(null);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    fetchNotificationData();
  }, []);

  const fetchNotificationData = async () => {
    try {
      setLoading(true);

      // Fetch notifications and stats from API
      const [notificationsResponse, statsResponse] = await Promise.all([
        notificationAPI.getAll({
          page: 1,
          limit: 50,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }),
        notificationAPI.getStats()
      ]);

      if (notificationsResponse.data && notificationsResponse.data.data) {
        setNotifications(notificationsResponse.data.data.notifications || []);
      }

      if (statsResponse.data && statsResponse.data.data) {
        const statsData = statsResponse.data.data;
        setStats({
          totalSent: statsData.totalSent || 0,
          scheduled: 0, // Backend doesn't track scheduled
          drafts: 0, // Backend doesn't have drafts
          totalRecipients: statsData.totalSent || 0, // Approximate
          averageReadRate: statsData.readRate ? statsData.readRate * 100 : 0,
          urgentNotifications: statsData.notificationsByPriority?.find(p => p._id === 'urgent')?.count || 0
        });
      }

      // Enhanced templates with auto-population
      const mockTemplates = [
        {
          _id: '1',
          name: 'Fee Payment Reminder',
          title: 'Fee Payment Reminder - Semester {semester}',
          message: 'Dear Student,\n\nYour semester {semester} tuition fees amounting to ₹{amount} are due by {due_date}. Please make the payment through the online portal to avoid late fees.\n\nLate fees will be applicable after the due date.\n\nRegards,\nFinance Department',
          type: 'warning',
          category: 'fee',
          priority: 'high',
          actionUrl: '/student/fees',
          actionText: 'Pay Now',
          isActive: true,
          usageCount: 15
        },
        {
          _id: '2',
          name: 'Exam Schedule Update',
          title: 'Exam Schedule Released - {exam_type} Examinations',
          message: 'Dear Students,\n\nThe {exam_type} examination schedule for Semester {semester} has been published. Please check your individual exam timetables in the Academics section.\n\nImportant dates:\n- Exam Start: {start_date}\n- Exam End: {end_date}\n\nBest of luck!\n\nAcademic Department',
          type: 'info',
          category: 'exam',
          priority: 'medium',
          actionUrl: '/student/academics',
          actionText: 'View Schedule',
          isActive: true,
          usageCount: 8
        },
        {
          _id: '3',
          name: 'Placement Drive Announcement',
          title: 'Campus Placement Drive - {company_name}',
          message: 'Dear Students,\n\n{company_name} will be conducting campus placement interviews on {drive_date} at {time}.\n\nEligibility: {eligibility}\nPackage: {package}\n\nInterested students can apply through the placement portal.\n\nPlacement Department',
          type: 'success',
          category: 'placement',
          priority: 'high',
          actionUrl: '/student/placements',
          actionText: 'Apply Now',
          isActive: true,
          usageCount: 12
        },
        {
          _id: '4',
          name: 'General Announcement',
          title: 'Important Announcement - {topic}',
          message: 'Dear Students,\n\n{announcement_content}\n\nPlease take note of this important information.\n\nRegards,\nAdministration',
          type: 'info',
          category: 'system',
          priority: 'medium',
          isActive: true,
          usageCount: 25
        },
        {
          _id: '5',
          name: 'Event Invitation',
          title: 'Event Invitation - {event_name}',
          message: 'Dear Students,\n\nYou are cordially invited to attend {event_name} on {event_date} at {venue}.\n\nEvent Details:\n{event_details}\n\nWe look forward to your participation.\n\nEvent Committee',
          type: 'info',
          category: 'system',
          priority: 'low',
          isActive: true,
          usageCount: 10
        },
        {
          _id: '6',
          name: 'Maintenance Alert',
          title: 'System Maintenance Notice',
          message: 'Dear Students,\n\nThe student portal will be undergoing scheduled maintenance on {maintenance_date} from {start_time} to {end_time}.\n\nServices may be temporarily unavailable during this period.\n\nWe apologize for any inconvenience.\n\nIT Department',
          type: 'warning',
          category: 'system',
          priority: 'medium',
          isActive: true,
          usageCount: 5
        }
      ];

      setTemplates(mockTemplates);
    } catch (error) {
      console.error('Error fetching notification data:', error);
      toast.error('Failed to load notification data');
    } finally {
      setLoading(false);
    }
  };

  const createNotification = async (e) => {
    e.preventDefault();
    try {
      console.log('Creating notification with data:', newNotification);

      // Map frontend fields to backend API format
      const notificationData = {
        title: newNotification.title,
        message: newNotification.message,
        type: newNotification.type,
        category: newNotification.category || 'system',
        recipientType: newNotification.recipientType,
        targetAudience: newNotification.targetAudience,
        priority: newNotification.priority,
        actionUrl: newNotification.actionUrl,
        actionText: newNotification.actionText,
        expiresAt: newNotification.expiresAt || undefined
      };

      console.log('Sending notification data to API:', notificationData);

      const response = await notificationAPI.create(notificationData);
      console.log('Notification creation response:', response);

      if (response.data && response.data.success) {
        toast.success(`Notification sent to ${response.data.data?.count || 0} students!`);
        setNewNotification({
          title: '',
          message: '',
          type: 'info',
          category: 'system',
          recipientType: 'all',
          targetAudience: {},
          priority: 'medium',
          expiresAt: '',
          actionUrl: '',
          actionText: ''
        });
        setActiveTab('notifications');
        fetchNotificationData(); // Refresh the list
      }
    } catch (error) {
      console.error('Error creating notification:', error);
      console.error('Error response:', error.response);
      toast.error(error.response?.data?.message || 'Failed to create notification');
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    try {
      await notificationAPI.delete(notificationId);
      toast.success('Notification deleted successfully');
      fetchNotificationData(); // Refresh the list
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error(error.response?.data?.message || 'Failed to delete notification');
    }
  };

  const updateNotificationStatus = async (notificationId, status) => {
    try {
      await notificationAPI.update(notificationId, { status });
      toast.success(`Notification ${status} successfully`);
      fetchNotificationData(); // Refresh the list
    } catch (error) {
      console.error('Error updating notification status:', error);
      toast.error(error.response?.data?.message || 'Failed to update notification');
    }
  };

  const editNotification = (notification) => {
    setEditingNotification(notification);
    setNewNotification({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      category: notification.category,
      recipientType: notification.recipientType,
      targetAudience: notification.targetAudience || {},
      priority: notification.priority,
      expiresAt: notification.expiresAt ? new Date(notification.expiresAt).toISOString().split('T')[0] : '',
      actionUrl: notification.actionUrl || '',
      actionText: notification.actionText || ''
    });
    setActiveTab('create');
  };

  const updateNotification = async (e) => {
    e.preventDefault();
    try {
      if (!editingNotification || !editingNotification._id) {
        toast.error('No notification selected for editing');
        return;
      }

      console.log('Updating notification:', editingNotification._id);
      console.log('Update data:', newNotification);

      const notificationData = {
        title: newNotification.title,
        message: newNotification.message,
        type: newNotification.type,
        category: newNotification.category,
        priority: newNotification.priority,
        actionUrl: newNotification.actionUrl,
        actionText: newNotification.actionText,
        expiresAt: newNotification.expiresAt || undefined
      };

      console.log('Sending update data:', notificationData);

      const response = await notificationAPI.update(editingNotification._id, notificationData);
      console.log('Update response:', response);

      if (response.data && response.data.success) {
        toast.success('Notification updated successfully!');
        setEditingNotification(null);
        setNewNotification({
          title: '',
          message: '',
          type: 'info',
          category: 'system',
          recipientType: 'all',
          targetAudience: {},
          priority: 'medium',
          expiresAt: '',
          actionUrl: '',
          actionText: ''
        });
        setActiveTab('notifications');
        fetchNotificationData();
      }
    } catch (error) {
      console.error('Error updating notification:', error);
      console.error('Error response:', error.response);
      toast.error(error.response?.data?.message || 'Failed to update notification');
    }
  };

  const resendNotification = async (notificationId) => {
    try {
      // For resend, we create a new notification with the same data
      const originalNotification = notifications.find(n => n._id === notificationId);
      if (!originalNotification) {
        toast.error('Notification not found');
        return;
      }

      console.log('Resending notification:', originalNotification);

      // Since individual notifications don't store recipientType/targetAudience,
      // we default to sending to all students for resend
      const resendData = {
        title: `${originalNotification.title} (Resent)`,
        message: originalNotification.message,
        type: originalNotification.type || 'info',
        category: originalNotification.category || 'system',
        recipientType: 'all', // Always resend to all students
        targetAudience: {}, // Empty for 'all' recipient type
        priority: originalNotification.priority || 'medium',
        actionUrl: originalNotification.actionUrl || '',
        actionText: originalNotification.actionText || ''
      };

      console.log('Resend data:', resendData);

      const response = await notificationAPI.create(resendData);
      console.log('Resend response:', response);

      if (response.data && response.data.success) {
        toast.success(`Notification resent to ${response.data.data?.count || 0} students!`);
        fetchNotificationData();
      }
    } catch (error) {
      console.error('Error resending notification:', error);
      console.error('Error response:', error.response);
      toast.error(error.response?.data?.message || 'Failed to resend notification');
    }
  };

  const bulkDeleteNotifications = async () => {
    if (selectedNotifications.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedNotifications.length} notifications?`)) return;

    try {
      await Promise.all(selectedNotifications.map(id => notificationAPI.delete(id)));
      toast.success(`${selectedNotifications.length} notifications deleted successfully`);
      setSelectedNotifications([]);
      fetchNotificationData();
    } catch (error) {
      console.error('Error bulk deleting notifications:', error);
      toast.error('Failed to delete some notifications');
    }
  };

  const selectTemplate = (template) => {
    setNewNotification({
      title: template.title,
      message: template.message,
      type: template.type,
      category: template.category,
      recipientType: 'all',
      targetAudience: {},
      priority: template.priority,
      expiresAt: '',
      actionUrl: template.actionUrl || '',
      actionText: template.actionText || ''
    });
    setShowTemplateModal(false);
    setActiveTab('create');
    toast.success(`Template "${template.name}" loaded`);
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n._id));
    }
  };

  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (notification.createdBy && notification.createdBy.name && notification.createdBy.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesPriority = filterStatus === 'all' || notification.priority === filterStatus;
    return matchesSearch && matchesType && matchesPriority;
  });

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
      scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      sent: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return colors[status] || colors.draft;
  };

  const getTypeColor = (type) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      academic: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      fee: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      hostel: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      placement: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      library: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return colors[type] || colors.general;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return colors[priority] || colors.medium;
  };

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
          <Bell className="w-6 h-6 text-blue-500" />
          Notification Management
        </h1>
        <div className="text-gray-500">Create, send, and manage notifications for students, faculty, and staff</div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-1">Total Sent</div>
          <div className="text-2xl font-bold">{stats.totalSent}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-1">Read Rate</div>
          <div className="text-2xl font-bold">{stats.averageReadRate.toFixed(1)}%</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-1">Urgent</div>
          <div className="text-2xl font-bold">{stats.urgentNotifications}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-1">Recipients</div>
          <div className="text-2xl font-bold">{stats.totalRecipients.toLocaleString()}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-1">Read Rate</div>
          <div className="text-2xl font-bold">{stats.averageReadRate.toFixed(1)}%</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-1">Urgent</div>
          <div className="text-2xl font-bold">{stats.urgentNotifications}</div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6 gap-4">
        <button
          onClick={() => setActiveTab('notifications')}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'notifications'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'create'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Create Notification
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'templates'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Templates ({templates.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'analytics'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Analytics
        </button>
      </div>

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div>
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
               value={filterStatus}
               onChange={(e) => setFilterStatus(e.target.value)}
             >
               <option value="all">All Priority</option>
               <option value="low">Low</option>
               <option value="medium">Medium</option>
               <option value="high">High</option>
               <option value="urgent">Urgent</option>
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
             {selectedNotifications.length > 0 && (
              <button
                onClick={bulkDeleteNotifications}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Selected ({selectedNotifications.length})
              </button>
            )}
          </div>

          {/* Notifications Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipients</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredNotifications.map((notification) => (
                    <tr key={notification._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedNotifications.includes(notification._id)}
                          onChange={() => handleSelectNotification(notification._id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                        {notification._id.slice(-8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white max-w-xs truncate">
                          {notification.title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                          {notification.message}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(notification.type)}`}>
                          {notification.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {notification.recipientType === 'all' ? 'All Students' : notification.recipientType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => editNotification(notification)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => resendNotification(notification._id)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            title="Resend"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteNotification(notification._id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredNotifications.length === 0 && (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notifications found</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                    ? 'Try adjusting your search or filter criteria.'
                    : 'No notifications have been sent yet.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Notification Tab */}
      {activeTab === 'create' && (
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {editingNotification ? 'Edit Notification' : 'Create New Notification'}
            </h2>
            <button
              onClick={() => setShowTemplateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Use Template
            </button>
          </div>

          <form onSubmit={editingNotification ? updateNotification : createNotification} className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">Title *</label>
                <input
                  type="text"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                  placeholder="Enter notification title"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">Type *</label>
                <select
                  value={newNotification.type}
                  onChange={(e) => setNewNotification({ ...newNotification, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="announcement">Announcement</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">Message *</label>
              <textarea
                value={newNotification.message}
                onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
                placeholder="Enter the notification message"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">Priority *</label>
                <select
                  value={newNotification.priority}
                  onChange={(e) => setNewNotification({ ...newNotification, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">Recipient Type *</label>
                <select
                  value={newNotification.recipientType}
                  onChange={(e) => setNewNotification({ ...newNotification, recipientType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Students</option>
                  <option value="department">By Department</option>
                  <option value="semester">By Semester</option>
                  <option value="specific">Specific Students</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">Expiration Date</label>
                <input
                  type="date"
                  value={newNotification.expiresAt}
                  onChange={(e) => setNewNotification({ ...newNotification, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">Action URL</label>
                <input
                  type="url"
                  value={newNotification.actionUrl}
                  onChange={(e) => setNewNotification({ ...newNotification, actionUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">Action Text</label>
                <input
                  type="text"
                  value={newNotification.actionText}
                  onChange={(e) => setNewNotification({ ...newNotification, actionText: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="View Details"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Send className="w-4 h-4" />
                {editingNotification ? 'Update Notification' : 'Send Notification'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewNotification({
                    title: '',
                    message: '',
                    type: 'info',
                    category: 'system',
                    recipientType: 'all',
                    targetAudience: {},
                    priority: 'medium',
                    expiresAt: '',
                    actionUrl: '',
                    actionText: ''
                  });
                  setEditingNotification(null);
                }}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
              >
                Clear Form
              </button>
              {editingNotification && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingNotification(null);
                    setNewNotification({
                      title: '',
                      message: '',
                      type: 'info',
                      category: 'system',
                      recipientType: 'all',
                      targetAudience: {},
                      priority: 'medium',
                      expiresAt: '',
                      actionUrl: '',
                      actionText: ''
                    });
                    setActiveTab('notifications');
                  }}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div>
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400">
              Pre-built notification templates to help you create common announcements quickly.
              Click "Use Template" to load a template into the create form.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <motion.div
                key={template._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{template.name}</h3>
                  <div className="flex gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(template.type)}`}>
                      {template.type}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(template.priority)}`}>
                      {template.priority}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title Preview:</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    {template.title}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message Preview:</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded max-h-20 overflow-hidden">
                    {template.message.split('\n')[0]}...
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <span>Used {template.usageCount} times</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${template.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'}`}>
                    {template.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <button
                  onClick={() => selectTemplate(template)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Use Template
                </button>
              </motion.div>
            ))}
          </div>

          {templates.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No templates available</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Templates help you create notifications quickly with pre-filled content.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sent</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSent}</p>
              </div>
              <Send className="h-8 w-8 text-blue-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Read Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageReadRate.toFixed(1)}%</p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Urgent Count</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.urgentNotifications}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Choose a Template</h2>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <motion.div
                    key={template._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer transition-colors"
                    onClick={() => selectTemplate(template)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                      <div className="flex gap-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(template.type)}`}>
                          {template.type}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(template.priority)}`}>
                          {template.priority}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                      {template.message.split('\n')[0]}
                    </p>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Used {template.usageCount} times
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminNotificationManagement;