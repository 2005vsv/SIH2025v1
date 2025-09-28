import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { X, Bell, AlertCircle, CheckCircle, Info, AlertTriangle, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const NotificationToast = () => {
    const { socketService } = useAuth();
    const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!socketService) return;

    const handleNotification = (notification) => {
      console.log('Received notification:', notification);

      // Add notification to state
      setNotifications(prev => [{
        id: Date.now(),
        ...notification,
        timestamp: new Date(),
        visible: true
      }, ...prev]);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        setNotifications(prev =>
          prev.map(n =>
            n.id === notification.id + Date.now() ? { ...n, visible: false } : n
          )
        );
      }, 5000);
    };

    socketService.on('notification', handleNotification);

    return () => {
      socketService.off('notification', handleNotification);
    };
  }, [socketService]);

  const removeNotification = (id) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, visible: false } : n
      )
    );
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
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      case 'low':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications
          .filter(notification => notification.visible)
          .slice(0, 3) // Show max 3 notifications
          .map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 300, scale: 0.3 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.5, transition: { duration: 0.2 } }}
              className={`max-w-sm w-full ${getBgColor(notification.priority)} border rounded-lg shadow-lg p-4`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {getIcon(notification.type)}
                </div>
                <div className="ml-3 w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {notification.message}
                  </p>
                  {notification.actionUrl && (
                    <div className="mt-2 flex gap-2">
                      <a
                        href={notification.actionUrl}
                        className="text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                        {notification.actionText || 'View Details'}
                      </a>
                      {notification.category === 'exam' && (
                        <button
                          onClick={() => downloadExamTimetable(notification)}
                          className="text-sm font-medium text-green-600 hover:text-green-500 flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    className="bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => removeNotification(notification.id)}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationToast;