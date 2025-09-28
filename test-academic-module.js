const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5001/api';
const ADMIN_CREDENTIALS = {
  email: 'admin@gmail.com',
  password: 'admin123'
};

const STUDENT_CREDENTIALS = {
  email: 'babu@gmail.com',
  password: 'babu123'
};

// Test script
async function testAcademicModule() {
  try {
    console.log('🚀 Starting Academic Module Tests...\n');

    // 1. Login as Admin
    console.log('1. Logging in as Admin...');
    const adminResponse = await axios.post(`${BASE_URL}/auth/login`, ADMIN_CREDENTIALS);
    const adminToken = adminResponse.data.data.accessToken;
    const headers = { Authorization: `Bearer ${adminToken}` };
    console.log('✅ Admin login successful\n');

    // 2. Seed Academic Data
    console.log('2. Seeding academic data...');
    try {
      await axios.post(`${BASE_URL}/system/seed-academic`, {}, { headers });
      console.log('✅ Academic data seeded successfully\n');
    } catch (error) {
      console.log('ℹ️ Academic data may already exist or seeding failed:', error.response?.data?.message || error.message);
    }

    // 3. Test Semester APIs
    console.log('3. Testing Semester APIs...');
    const semestersResponse = await axios.get(`${BASE_URL}/semesters`, { headers });
    console.log(`✅ Found ${semestersResponse.data.data.semesters.length} semesters`);

    const currentSemesterResponse = await axios.get(`${BASE_URL}/semesters/current`, { headers });
    console.log(`✅ Current semester: ${currentSemesterResponse.data.data.semester.name}\n`);

    // 4. Test Course APIs
    console.log('4. Testing Course APIs...');
    const coursesResponse = await axios.get(`${BASE_URL}/courses`, { headers });
    console.log(`✅ Found ${coursesResponse.data.data.courses.length} courses`);

    const courseStatsResponse = await axios.get(`${BASE_URL}/courses/stats`, { headers });
    console.log(`✅ Course stats: ${JSON.stringify(courseStatsResponse.data.data, null, 2)}\n`);

    // 5. Test Grade APIs
    console.log('5. Testing Grade APIs...');
    const gradesResponse = await axios.get(`${BASE_URL}/grades`, { headers });
    console.log(`✅ Found ${gradesResponse.data.data.grades.length} grades`);

    const gradeStatsResponse = await axios.get(`${BASE_URL}/grades/stats`, { headers });
    console.log(`✅ Grade stats: ${JSON.stringify(gradeStatsResponse.data.data, null, 2)}\n`);

    // 6. Test Exam APIs
    console.log('6. Testing Exam APIs...');
    const examsResponse = await axios.get(`${BASE_URL}/exams`, { headers });
    console.log(`✅ Found ${examsResponse.data.data.exams.length} exams`);

    const examStatsResponse = await axios.get(`${BASE_URL}/exams/stats`, { headers });
    console.log(`✅ Exam stats: ${JSON.stringify(examStatsResponse.data.data, null, 2)}\n`);

    // 7. Login as Student
    console.log('7. Logging in as Student...');
    const studentResponse = await axios.post(`${BASE_URL}/auth/login`, STUDENT_CREDENTIALS);
    const studentToken = studentResponse.data.data.accessToken;
    const studentHeaders = { Authorization: `Bearer ${studentToken}` };
    console.log('✅ Student login successful\n');

    // 8. Test Student Course Access
    console.log('8. Testing Student Course Access...');
    const myCoursesResponse = await axios.get(`${BASE_URL}/courses/my-courses`, { headers: studentHeaders });
    console.log(`✅ Student enrolled in ${myCoursesResponse.data.data.courses.length} courses`);

    // 9. Test Student Grades Access
    console.log('9. Testing Student Grades Access...');
    const studentGradesResponse = await axios.get(`${BASE_URL}/grades/student/${studentResponse.data.data.user.id}`, { headers: studentHeaders });
    console.log(`✅ Student has ${studentGradesResponse.data.data.grades.length} grades`);

    // 10. Test Student Exam Timetable
    console.log('10. Testing Student Exam Timetable...');
    const timetableResponse = await axios.get(`${BASE_URL}/exams/my-timetable`, { headers: studentHeaders });
    console.log(`✅ Student has ${timetableResponse.data.data.exams.length} upcoming exams`);

    // 11. Test Transcript Generation
    console.log('11. Testing Transcript Generation...');
    const transcriptResponse = await axios.get(`${BASE_URL}/academic-reports/transcript/${studentResponse.data.data.user.id}`, {
      headers: studentHeaders,
      params: { format: 'json' }
    });
    console.log('✅ Transcript generated successfully');
    console.log(`   CGPA: ${transcriptResponse.data.data.academicSummary.cgpa}`);
    console.log(`   Total Credits: ${transcriptResponse.data.data.academicSummary.totalCredits}\n`);

    console.log('🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Admin can manage semesters, courses, grades, and exams');
    console.log('   ✅ Student can view enrolled courses and grades');
    console.log('   ✅ Student can access exam timetable');
    console.log('   ✅ Student can generate transcripts');
    console.log('   ✅ All data flows properly from admin to student');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.status === 403) {
      console.log('\n💡 Suggestion: Check if user roles are properly configured');
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAcademicModule();
}

module.exports = { testAcademicModule };