import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// API Service Functions
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  me: () => api.get('/auth/profile'),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout: () => api.post('/auth/logout'),
};

export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  create: (data) => api.post('/users', data),
  registerAdmin: (data) => api.post('/users/register-admin', data),
  changeAdminPassword: (data) => api.post('/users/change-admin-password', data),
};

export const feeAPI = {
  getAll: (params) => api.get('/fees', { params }),
  getMy: (params) => api.get('/fees', { params }), // Backend automatically filters by user
  getById: (id) => api.get(`/fees/${id}`),
  create: (data) => api.post('/fees', data),
  update: (id, data) => api.put(`/fees/${id}`, data),
  delete: (id) => api.delete(`/fees/${id}`),
  pay: (id, paymentData) => api.post(`/fees/${id}/pay`, paymentData || {}),
  generateReceipt: (id) => api.get(`/fees/${id}/receipt`),
  createPaymentOrder: (data) => api.post('/fees/payment-order', data),
  verifyPayment: (data) => api.post('/fees/verify-payment', data),
  getGatewayConfig: () => api.get('/fees/gateway/config'),
};

export const libraryAPI = {
  getBooks: (params) => api.get('/library/books', { params }),
  getBook: (id) => api.get(`/library/books/${id}`),
  createBook: (data) => api.post('/library/books', data),
  updateBook: (id, data) => api.put(`/library/books/${id}`, data),
  deleteBook: (id) => api.delete(`/library/books/${id}`),
  borrowBook: (id) => api.post(`/library/books/${id}/borrow`),
  returnBook: (borrowId) => api.post(`/library/borrow/${borrowId}/return`),
  getBorrowHistory: () => api.get('/library/borrow-history'),
};



export const placementAPI = {
  getJobs: (params) => api.get('/placements/jobs', { params }),
  getJob: (id) => api.get(`/placements/jobs/${id}`),
  createJob: (data) => api.post('/placements/jobs', data),
  updateJob: (id, data) => api.put(`/placements/jobs/${id}`, data),
  applyJob: (id, data) => api.post(`/placements/jobs/${id}/apply`, data),
  getMyApplications: () => api.get('/placements/applications/my'),
  getApplications: (jobId) => api.get(`/placements/jobs/${jobId}/applications`),
};

export const gamificationAPI = {
  getLeaderboard: (params) => api.get('/gamification/leaderboard', { params }),
  getBadges: () => api.get('/gamification/badges'),
  getMyPoints: () => api.get('/gamification/points/my'),
  getMyBadges: () => api.get('/gamification/badges/my'),
};

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getUsers: (params) => api.get('/analytics/users', { params }),
  getFees: (params) => api.get('/analytics/fees', { params }),
  getLibrary: (params) => api.get('/analytics/library', { params }),
  getPlacements: (params) => api.get('/analytics/placements', { params }),
};

export const academicReportAPI = {
  generateTranscript: (studentId, params) => api.get(`/academic-reports/transcript/${studentId}`, { params }),
  getAcademicSummary: (params) => api.get('/academic-reports/summary', { params }),
  getStudentPerformance: (studentId) => api.get(`/academic-reports/student-performance/${studentId}`),
  getCourseAnalysis: (courseId, params) => api.get(`/academic-reports/course-analysis/${courseId}`, { params }),
};

export const courseAPI = {
  getAll: (params) => api.get('/courses', { params }),
  getAvailable: (params) => api.get('/courses/available', { params }),
  getMyCourses: () => api.get('/courses/my-courses'),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  enroll: (id) => api.post(`/courses/${id}/enroll`),
  drop: (id) => api.delete(`/courses/${id}/drop`),
  getStats: () => api.get('/courses/stats'),
};


