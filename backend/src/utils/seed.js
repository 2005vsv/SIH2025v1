const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { logger } = require('../config/logger');
const Book = require('../models/Book');
const Fee = require('../models/Fee');
const User = require('../models/User');
const { generateQRCode } = require('./helpers');

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
      isActive,
      gamification: {
        points,
        badges: ['admin'],
        level,
      },
    });

    // Create faculty user
    const facultyUser = await User.create({
      name: 'Dr. Jane Smith',
      email: 'faculty@studentportal.com',
      password: 'faculty123',
      role: 'faculty',
      isActive,
      profile: {
        phone: '+1234567891',
        department: 'Computer Science',
      },
      gamification: {
        points,
        badges: ['faculty', 'mentor'],
        level,
      },
    });

    // Create student users
    const students[] = [];
    for (let i = 1; i <= 5; i++) {
      const student = await User.create({
        name: `Student ${i}`,
        email: `student${i}@studentportal.com`,
        password: 'student123',
        role: 'student',
        studentId: `STU2024${String(i).padStart(3, '0')}`,
        isActive,
        profile: {
          phone: `+123456789${i}`,
          department: i <= 3 ? 'Computer Science' : 'Electronics',
          semester: Math.floor(Math.random() * 8) + 1,
          admissionYear,
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
        totalCopies,
        availableCopies,
        qrCode: await generateQRCode('BOOK001'),
        location: 'Section A, Shelf 1',
        publishedYear,
      },
      {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        isbn: '9780132350884',
        category: 'Software Engineering',
        description: 'A handbook of agile software craftsmanship',
        totalCopies,
        availableCopies,
        qrCode: await generateQRCode('BOOK002'),
        location: 'Section B, Shelf 2',
        publishedYear,
      },
      {
        title: 'Design Patterns',
        author: 'Gang of Four',
        isbn: '9780201633612',
        category: 'Software Engineering',
        description: 'Elements of reusable object-oriented software',
        totalCopies,
        availableCopies,
        qrCode: await generateQRCode('BOOK003'),
        location: 'Section B, Shelf 3',
        publishedYear,
      },
      {
        title: 'Digital Electronics',
        author: 'Morris Mano',
        isbn: '9780131725123',
        category: 'Electronics',
        description: 'Fundamentals of digital circuits and systems',
        totalCopies,
        availableCopies,
        qrCode: await generateQRCode('BOOK004'),
        location: 'Section C, Shelf 1',
        publishedYear,
      },
      {
        title: 'Operating System Concepts',
        author: 'Abraham Silberschatz',
        isbn: '9781118063330',
        category: 'Computer Science',
        description: 'Comprehensive guide to operating systems',
        totalCopies,
        availableCopies,
        qrCode: await generateQRCode('BOOK005'),
        location: 'Section A, Shelf 2',
        publishedYear,
      },
    ];

    await Book.insertMany(books);
    logger.info('Books created successfully');

    // Create fees for students
    const fees[] = [];
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      
      // Tuition fee
      fees.push({
        userId: student._id,
        feeType: 'tuition',
        amount,
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
          amount,
          description: 'Hostel Fee for December',
          dueDate: new Date('2024-12-15'),
          status=== 0 ? 'paid' : 'pending',
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
          amount,
          description: 'Library Late Return Fine',
          dueDate: new Date('2024-11-30'),
          status: 'overdue',
        });
      }

      // Lab fee
      fees.push({
        userId: student._id,
        feeType: 'other',
        amount,
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

module.exports = seedDatabase;
