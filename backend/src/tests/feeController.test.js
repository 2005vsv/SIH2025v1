const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../index');
const Fee = require('../models/Fee');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

let mongoServer;
let agent;

beforeAll(async () => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Create test agent
  agent = request.agent(app);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear all collections
  await Fee.deleteMany({});
  await User.deleteMany({});
  await Transaction.deleteMany({});
});

describe('Fee Controller Tests', () => {
  let adminToken;
  let studentToken;
  let testUser;
  let testFee;

  beforeEach(async () => {
    // Create test admin user
    const adminUser = new User({
      name: 'Test Admin',
      email: 'admin@test.com',
      password: 'password123',
      role: 'admin',
      studentId: 'ADMIN001'
    });
    await adminUser.save();

    // Create test student user
    testUser = new User({
      name: 'Test Student',
      email: 'student@test.com',
      password: 'password123',
      role: 'student',
      studentId: 'STU001'
    });
    await testUser.save();

    // Login to get tokens
    const adminLogin = await agent
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'password123' });
    adminToken = adminLogin.body.data.token;

    const studentLogin = await agent
      .post('/api/auth/login')
      .send({ email: 'student@test.com', password: 'password123' });
    studentToken = studentLogin.body.data.token;

    // Create test fee
    testFee = new Fee({
      userId: testUser._id,
      feeType: 'tuition',
      amount: 1000,
      description: 'Test Tuition Fee',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: 'pending'
    });
    await testFee.save();
  });

  describe('GET /api/fees', () => {
    test('should return fees for admin', async () => {
      const response = await agent
        .get('/api/fees')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.fees)).toBe(true);
    });

    test('should return own fees for student', async () => {
      const response = await agent
        .get('/api/fees')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.fees)).toBe(true);
    });
  });

  describe('POST /api/fees', () => {
    test('should create fee as admin', async () => {
      const feeData = {
        userId: testUser.studentId,
        feeType: 'library',
        amount: 500,
        description: 'Library Fee',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      const response = await agent
        .post('/api/fees')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(feeData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.fee.feeType).toBe('library');
      expect(response.body.data.fee.amount).toBe(500);
    });

    test('should reject fee creation for non-admin', async () => {
      const feeData = {
        userId: testUser.studentId,
        feeType: 'library',
        amount: 500,
        description: 'Library Fee',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      const response = await agent
        .post('/api/fees')
        .set('Authorization', `Bearer ${studentToken}`)
        .send(feeData);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/fees/bulk', () => {
    test('should create bulk fees as admin', async () => {
      const bulkData = {
        studentIds: [testUser.studentId],
        feeData: {
          feeType: 'examination',
          amount: 300,
          description: 'Exam Fee',
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      };

      const response = await agent
        .post('/api/fees/bulk')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(bulkData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.summary.successful).toBe(1);
      expect(response.body.data.summary.failed).toBe(0);
    });
  });

  describe('POST /api/fees/:id/pay', () => {
    test('should process payment for own fee', async () => {
      const paymentData = {
        amount: 500,
        paymentMethod: 'online',
        transactionId: 'TXN_TEST_001'
      };

      const response = await agent
        .post(`/api/fees/${testFee._id}/pay`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(paymentData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.fee.status).toBe('partial');
      expect(response.body.data.fee.paidAmount).toBe(500);
    });

    test('should complete payment when full amount is paid', async () => {
      const paymentData = {
        amount: 1000,
        paymentMethod: 'online',
        transactionId: 'TXN_TEST_002'
      };

      const response = await agent
        .post(`/api/fees/${testFee._id}/pay`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send(paymentData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.fee.status).toBe('paid');
      expect(response.body.data.fee.paidAmount).toBe(1000);
    });
  });

  describe('POST /api/fees/:id/discount-waiver', () => {
    test('should apply discount as admin', async () => {
      const discountData = {
        type: 'discount',
        percentage: 10,
        reason: 'Merit scholarship'
      };

      const response = await agent
        .post(`/api/fees/${testFee._id}/discount-waiver`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(discountData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.fee.discountAmount).toBe(100); // 10% of 1000
    });

    test('should apply waiver as admin', async () => {
      const waiverData = {
        type: 'waiver',
        amount: 200,
        reason: 'Financial aid'
      };

      const response = await agent
        .post(`/api/fees/${testFee._id}/discount-waiver`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(waiverData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.fee.waiverAmount).toBe(200);
    });
  });

  describe('GET /api/fees/reports', () => {
    test('should return fee reports for admin', async () => {
      const response = await agent
        .get('/api/fees/reports')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('feeSummary');
      expect(response.body.data).toHaveProperty('paymentSummary');
    });
  });

  describe('GET /api/fees/export/csv', () => {
    test('should export fees as CSV for admin', async () => {
      const response = await agent
        .get('/api/fees/export/csv')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.headers['content-disposition']).toContain('.csv');
    });
  });

  describe('GET /api/fees/export/excel', () => {
    test('should export fees as Excel for admin', async () => {
      const response = await agent
        .get('/api/fees/export/excel')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/vnd.openxmlformats');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.headers['content-disposition']).toContain('.xlsx');
    });
  });

  describe('GET /api/fees/gateway/config', () => {
    test('should return payment gateway configuration', async () => {
      const response = await agent
        .get('/api/fees/gateway/config')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('config');
      expect(response.body.data.config).toHaveProperty('gateways');
      expect(response.body.data.config).toHaveProperty('methods');
      expect(response.body.data.config).toHaveProperty('currencies');
    });
  });
});