export const gradeAPI = {
  getAll: (params) => api.get('/grades', { params }),
  getById: (id) => api.get(`/grades/${id}`),
  create: (data) => api.post('/grades', data),
  update: (id, data) => api.put(`/grades/${id}`, data),
  delete: (id) => api.delete(`/grades/${id}`),
  getStudentGrades: (studentId, params) => api.get(`/grades/student/${studentId}`, { params }),
  getCourseGrades: (courseId, params) => api.get(`/grades/course/${courseId}`, { params }),
  bulkCreate: (data) => api.post('/grades/bulk', data),
  getStats: (params) => api.get('/grades/stats', { params }),
};

export const semesterAPI = {
  getAll: (params) => api.get('/semesters', { params }),
  getById: (id) => api.get(`/semesters/${id}`),
  create: (data) => api.post('/semesters', data),
  update: (id, data) => api.put(`/semesters/${id}`, data),
  delete: (id) => api.delete(`/semesters/${id}`),
  getCurrent: () => api.get('/semesters/current'),
  addCourses: (id, data) => api.post(`/semesters/${id}/courses`, data),
  removeCourses: (id, data) => api.delete(`/semesters/${id}/courses`, { data }),
  getStats: (id) => api.get(`/semesters/${id}/stats`),
};

export const assignmentAPI = {
  create: (data) => api.post('/assignments', data),
  getCourseAssignments: (courseId, params) => api.get(`/assignments/course/${courseId}`, { params }),
  getAssignment: (id) => api.get(`/assignments/${id}`),
  update: (id, data) => api.put(`/assignments/${id}`, data),
  publish: (id) => api.patch(`/assignments/${id}/publish`),
  submit: (id, data) => api.post(`/assignments/${id}/submit`, data),
  getSubmissions: (id, params) => api.get(`/assignments/${id}/submissions`, { params }),
  gradeSubmission: (submissionId, data) => api.put(`/assignments/submissions/${submissionId}/grade`, data),
  getMySubmissions: (params) => api.get('/assignments/my-submissions', { params }),
};

export const examAPI = {
  getAll: (params) => api.get('/exams', { params }),
  getExam: (id) => api.get(`/exams/${id}`),
  create: (data) => api.post('/exams', data),
  update: (id, data) => api.put(`/exams/${id}`, data),
  delete: (id) => api.delete(`/exams/${id}`),
  getMyTimetable: (params) => api.get('/exams/my-timetable', { params }),
  getStats: (params) => api.get('/exams/stats', { params }),
  bulkCreate: (data) => api.post('/exams/bulk', data),
  startOnlineExam: (id, data) => api.post(`/exams/${id}/start`, data),
  submitOnlineExam: (id, data) => api.post(`/exams/${id}/submit`, data),
  saveExamProgress: (id, data) => api.post(`/exams/${id}/save-progress`, data),
  generateHallTickets: (id) => api.post(`/exams/${id}/generate-hall-tickets`),
  getHallTicket: (id) => api.get(`/exams/${id}/hall-ticket`),
  getProctoringReport: (id, studentId) => api.get(`/exams/${id}/proctoring/${studentId}`),
};

