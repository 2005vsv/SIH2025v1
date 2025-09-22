import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { logger } from '../config/logger';
import Book from '../models/Book';
import Fee from '../models/Fee';
import User from '../models/User';
import { generateQRCode } from './helpers';

// Load environment variables
dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);
    logger.info('Connected to MongoDB for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Book.deleteMany({});
    await Fee.deleteMany({});
    logger.info('Cleared existing data');

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@studentportal.com',
      password: 'admin123',
      role: 'admin',
      isActive: true,
      gamification: {
        points: 0,
        badges: ['admin'],
        level: 1,
      },
    });

    // Create student user
    const studentUser = await User.create({
      name: 'John Doe',
      email: 'student@studentportal.com',
      password: 'student123',
      role: 'student',
      studentId: 'STU2024001',
      isActive: true,
      profile: {
        phone: '+1234567890',
        department: 'Computer Science',
        semester: 6,
        admissionYear: 2022,
      },
      gamification: {
        points: 150,
        badges: ['newcomer', 'library_lover'],
        level: 2,
      },
    });

    logger.info('Users created successfully');

    // Create books
    const books = [
      {
        title: 'Introduction to Algorithms',
        author: 'Thomas H. Cormen',
        isbn: '9780262033848',
        category: 'Computer Science',
        description: 'Comprehensive guide to algorithms and data structures',
        totalCopies: 5,
        availableCopies: 3,
        qrCode: await generateQRCode('BOOK001'),
        location: 'Section A, Shelf 1',
        publishedYear: 2009,
      },
      {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        isbn: '9780132350884',
        category: 'Software Engineering',
        description: 'A handbook of agile software craftsmanship',
        totalCopies: 3,
        availableCopies: 2,
        qrCode: await generateQRCode('BOOK002'),
        location: 'Section B, Shelf 2',
        publishedYear: 2008,
      },
      {
        title: 'Design Patterns',
        author: 'Gang of Four',
        isbn: '9780201633612',
        category: 'Software Engineering',
        description: 'Elements of reusable object-oriented software',
        totalCopies: 4,
        availableCopies: 4,
        qrCode: await generateQRCode('BOOK003'),
        location: 'Section B, Shelf 3',
        publishedYear: 1994,
      },
    ];

    await Book.insertMany(books);
    logger.info('Books created successfully');

    // Create fees for student
    const fees = [
      {
        userId: studentUser._id,
        feeType: 'tuition',
        amount: 2000,
        description: 'Semester 6 Tuition Fee',
        dueDate: new Date('2024-12-31'),
        status: 'pending',
      },
      {
        userId: studentUser._id,
        feeType: 'hostel',
        amount: 500,
        description: 'Hostel Fee for December',
        dueDate: new Date('2024-12-15'),
        status: 'paid',
        paidAt: new Date('2024-11-15'),
        paymentMethod: 'Online',
        transactionId: 'TXN123456',
      },
      {
        userId: studentUser._id,
        feeType: 'library',
        amount: 50,
        description: 'Library Fine',
        dueDate: new Date('2024-11-30'),
        status: 'overdue',
      },
    ];

    await Fee.insertMany(fees);
    logger.info('Fees created successfully');

    // Create sample exam (would need Exam model)
    logger.info('Sample exam data would be created here');

    // Create sample job posting (would need Job model)
    logger.info('Sample job posting would be created here');

    logger.info('Database seeded successfully!');
    logger.info('Default users:');
    logger.info('Admin: admin@studentportal.com / admin123');
    logger.info('Student: student@studentportal.com / student123');

    process.exit(0);
  } catch (error) {
    logger.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding
if (require.main === module) {
  seedDatabase();
}

export default seedDatabase;