export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'admin' | 'faculty';
  studentId?: string;
  profile?: {
    phone?: string;
    address?: string;
    dateOfBirth?: string;
    department?: string;
    semester?: number;
    admissionYear?: number;
  };
  gamification?: {
    points: number;
    badges: string[];
    level: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface Fee {
  _id: string;
  userId: string;
  feeType: 'tuition' | 'hostel' | 'library' | 'examination' | 'other';
  amount: number;
  description: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  paidAt?: string;
  paymentMethod?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Book {
  _id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  description?: string;
  totalCopies: number;
  availableCopies: number;
  qrCode: string;
  location?: string;
  publishedYear?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Exam {
  _id: string;
  subject: string;
  examType: 'midterm' | 'final' | 'quiz' | 'assignment';
  date: string;
  duration: number;
  totalMarks: number;
  semester: number;
  department: string;
  location?: string;
  instructions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  _id: string;
  company: string;
  position: string;
  description: string;
  requirements: string[];
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  location: string;
  jobType: 'full-time' | 'part-time' | 'internship' | 'contract';
  applicationDeadline: string;
  status: 'active' | 'closed' | 'draft';
  postedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Certificate {
  _id: string;
  userId: string;
  type: 'course_completion' | 'degree' | 'achievement' | 'participation';
  title: string;
  description: string;
  issueDate: string;
  validUntil?: string;
  hash: string;
  qrCode: string;
  issuedBy: string;
  verificationUrl: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Analytics {
  score: 'Low' | 'Medium' | 'High';
  factors: {
    academic: number;
    financial: number;
    engagement: number;
  };
  recommendations: string[];
}

export interface DashboardStats {
  totalFees: number;
  pendingFees: number;
  booksIssued: number;
  upcomingExams: number;
  points: number;
  level: number;
}