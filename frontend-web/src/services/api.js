import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  me: () => api.get('/auth/me'),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  logout: () => api.post('/auth/logout'),
};

export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  create: (data) => api.post('/users', data),
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

export const examAPI = {
  getAll: (params) => api.get('/exams', { params }),
  getMy: () => api.get('/exams/my'),
  getById: (id) => api.get(`/exams/${id}`),
  create: (data) => api.post('/exams', data),
  update: (id, data) => api.put(`/exams/${id}`, data),
  getResults: (examId) => api.get(`/exams/${examId}/results`),
  submitResult: (examId, data) => api.post(`/exams/${examId}/results`, data),
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

export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getMy: (params) => api.get('/notifications/my', { params }),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  create: (data) => api.post('/notifications', data),
};

export default api;