export const notificationAPI = {
  getAll: (params) => api.get('/notifications/all', { params }),
  getMy: (params) => api.get('/notifications/my', { params }),
  getById: (id) => api.get(`/notifications/${id}`),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/mark-all-read'),
  create: (data) => api.post('/notifications', data),
  update: (id, data) => api.put(`/notifications/${id}`, data),
  delete: (id) => api.delete(`/notifications/${id}`),
  sendFeeNotification: (data) => api.post('/notifications/fee/send', data),
  getFeeNotifications: (params) => api.get('/notifications/fee/my', { params }),
  getStats: (params) => api.get('/notifications/stats', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

export const hostelAPI = {
  // Rooms
  getRooms: (params) => api.get('/hostel/rooms', { params }),
  getRoomById: (id) => api.get(`/hostel/rooms/${id}`),
  createRoom: (data) => api.post('/hostel/rooms', data),
  updateRoom: (id, data) => api.put(`/hostel/rooms/${id}`, data),
  deleteRoom: (id) => api.delete(`/hostel/rooms/${id}`),

  // Allocations
  getAllocations: (params) => api.get('/hostel/allocations', { params }),
  requestAllocation: (data) => api.post('/hostel/allocations', data),
  updateAllocationStatus: (id, data) => api.put(`/hostel/allocations/${id}`, data),
  deleteAllocation: (id) => api.delete(`/hostel/allocations/${id}`),

  // Service Requests
  getServiceRequests: (params) => api.get('/hostel/service-requests', { params }),
  createServiceRequest: (data) => api.post('/hostel/service-requests', data),
  updateServiceRequest: (id, data) => api.put(`/hostel/service-requests/${id}`, data),
  deleteServiceRequest: (id) => api.delete(`/hostel/service-requests/${id}`),

  // Student specific
  getMyRoom: () => api.get('/hostel/my-room'),
  createChangeRequest: (data) => api.post('/hostel/change-request', data),

  // Stats
  getStats: () => api.get('/hostel/stats'),

  // Notifications for hostel actions
  notifyRoomAdded: (roomData) => api.post('/notifications', {
    title: 'New Room Added',
    message: `Room ${roomData.roomNumber} in Block ${roomData.block} has been added to the hostel.`,
    type: 'info',
    category: 'hostel',
    priority: 'low',
    recipientType: 'all'
  }),
  notifyAllocationRequest: (allocationData) => api.post('/notifications', {
    title: 'Room Allocation Request',
    message: `A new room allocation request has been submitted for Room ${allocationData.roomId?.roomNumber || 'N/A'}.`,
    type: 'info',
    category: 'hostel',
    priority: 'medium',
    recipientType: 'admin'
  }),
  notifyAllocationApproved: (allocationData) => api.post('/notifications', {
    title: 'Room Allocation Approved',
    message: `Your room allocation for Room ${allocationData.roomId?.roomNumber || 'N/A'} has been approved.`,
    type: 'success',
    category: 'hostel',
    priority: 'high',
    recipientType: 'specific',
    recipients: [allocationData.userId]
  }),
  notifyAllocationRejected: (allocationData) => api.post('/notifications', {
    title: 'Room Allocation Request Rejected',
    message: `Your room allocation request for Room ${allocationData.roomId?.roomNumber || 'N/A'} has been rejected.`,
    type: 'warning',
    category: 'hostel',
    priority: 'medium',
    recipientType: 'specific',
    recipients: [allocationData.userId]
  }),
  notifyServiceRequestSubmitted: (requestData) => api.post('/notifications', {
    title: 'Service Request Submitted',
    message: `Your ${requestData.type.replace('_', ' ')} request has been submitted and is being reviewed.`,
    type: 'info',
    category: 'hostel',
    priority: 'medium',
    recipientType: 'specific',
    recipients: [requestData.userId]
  }),
  notifyServiceRequestUpdated: (requestData, status) => api.post('/notifications', {
    title: `Service Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    message: `Your ${requestData.type.replace('_', ' ')} request has been ${status.replace('_', ' ')}.`,
    type: status === 'resolved' ? 'success' : 'info',
    category: 'hostel',
    priority: status === 'resolved' ? 'high' : 'medium',
    recipientType: 'specific',
    recipients: [requestData.userId]
  }),
  notifyRoomChangeApproved: (requestData) => api.post('/notifications', {
    title: 'Room Change Approved',
    message: `Your room change request has been approved. You have been moved to Room ${requestData.requestedRoom?.roomNumber || 'N/A'}.`,
    type: 'success',
    category: 'hostel',
    priority: 'high',
    recipientType: 'specific',
    recipients: [requestData.userId]
  }),
  notifyRoomReassigned: (allocationData, oldRoom, newRoom) => api.post('/notifications', {
    title: 'Room Reassigned by Admin',
    message: `Your room has been changed from Room ${oldRoom?.roomNumber || 'N/A'} to Room ${newRoom?.roomNumber || 'N/A'}.`,
    type: 'info',
    category: 'hostel',
    priority: 'high',
    recipientType: 'specific',
    recipients: [allocationData.userId]
  }),
  reassignRoom: (data) => api.put('/hostel/reassign-room', data),
};

export default api;