import Joi from 'joi';

export const userValidation = {
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(50).trim(),
    profile: Joi.object({
      phone: Joi.string().pattern(/^[+]?[\d\s-()]+$/).trim(),
      address: Joi.string().max(500).trim(),
      dateOfBirth: Joi.date().max('now'),
      department: Joi.string().max(100).trim(),
      semester: Joi.number().integer().min(1).max(8),
      admissionYear: Joi.number().integer().min(1990).max(new Date().getFullYear()),
    }),
  }),

  updateUser: Joi.object({
    name: Joi.string().min(2).max(50).trim(),
    email: Joi.string().email().lowercase().trim(),
    role: Joi.string().valid('student', 'admin', 'faculty'),
    isActive: Joi.boolean(),
    studentId: Joi.string().trim(),
    profile: Joi.object({
      phone: Joi.string().pattern(/^[+]?[\d\s-()]+$/).trim(),
      address: Joi.string().max(500).trim(),
      dateOfBirth: Joi.date().max('now'),
      department: Joi.string().max(100).trim(),
      semester: Joi.number().integer().min(1).max(8),
      admissionYear: Joi.number().integer().min(1990).max(new Date().getFullYear()),
    }),
  }),

  createUser: Joi.object({
    name: Joi.string().min(2).max(50).trim().required(),
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string().min(6).max(128).required(),
    role: Joi.string().valid('student', 'admin', 'faculty').default('student'),
    studentId: Joi.string().trim(),
    profile: Joi.object({
      phone: Joi.string().pattern(/^[+]?[\d\s-()]+$/).trim(),
      address: Joi.string().max(500).trim(),
      dateOfBirth: Joi.date().max('now'),
      department: Joi.string().max(100).trim(),
      semester: Joi.number().integer().min(1).max(8),
      admissionYear: Joi.number().integer().min(1990).max(new Date().getFullYear()),
    }),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).max(128).required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
      .messages({
        'any.only': 'Confirm password must match new password',
      }),
  }),

  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().valid('name', 'email', 'createdAt', '-name', '-email', '-createdAt').default('-createdAt'),
    search: Joi.string().trim(),
    role: Joi.string().valid('student', 'admin', 'faculty'),
    isActive: Joi.boolean(),
    department: Joi.string().trim(),
    semester: Joi.number().integer().min(1).max(8),
  }),

  bulkImport: Joi.object({
    users: Joi.array().items(
      Joi.object({
        name: Joi.string().min(2).max(50).trim().required(),
        email: Joi.string().email().lowercase().trim().required(),
        role: Joi.string().valid('student', 'admin', 'faculty').default('student'),
        studentId: Joi.string().trim(),
        department: Joi.string().max(100).trim(),
        semester: Joi.number().integer().min(1).max(8),
        admissionYear: Joi.number().integer().min(1990).max(new Date().getFullYear()),
      })
    ).min(1).max(1000).required(),
  }),
};

export const authValidation = {
  register: Joi.object({
    name: Joi.string().min(2).max(50).trim().required(),
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string().min(6).max(128).required(),
    role: Joi.string().valid('student', 'admin', 'faculty').default('student'),
    studentId: Joi.string().trim(),
  }),

  login: Joi.object({
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string().required(),
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required(),
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().lowercase().trim().required(),
  }),

  resetPassword: Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(6).max(128).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required()
      .messages({
        'any.only': 'Confirm password must match password',
      }),
  }),
};