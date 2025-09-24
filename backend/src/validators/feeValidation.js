const Joi = require('joi');

const createFeeSchema = Joi.object({
  userId: Joi.string().required().messages({
    'any.required': 'User ID is required',
    'string.empty': 'User ID cannot be empty',
  }),
  feeType: Joi.string()
    .valid('tuition', 'hostel', 'library', 'examination', 'other')
    .required()
    .messages({
      'any.required': 'Fee type is required',
      'any.only': 'Fee type must be one of, hostel, library, examination, other',
    }),
  amount: Joi.number().positive().required().messages({
    'any.required': 'Amount is required',
    'number.positive': 'Amount must be positive',
  }),
  description: Joi.string().trim().required().messages({
    'any.required': 'Description is required',
    'string.empty': 'Description cannot be empty',
  }),
  dueDate: Joi.date().required().messages({
    'any.required': 'Due date is required',
    'date.base': 'Due date must be a valid date',
  }),
});

const updateFeeSchema = Joi.object({
  feeType: Joi.string()
    .valid('tuition', 'hostel', 'library', 'examination', 'other')
    .messages({
      'any.only': 'Fee type must be one of, hostel, library, examination, other',
    }),
  amount: Joi.number().positive().messages({
    'number.positive': 'Amount must be positive',
  }),
  description: Joi.string().trim().messages({
    'string.empty': 'Description cannot be empty',
  }),
  dueDate: Joi.date().messages({
    'date.base': 'Due date must be a valid date',
  }),
  status: Joi.string()
    .valid('pending', 'paid', 'overdue')
    .messages({
      'any.only': 'Status must be one of, paid, overdue',
    }),
});

const makePaymentSchema = Joi.object({
  amount: Joi.number().positive().messages({
    'number.positive': 'Amount must be positive',
  }),
  paymentMethod: Joi.string()
    .valid('online', 'cash', 'check', 'bank_transfer')
    .default('online')
    .messages({
      'any.only': 'Payment method must be one of, cash, check, bank_transfer',
    }),
  transactionId: Joi.string().trim().messages({
    'string.empty': 'Transaction ID cannot be empty',
  }),
});

module.exports = {
  createFeeSchema,
  updateFeeSchema,
  makePaymentSchema
};
