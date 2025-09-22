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

    // Create faculty user
    const facultyUser = await User.create({
      name: 'Dr. Jane Smith',
      email: 'faculty@studentportal.com',
      password: 'faculty123',
      role: 'faculty',
      isActive: true,
      profile: {
        phone: '+1234567891',
        department: 'Computer Science',
      },
      gamification: {
        points: 250,
        badges: ['faculty', 'mentor'],
        level: 3,
      },
    });

    // Create student users
    const students: any[] = [];
    for (let i = 1; i <= 5; i++) {
      const student = await User.create({
        name: `Student ${i}`,
        email: `student${i}@studentportal.com`,
        password: 'student123',
        role: 'student',
        studentId: `STU2024${String(i).padStart(3, '0')}`,
        isActive: true,
        profile: {
          phone: `+123456789${i}`,
          department: i <= 3 ? 'Computer Science' : 'Electronics',
          semester: Math.floor(Math.random() * 8) + 1,
          admissionYear: 2022,
        },
        gamification: {
          points: Math.floor(Math.random() * 500) + 50,
          badges: ['newcomer', i <= 2 ? 'library_lover' : 'sports_star'],
          level: Math.floor(Math.random() * 5) + 1,
        },
      });
      students.push(student);
    }

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
      {
        title: 'Digital Electronics',
        author: 'Morris Mano',
        isbn: '9780131725123',
        category: 'Electronics',
        description: 'Fundamentals of digital circuits and systems',
        totalCopies: 6,
        availableCopies: 5,
        qrCode: await generateQRCode('BOOK004'),
        location: 'Section C, Shelf 1',
        publishedYear: 2013,
      },
      {
        title: 'Operating System Concepts',
        author: 'Abraham Silberschatz',
        isbn: '9781118063330',
        category: 'Computer Science',
        description: 'Comprehensive guide to operating systems',
        totalCopies: 4,
        availableCopies: 3,
        qrCode: await generateQRCode('BOOK005'),
        location: 'Section A, Shelf 2',
        publishedYear: 2018,
      },
    ];

    await Book.insertMany(books);
    logger.info('Books created successfully');

    // Create fees for students
    const fees: any[] = [];
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      
      // Tuition fee
      fees.push({
        userId: student._id,
        feeType: 'tuition',
        amount: 2000,
        description: `Semester ${student.profile?.semester || 6} Tuition Fee`,
        dueDate: new Date('2024-12-31'),
        status: i % 3 === 0 ? 'paid' : 'pending',
        ...(i % 3 === 0 && {
          paidAt: new Date('2024-11-10'),
          paymentMethod: 'Online',
          transactionId: `TXN${Date.now()}${i}`,
        }),
      });

      // Hostel fee
      if (i <= 2) {
        fees.push({
          userId: student._id,
          feeType: 'hostel',
          amount: 500,
          description: 'Hostel Fee for December',
          dueDate: new Date('2024-12-15'),
          status: i === 0 ? 'paid' : 'pending',
          ...(i === 0 && {
            paidAt: new Date('2024-11-15'),
            paymentMethod: 'Online',
            transactionId: `TXN${Date.now()}${i}H`,
          }),
        });
      }

      // Library fine (for some students)
      if (i === 2 || i === 4) {
        fees.push({
          userId: student._id,
          feeType: 'library',
          amount: 25,
          description: 'Library Late Return Fine',
          dueDate: new Date('2024-11-30'),
          status: 'overdue',
        });
      }

      // Lab fee
      fees.push({
        userId: student._id,
        feeType: 'other',
        amount: 300,
        description: 'Computer Lab Fee',
        dueDate: new Date('2024-12-20'),
        status: i % 2 === 0 ? 'paid' : 'pending',
        ...(i % 2 === 0 && {
          paidAt: new Date('2024-11-20'),
          paymentMethod: 'Cash',
          transactionId: `TXN${Date.now()}${i}L`,
        }),
      });
    }

    await Fee.insertMany(fees);
    logger.info('Fees created successfully');

    logger.info('Database seeded successfully!');
    logger.info('Default users:');
    logger.info('Admin: admin@studentportal.com / admin123');
    logger.info('Faculty: faculty@studentportal.com / faculty123');
    logger.info('Students: student1@studentportal.com to student5@studentportal.com / student123');
    logger.info(`Created ${students.length} students, ${books.length} books, and ${fees.length} fees`);

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