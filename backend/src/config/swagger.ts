import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Student Portal API',
      version: '1.0.0',
      description: 'Comprehensive API for Student Portal Management System',
      contact: {
        name: 'Student Portal Team',
        email: 'support@studentportal.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.studentportal.com' 
          : `http://localhost:${process.env.PORT || 5000}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            role: { type: 'string', enum: ['student', 'admin', 'faculty'] },
            studentId: { type: 'string' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            user: { $ref: '#/components/schemas/User' },
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            error: { type: 'string' },
            stack: { type: 'string' },
          },
        },
        Book: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            author: { type: 'string' },
            isbn: { type: 'string' },
            category: { type: 'string' },
            totalCopies: { type: 'number' },
            availableCopies: { type: 'number' },
            qrCode: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Fee: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            feeType: { type: 'string' },
            amount: { type: 'number' },
            dueDate: { type: 'string', format: 'date' },
            status: { type: 'string', enum: ['pending', 'paid', 'overdue'] },
            paidAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJSDoc(options);