const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Semester = require('../models/Semester');
const Grade = require('../models/Grade');
const Exam = require('../models/Exam');

const seedAcademicData = async () => {
  try {
    console.log('🌱 Seeding academic data...');

    // Create sample semesters
    const semesters = await Semester.insertMany([
      {
        name: 'Fall 2024',
        year: 2024,
        startDate: new Date('2024-08-15'),
        endDate: new Date('2024-12-15'),
        status: 'active',
        isCurrent: true,
        description: 'Fall semester 2024',
      },
      {
        name: 'Spring 2025',
        year: 2025,
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-05-15'),
        status: 'upcoming',
        isCurrent: false,
        description: 'Spring semester 2025',
      },
    ]);

    console.log('✅ Semesters created');

    // Create sample courses
    const courses = await Course.insertMany([
      {
        code: 'CS101',
        name: 'Introduction to Computer Science',
        department: 'Computer Science',
        semester: 1,
        credits: 4,
        type: 'core',
        instructor: {
          name: 'Dr. John Smith',
          email: 'john.smith@university.edu',
        },
        maxCapacity: 60,
        enrolledStudents: 0,
        schedule: [
          {
            day: 'Monday',
            time: '09:00-10:30',
            room: 'CS101',
          },
          {
            day: 'Wednesday',
            time: '09:00-10:30',
            room: 'CS101',
          },
        ],
        status: 'active',
        description: 'Basic concepts of computer science, programming fundamentals, and problem-solving.',
      },
      {
        code: 'CS201',
        name: 'Data Structures and Algorithms',
        department: 'Computer Science',
        semester: 3,
        credits: 4,
        type: 'core',
        instructor: {
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@university.edu',
        },
        maxCapacity: 50,
        enrolledStudents: 0,
        schedule: [
          {
            day: 'Tuesday',
            time: '10:00-11:30',
            room: 'CS201',
          },
          {
            day: 'Thursday',
            time: '10:00-11:30',
            room: 'CS201',
          },
        ],
        status: 'active',
        description: 'Advanced data structures, algorithm analysis, and problem-solving techniques.',
      },
      {
        code: 'CS301',
        name: 'Database Management Systems',
        department: 'Computer Science',
        semester: 5,
        credits: 3,
        type: 'core',
        instructor: {
          name: 'Dr. Michael Brown',
          email: 'michael.brown@university.edu',
        },
        maxCapacity: 40,
        enrolledStudents: 0,
        schedule: [
          {
            day: 'Monday',
            time: '14:00-15:30',
            room: 'CS301',
          },
          {
            day: 'Wednesday',
            time: '14:00-15:30',
            room: 'CS301',
          },
        ],
        status: 'active',
        description: 'Database design, SQL, normalization, and database administration.',
      },
    ]);

    // Update semesters with course references
    await Semester.findByIdAndUpdate(semesters[0]._id, {
      courses: [courses[0]._id, courses[1]._id, courses[2]._id],
    });

    console.log('✅ Courses created');

    // Get a student user for testing
    const student = await User.findOne({ role: 'student' });
    if (!student) {
      console.log('⚠️ No student user found for seeding grades');
      return;
    }

    // Create sample grades
    const grades = await Grade.insertMany([
      {
        studentId: student._id,
        courseId: courses[0]._id,
        semesterId: semesters[0]._id,
        components: [
          {
            name: 'midterm',
            weight: 30,
            score: 85,
            maxScore: 100,
          },
          {
            name: 'final',
            weight: 50,
            score: 90,
            maxScore: 100,
          },
          {
            name: 'assignment',
            weight: 20,
            score: 88,
            maxScore: 100,
          },
        ],
        totalScore: 88.2,
        grade: 'A',
        gradePoint: 9,
        status: 'published',
        gradedBy: new mongoose.Types.ObjectId(), // Admin user ID
        gradedAt: new Date(),
      },
      {
        studentId: student._id,
        courseId: courses[1]._id,
        semesterId: semesters[0]._id,
        components: [
          {
            name: 'midterm',
            weight: 25,
            score: 92,
            maxScore: 100,
          },
          {
            name: 'final',
            weight: 45,
            score: 88,
            maxScore: 100,
          },
          {
            name: 'practical',
            weight: 30,
            score: 95,
            maxScore: 100,
          },
        ],
        totalScore: 90.8,
        grade: 'A',
        gradePoint: 9,
        status: 'published',
        gradedBy: new mongoose.Types.ObjectId(),
        gradedAt: new Date(),
      },
    ]);

    console.log('✅ Grades created');

    // Create sample exams
    const exams = await Exam.insertMany([
      {
        courseId: courses[0]._id,
        semesterId: semesters[0]._id,
        examType: 'midterm',
        examDate: new Date('2024-10-15'),
        startTime: '09:00',
        endTime: '11:00',
        duration: 120,
        room: 'CS101',
        building: 'Computer Science Building',
        maxMarks: 100,
        passingMarks: 40,
        status: 'scheduled',
        instructions: 'Bring calculator and student ID. No electronic devices allowed.',
        syllabus: 'Chapters 1-5 from the textbook',
        createdBy: new mongoose.Types.ObjectId(),
      },
      {
        courseId: courses[1]._id,
        semesterId: semesters[0]._id,
        examType: 'final',
        examDate: new Date('2024-12-10'),
        startTime: '10:00',
        endTime: '13:00',
        duration: 180,
        room: 'CS201',
        building: 'Computer Science Building',
        maxMarks: 100,
        passingMarks: 40,
        status: 'scheduled',
        instructions: 'Comprehensive exam covering all topics. Bring calculator and rough sheets.',
        syllabus: 'All chapters covered in the semester',
        createdBy: new mongoose.Types.ObjectId(),
      },
      {
        courseId: courses[2]._id,
        semesterId: semesters[0]._id,
        examType: 'practical',
        examDate: new Date('2024-12-05'),
        startTime: '14:00',
        endTime: '17:00',
        duration: 180,
        room: 'Lab301',
        building: 'Computer Science Building',
        maxMarks: 50,
        passingMarks: 20,
        status: 'scheduled',
        instructions: 'Practical exam on database design and SQL queries.',
        syllabus: 'Database design, SQL queries, and normalization',
        createdBy: new mongoose.Types.ObjectId(),
      },
    ]);

    console.log('✅ Exams created');

    console.log('🎉 Academic data seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   • Semesters: ${semesters.length}`);
    console.log(`   • Courses: ${courses.length}`);
    console.log(`   • Grades: ${grades.length}`);
    console.log(`   • Exams: ${exams.length}`);

  } catch (error) {
    console.error('❌ Error seeding academic data:', error);
    throw error;
  }
};

module.exports = { seedAcademicData };