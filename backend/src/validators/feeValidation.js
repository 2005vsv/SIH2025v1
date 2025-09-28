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
    .valid('card', 'bank_transfer', 'upi', 'wallet', 'cash')
    .default('card')
    .messages({
      'any.only': 'Payment method must be one of card, bank_transfer, upi, wallet, cash',
    }),
  transactionId: Joi.string().trim().messages({
    'string.empty': 'Transaction ID cannot be empty',
  }),
});

const bulkCreateFeesSchema = Joi.object({
  studentIds: Joi.array()
    .items(Joi.string().required())
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one student ID is required',
      'any.required': 'Student IDs are required',
    }),
  feeData: Joi.object({
    feeType: Joi.string()
      .valid('tuition', 'hostel', 'library', 'examination', 'other')
      .required()
      .messages({
        'any.required': 'Fee type is required',
        'any.only': 'Fee type must be one of tuition, hostel, library, examination, other',
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
    academicYear: Joi.string().trim().messages({
      'string.empty': 'Academic year cannot be empty',
    }),
    semester: Joi.string().trim().messages({
      'string.empty': 'Semester cannot be empty',
    }),
    category: Joi.string()
      .valid('academic', 'administrative', 'facility', 'other')
      .default('academic')
      .messages({
        'any.only': 'Category must be one of academic, administrative, facility, other',
      }),
    priority: Joi.string()
      .valid('low', 'medium', 'high', 'urgent')
      .default('medium')
      .messages({
        'any.only': 'Priority must be one of low, medium, high, urgent',
      }),
  }).required().messages({
    'any.required': 'Fee data is required',
  }),
});

const applyDiscountWaiverSchema = Joi.object({
  type: Joi.string()
    .valid('discount', 'waiver')
    .required()
    .messages({
      'any.required': 'Type is required',
      'any.only': 'Type must be either discount or waiver',
    }),
  amount: Joi.number().positive().when('type', {
    is: 'waiver',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }).messages({
    'any.required': 'Amount is required for waiver',
    'number.positive': 'Amount must be positive',
  }),
  percentage: Joi.number().min(0).max(100).when('type', {
    is: 'discount',
    then: Joi.optional(),
    otherwise: Joi.forbidden(),
  }).messages({
    'number.min': 'Percentage must be at least 0',
    'number.max': 'Percentage cannot exceed 100',
  }),
  reason: Joi.string().trim().required().messages({
    'any.required': 'Reason is required',
    'string.empty': 'Reason cannot be empty',
  }),
});

module.exports = {
  createFeeSchema,
  updateFeeSchema,
  makePaymentSchema,
  bulkCreateFeesSchema,
  applyDiscountWaiverSchema,
};
