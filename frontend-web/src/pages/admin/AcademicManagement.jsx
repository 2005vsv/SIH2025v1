import { BookOpen, Calendar, Edit, GraduationCap, Plus, Search, Star, Trash2, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const AdminAcademicManagement = () => {
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [grades, setGrades] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    activeCourses: 0,
    totalStudents: 0,
    totalInstructors: 0,
    averageGPA: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('courses');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterSemester, setFilterSemester] = useState('all');
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  useEffect(() => {
    fetchAcademicData();
  }, []);

  const fetchAcademicData = async () => {
    try {
      setLoading(true);

      // Mock data for development
      const mockCourses = [
        {
          _id: '1',
          code: 'CSE101',
          name: 'Introduction to Programming',
          department: 'CSE',
          semester: 1,
          credits: 4,
          type: 'core',
          instructor: {
            name: 'Dr. John Smith',
            email: 'john.smith@university.edu'
          },
          enrolledStudents: 60,
          maxCapacity: 70,
          schedule: [
            { day: 'Monday', time: '09:00-10:30', room: 'CSE-101' },
            { day: 'Wednesday', time: '09:00-10:30', room: 'CSE-101' },
            { day: 'Friday', time: '09:00-10:30', room: 'CSE-101' }
          ],
          status: 'active'
        },
        {
          _id: '2',
          code: 'MAT201',
          name: 'Calculus II',
          department: 'Mathematics',
          semester: 1,
          credits: 3,
          type: 'core',
          instructor: {
            name: 'Dr. Sarah Johnson',
            email: 'sarah.johnson@university.edu'
          },
          enrolledStudents: 55,
          maxCapacity: 60,
          schedule: [
            { day: 'Tuesday', time: '11:00-12:30', room: 'MAT-201' },
            { day: 'Thursday', time: '11:00-12:30', room: 'MAT-201' }
          ],
          status: 'active'
        },
        {
          _id: '3',
          code: 'CSE301',
          name: 'Data Structures and Algorithms',
          department: 'CSE',
          semester: 3,
          credits: 4,
          type: 'core',
          instructor: {
            name: 'Dr. Michael Brown',
            email: 'michael.brown@university.edu'
          },
          enrolledStudents: 48,
          maxCapacity: 50,
          schedule: [
            { day: 'Monday', time: '14:00-15:30', room: 'CSE-301' },
            { day: 'Wednesday', time: '14:00-15:30', room: 'CSE-301' },
            { day: 'Friday', time: '14:00-15:30', room: 'CSE-301' }
          ],
          status: 'active'
        }
      ];

      const mockSemesters = [
        {
          _id: '1',
          name: 'Fall 2024',
          year: 2024,
          startDate: '2024-08-15',
          endDate: '2024-12-15',
          status: 'active',
          courses: ['1', '2', '3']
        },
        {
          _id: '2',
          name: 'Spring 2025',
          year: 2025,
          startDate: '2025-01-15',
          endDate: '2025-05-15',
          status: 'upcoming',
          courses: []
        }
      ];

      const mockGrades = [
        {
          _id: '1',
          studentId: 'ST001',
          studentName: 'John Doe',
          courseCode: 'CSE101',
          courseName: 'Introduction to Programming',
          semester: 'Fall 2024',
          assignments: 90,
          midterm: 85,
          finals: 88,
          total: 87.6,
          grade: 'A-',
          gpa: 3.7
        },
        {
          _id: '2',
          studentId: 'ST002',
          studentName: 'Jane Smith',
          courseCode: 'MAT201',
          courseName: 'Calculus II',
          semester: 'Fall 2024',
          assignments: 95,
          midterm: 90,
          finals: 92,
          total: 92.3,
          grade: 'A',
          gpa: 4.0
        }
      ];

      setCourses(mockCourses);
      setSemesters(mockSemesters);
      setGrades(mockGrades);

      // Calculate stats
      const totalCourses = mockCourses.length;
      const activeCourses = mockCourses.filter(c => c.status === 'active').length;
      const totalStudents = [...new Set(mockGrades.map(g => g.studentId))].length;
      const totalInstructors = [...new Set(mockCourses.map(c => c.instructor.email))].length;
      const averageGPA = mockGrades.length > 0 ? mockGrades.reduce((sum, g) => sum + g.gpa, 0) / mockGrades.length : 0;
      const completionRate = mockGrades.length > 0 ? (mockGrades.filter(g => g.grade !== 'F').length / mockGrades.length) * 100 : 0;

      setStats({
        totalCourses,
        activeCourses,
        totalStudents,
        totalInstructors,
        averageGPA,
        completionRate
      });
    } catch (error) {
      console.error('Error fetching academic data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      setCourses(prev => prev.filter(course => course._id !== courseId));
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  const updateCourseStatus = async (courseId, status) => {
    try {
      setCourses(prev =>
        prev.map(course =>
          course._id === courseId ? { ...course, status } : course
        )
      );
    } catch (error) {
      console.error('Error updating course status:', error);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || course.department === filterDepartment;
    const matchesSemester = filterSemester === 'all' || course.semester.toString() === filterSemester;
    return matchesSearch && matchesDepartment && matchesSemester;
  });

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
      completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      upcoming: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    };
    return colors[status] || colors.active;
  };

  const getTypeColor = (type) => {
    const colors = {
      core: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      elective: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      lab: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      project: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
    };
    return colors[type] || colors.core;
  };

  const getGradeColor = (grade) => {
    const colors = {
      'A+': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'A': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'A-': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'B+': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'B': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'B-': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'C+': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'C': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'C-': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'D': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      'F': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return colors[grade] || colors.C;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-500" />
          Academic Management
        </h1>
        <div className="text-gray-500">Manage courses, semesters, grades, and academic records</div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-1">Total Courses</div>
          <div className="text-2xl font-bold">{stats.totalCourses}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-1">Active Courses</div>
          <div className="text-2xl font-bold">{stats.activeCourses}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-1">Total Students</div>
          <div className="text-2xl font-bold">{stats.totalStudents}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-1">Instructors</div>
          <div className="text-2xl font-bold">{stats.totalInstructors}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-1">Average GPA</div>
          <div className="text-2xl font-bold">{stats.averageGPA.toFixed(2)}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-1">Completion Rate</div>
          <div className="text-2xl font-bold">{stats.completionRate.toFixed(1)}%</div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6 gap-4">
        <button
          onClick={() => setActiveTab('courses')}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'courses'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Course Management ({courses.length})
        </button>
        <button
          onClick={() => setActiveTab('semesters')}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'semesters'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Semester Management ({semesters.length})
        </button>
        <button
          onClick={() => setActiveTab('grades')}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'grades'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Grade Management ({grades.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'reports'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Academic Reports
        </button>
      </div>

      {/* Courses Tab */}
      {activeTab === 'courses' && (
        <div>
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses, codes, or instructors..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              <option value="all">All Departments</option>
              <option value="CSE">Computer Science</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Electronics">Electronics</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
            </select>
            <select
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
            >
              <option value="all">All Semesters</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
              <option value="3">Semester 3</option>
              <option value="4">Semester 4</option>
              <option value="5">Semester 5</option>
              <option value="6">Semester 6</option>
              <option value="7">Semester 7</option>
              <option value="8">Semester 8</option>
            </select>
            <button
              onClick={() => setShowAddCourse(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Course
            </button>
          </div>

          {/* Courses Table */}
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instructor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrollment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schedule</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <tr key={course._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="font-semibold">{course.code} - {course.name}</div>
                      <div className="text-xs text-gray-500">{course.department} • Semester {course.semester} • {course.credits} Credits</div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(course.type)}`}>
                        {course.type.charAt(0).toUpperCase() + course.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>{course.instructor.name}</div>
                      <div className="text-xs text-gray-500">{course.instructor.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{course.enrolledStudents}/{course.maxCapacity}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(course.enrolledStudents / course.maxCapacity) * 100}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{course.schedule.length} classes/week</div>
                      <div className="text-xs text-gray-500">{course.schedule[0]?.day} {course.schedule[0]?.time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(course.status)}`}>
                        {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => setEditingCourse(course)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Edit Course"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => updateCourseStatus(course._id, course.status === 'active' ? 'inactive' : 'active')}
                        className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                        title="Toggle Status"
                      >
                        <Star className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteCourse(course._id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete Course"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredCourses.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-500 py-8">
                      <div className="font-semibold text-lg mb-2">No courses found</div>
                      <div className="text-sm">Try adjusting your search or filter criteria.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Semesters Tab */}
      {activeTab === 'semesters' && (
        <div className="grid md:grid-cols-2 gap-4">
          {semesters.map((semester) => (
            <motion.div
              key={semester._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
            >
              <div className="font-bold text-lg mb-1">{semester.name}</div>
              <div className="text-xs text-gray-500 mb-1">
                {new Date(semester.startDate).toLocaleDateString()} - {new Date(semester.endDate).toLocaleDateString()}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(semester.status)}`}>
                {semester.status.charAt(0).toUpperCase() + semester.status.slice(1)}
              </span>
              <div className="mt-2 text-sm">
                <div>Courses: {semester.courses.length}</div>
                <div>Year: {semester.year}</div>
              </div>
            </motion.div>
          ))}
          {semesters.length === 0 && (
            <div className="text-center text-gray-500 py-8 col-span-2">
              <div className="font-semibold text-lg mb-2">No semesters found</div>
              <div className="text-sm">Add semesters to organize academic periods.</div>
            </div>
          )}
        </div>
      )}

      {/* Grades Tab */}
      {activeTab === 'grades' && (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scores</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Final Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">GPA</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((grade) => (
                <tr key={grade._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div>{grade.studentName}</div>
                    <div className="text-xs text-gray-500">{grade.studentId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div>{grade.courseCode}</div>
                    <div className="text-xs text-gray-500">{grade.courseName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div>A: {grade.assignments}% | M: {grade.midterm}% | F: {grade.finals}%</div>
                    <div>Total: {grade.total}%</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getGradeColor(grade.grade)}`}>
                      {grade.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4">{grade.gpa.toFixed(2)}</td>
                  <td className="px-6 py-4"></td>
                </tr>
              ))}
              {grades.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-gray-500 py-8">
                    <div className="font-semibold text-lg mb-2">No grades found</div>
                    <div className="text-sm">Student grades will appear here once entered.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="text-center text-gray-500 py-8">
          <div className="font-semibold text-lg mb-2">Academic Reports</div>
          <div className="text-sm">Comprehensive academic reporting features coming soon.</div>
        </div>
      )}
    </div>
  );
};

export default AdminAcademicManagement;