import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'student' | 'admin' | 'faculty';
    studentId?: string;
  };
}

export interface JWTPayload {
  id: string;
  email: string;
  role: 'student' | 'admin' | 'faculty';
  studentId?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  stack?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// User related types
export interface UserDocument {
  _id: string;
  email: string;
  password: string;
  name: string;
  role: 'student' | 'admin' | 'faculty';
  studentId?: string;
  isActive: boolean;
  profile?: {
    phone?: string;
    address?: string;
    dateOfBirth?: Date;
    department?: string;
    semester?: number;
    admissionYear?: number;
  };
  gamification?: {
    points: number;
    badges: string[];
    level: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Fee related types
export interface FeeDocument {
  _id: string;
  userId: string;
  feeType: 'tuition' | 'hostel' | 'library' | 'examination' | 'other';
  amount: number;
  description: string;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue';
  paidAt?: Date;
  paymentMethod?: string;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Hostel related types
export interface HostelDocument {
  _id: string;
  userId: string;
  roomNumber: string;
  block: string;
  roomType: 'single' | 'double' | 'triple';
  allocationDate: Date;
  status: 'allocated' | 'pending' | 'vacated';
  roommates?: string[];
  preferences?: {
    preferredBlock?: string;
    preferredRoomType?: string;
    specialRequirements?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Library related types
export interface BookDocument {
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
  createdAt: Date;
  updatedAt: Date;
}

export interface BorrowDocument {
  _id: string;
  userId: string;
  bookId: string;
  borrowDate: Date;
  dueDate: Date;
  returnDate?: Date;
  status: 'borrowed' | 'returned' | 'overdue';
  fine?: number;
  renewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Exam related types
export interface ExamDocument {
  _id: string;
  subject: string;
  examType: 'midterm' | 'final' | 'quiz' | 'assignment';
  date: Date;
  duration: number; // in minutes
  totalMarks: number;
  semester: number;
  department: string;
  location?: string;
  instructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResultDocument {
  _id: string;
  userId: string;
  examId: string;
  marksObtained: number;
  grade: string;
  remarks?: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Placement related types
export interface JobDocument {
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
  applicationDeadline: Date;
  status: 'active' | 'closed' | 'draft';
  postedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApplicationDocument {
  _id: string;
  userId: string;
  jobId: string;
  status: 'applied' | 'shortlisted' | 'interviewed' | 'selected' | 'rejected';
  resume?: string; // file path
  coverLetter?: string;
  appliedAt: Date;
  lastUpdated: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Certificate related types
export interface CertificateDocument {
  _id: string;
  userId: string;
  type: 'course_completion' | 'degree' | 'achievement' | 'participation';
  title: string;
  description: string;
  issueDate: Date;
  validUntil?: Date;
  hash: string; // Blockchain hash
  qrCode: string;
  issuedBy: string;
  verificationUrl: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Analytics types
export interface AnalyticsData {
  userId: string;
  gpa?: number;
  attendance?: number;
  unpaidFees?: number;
  libraryUsage?: number;
  extracurricularParticipation?: number;
  lastLoginDate?: Date;
}

export interface RiskScore {
  score: 'Low' | 'Medium' | 'High';
  factors: {
    academic: number;
    financial: number;
    engagement: number;
  };
  recommendations: string[];
}

// Chatbot types
export interface ChatIntent {
  intent: string;
  entities?: Record<string, any>;
  confidence: number;
}

export interface ChatResponse {
  message: string;
  quickReplies?: string[];
  attachments?: any[];
}

// Notification types
export interface NotificationDocument {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}