import { AuthResponse, User } from '../types';
import api from './api';

export const authService = {
  // Login
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Register
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
    studentId?: string;
  }): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Get profile
  getProfile: async (): Promise<{ success: boolean; data: { user: User } }> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data.data;
  },
};

export const feesService = {
  getFees: async () => {
    const response = await api.get('/fees');
    return response.data;
  },

  payFee: async (feeId: string, paymentData: any) => {
    const response = await api.post('/fees/pay', { feeId, ...paymentData });
    return response.data;
  },
};

export const libraryService = {
  getBooks: async () => {
    const response = await api.get('/library/books');
    return response.data;
  },

  borrowBook: async (bookId: string) => {
    const response = await api.post('/library/borrow', { bookId });
    return response.data;
  },

  returnBook: async (bookId: string) => {
    const response = await api.post('/library/return', { bookId });
    return response.data;
  },
};

export const examsService = {
  getExams: async () => {
    const response = await api.get('/exams');
    return response.data;
  },

  getResults: async () => {
    const response = await api.get('/exams/results');
    return response.data;
  },
};

export const placementsService = {
  getJobs: async () => {
    const response = await api.get('/placements/jobs');
    return response.data;
  },

  applyForJob: async (jobId: string, applicationData: any) => {
    const response = await api.post('/placements/apply', { jobId, ...applicationData });
    return response.data;
  },
};

export const certificatesService = {
  issueCertificate: async (certificateData: any) => {
    const response = await api.post('/certificates/issue', certificateData);
    return response.data;
  },

  verifyCertificate: async (certificateId: string) => {
    const response = await api.get(`/certificates/verify/${certificateId}`);
    return response.data;
  },
};

export const gamificationService = {
  getLeaderboard: async () => {
    const response = await api.get('/gamification/leaderboard');
    return response.data;
  },

  getBadges: async () => {
    const response = await api.get('/gamification/badges');
    return response.data;
  },
};

export const analyticsService = {
  getRiskScore: async () => {
    const response = await api.get('/analytics/score');
    return response.data;
  },
};