import axios from 'axios';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5001/api';

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
  (error) => {
    return Promise.reject(error);
  }
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
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  register: (userData: any) => api.post('/auth/register', userData),
  me: () => api.get('/auth/me'),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
  logout: () => api.post('/auth/logout'),
};

export const userAPI = {
  getAll: (params?: any) => api.get('/users', { params }),
  getById: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  create: (data: any) => api.post('/users', data),
};

export const feeAPI = {
  getAll: (params?: any) => api.get('/fees', { params }),
  getMy: (params?: any) => api.get('/fees', { params }), // Backend automatically filters by user
  getById: (id: string) => api.get(`/fees/${id}`),
  create: (data: any) => api.post('/fees', data),
  update: (id: string, data: any) => api.put(`/fees/${id}`, data),
  delete: (id: string) => api.delete(`/fees/${id}`),
  pay: (id: string, paymentData?: any) => api.post(`/fees/${id}/pay`, paymentData || {}),
  generateReceipt: (id: string) => api.get(`/fees/${id}/receipt`),
};

export const libraryAPI = {
  getBooks: (params?: any) => api.get('/library/books', { params }),
  getBook: (id: string) => api.get(`/library/books/${id}`),
  createBook: (data: any) => api.post('/library/books', data),
  updateBook: (id: string, data: any) => api.put(`/library/books/${id}`, data),
  deleteBook: (id: string) => api.delete(`/library/books/${id}`),
  borrowBook: (id: string) => api.post(`/library/books/${id}/borrow`),
  returnBook: (borrowId: string) => api.post(`/library/borrow/${borrowId}/return`),
  getBorrowHistory: () => api.get('/library/borrow-history'),
};

export const examAPI = {
  getAll: (params?: any) => api.get('/exams', { params }),
  getMy: () => api.get('/exams/my'),
  getById: (id: string) => api.get(`/exams/${id}`),
  create: (data: any) => api.post('/exams', data),
  update: (id: string, data: any) => api.put(`/exams/${id}`, data),
  getResults: (examId: string) => api.get(`/exams/${examId}/results`),
  submitResult: (examId: string, data: any) => api.post(`/exams/${examId}/results`, data),
};

export const placementAPI = {
  getJobs: (params?: any) => api.get('/placements/jobs', { params }),
  getJob: (id: string) => api.get(`/placements/jobs/${id}`),
  createJob: (data: any) => api.post('/placements/jobs', data),
  updateJob: (id: string, data: any) => api.put(`/placements/jobs/${id}`, data),
  applyJob: (id: string, data: any) => api.post(`/placements/jobs/${id}/apply`, data),
  getMyApplications: () => api.get('/placements/applications/my'),
  getApplications: (jobId: string) => api.get(`/placements/jobs/${jobId}/applications`),
};

export const gamificationAPI = {
  getLeaderboard: (params?: any) => api.get('/gamification/leaderboard', { params }),
  getBadges: () => api.get('/gamification/badges'),
  getMyPoints: () => api.get('/gamification/points/my'),
  getMyBadges: () => api.get('/gamification/badges/my'),
};

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getUsers: (params?: any) => api.get('/analytics/users', { params }),
  getFees: (params?: any) => api.get('/analytics/fees', { params }),
  getLibrary: (params?: any) => api.get('/analytics/library', { params }),
  getPlacements: (params?: any) => api.get('/analytics/placements', { params }),
};

export const notificationAPI = {
  getAll: (params?: any) => api.get('/notifications', { params }),
  getMy: (params?: any) => api.get('/notifications/my', { params }),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  create: (data: any) => api.post('/notifications', data),
};

export default api;