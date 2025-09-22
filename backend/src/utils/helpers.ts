import crypto from 'crypto';
import QRCode from 'qrcode';

/**
 * Generate a unique QR code string
 */
export const generateQRCode = async (data: string): Promise<string> => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data);
    return qrCodeDataURL;
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Generate a SHA256 hash
 */
export const generateHash = (data: string): string => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Generate a unique identifier
 */
export const generateUniqueId = (): string => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * Calculate pagination metadata
 */
export const calculatePagination = (page: number, limit: number, total: number) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    hasNextPage,
    hasPrevPage,
  };
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generate random string
 */
export const generateRandomString = (length: number): string => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
};

/**
 * Format currency
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Calculate age from date of birth
 */
export const calculateAge = (dateOfBirth: Date): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Check if date is overdue
 */
export const isOverdue = (dueDate: Date): boolean => {
  return new Date() > new Date(dueDate);
};

/**
 * Generate student ID
 */
export const generateStudentId = (year: number, department: string): string => {
  const deptCode = department.substring(0, 3).toUpperCase();
  const randomNum = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `${year}${deptCode}${randomNum}`;
};