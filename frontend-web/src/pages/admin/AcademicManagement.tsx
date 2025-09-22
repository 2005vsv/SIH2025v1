import { BookOpen, Calendar, Edit, GraduationCap, Plus, Search, Star, Trash2, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Course {
  _id: string;
  code: string;
  name: string;
  department: string;
  semester: number;
  credits: number;
  type: 'core' | 'elective' | 'lab' | 'project';
  instructor: {
    name: string;
    email: string;
  };
  enrolledStudents: number;
  maxCapacity: number;
  schedule: {
    day: string;
    time: string;
    room: string;
  }[];
  status: 'active' | 'inactive' | 'completed';
}

interface Semester {
  _id: string;
  name: string;
  year: number;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
  courses: string[];
}

interface Grade {
  _id: string;
  studentId: string;
  studentName: string;
  courseCode: string;
  courseName: string;
  semester: string;
  assignments: number;
  midterm: number;
  finals: number;
  total: number;
  grade: string;
  gpa: number;
}

interface AcademicStats {
  totalCourses: number;
  activeCourses: number;
  totalStudents: number;
  totalInstructors: number;
  averageGPA: number;
  completionRate: number;
}

const AdminAcademicManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [stats, setStats] = useState<AcademicStats>({
    totalCourses: 0,
    activeCourses: 0,
    totalStudents: 0,
    totalInstructors: 0,
    averageGPA: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'courses' | 'semesters' | 'grades' | 'reports'>('courses');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<'all' | 'CSE' | 'ECE' | 'ME' | 'CE'>('all');
  const [filterSemester, setFilterSemester] = useState<'all' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8'>('all');
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  useEffect(() => {
    fetchAcademicData();
  }, []);

  const fetchAcademicData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      // Mock data for development
      const mockCourses: Course[] = [
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
          enrolledStudents: 45,
          maxCapacity: 50,
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
          semester: 2,
          credits: 3,
          type: 'core',
          instructor: {
            name: 'Dr. Sarah Johnson',
            email: 'sarah.johnson@university.edu'
          },
          enrolledStudents: 38,
          maxCapacity: 40,
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
          enrolledStudents: 42,
          maxCapacity: 45,
          schedule: [
            { day: 'Monday', time: '14:00-15:30', room: 'CSE-301' },
            { day: 'Wednesday', time: '14:00-15:30', room: 'CSE-301' },
            { day: 'Friday', time: '14:00-15:30', room: 'CSE-301' }
          ],
          status: 'active'
        }
      ];

      const mockSemesters: Semester[] = [
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

      const mockGrades: Grade[] = [
        {
          _id: '1',
          studentId: 'ST001',
          studentName: 'John Doe',
          courseCode: 'CSE101',
          courseName: 'Introduction to Programming',
          semester: 'Fall 2024',
          assignments: 85,
          midterm: 88,
          finals: 92,
          total: 88,
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
          assignments: 92,
          midterm: 95,
          finals: 89,
          total: 92,
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

  const deleteCourse = async (courseId: string) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      // Mock API call
      console.log('Deleting course:', courseId);
      
      setCourses(prev => prev.filter(course => course._id !== courseId));
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  const updateCourseStatus = async (courseId: string, status: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      // Mock API call
      console.log('Updating course status:', { courseId, status });
      
      setCourses(prev => 
        prev.map(course => 
          course._id === courseId ? { ...course, status: status as any } : course
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

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
      completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      upcoming: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    };
    return colors[status as keyof typeof colors] || colors.active;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      core: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      elective: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      lab: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      project: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
    };
    return colors[type as keyof typeof colors] || colors.core;
  };

  const getGradeColor = (grade: string) => {
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
    return colors[grade as keyof typeof colors] || colors.C;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Academic Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage courses, semesters, grades, and academic records
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCourses}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <GraduationCap className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Courses</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeCourses}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalStudents}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Users className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Instructors</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalInstructors}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Star className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average GPA</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageGPA.toFixed(2)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <Calendar className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completionRate.toFixed(1)}%</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 px-6">
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
            </nav>
          </div>

          {activeTab === 'courses' && (
            <div className="p-6">
              {/* Controls */}
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search courses, codes, or instructors..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <select
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value as any)}
                  >
                    <option value="all">All Departments</option>
                    <option value="CSE">Computer Science</option>
                    <option value="ECE">Electronics</option>
                    <option value="ME">Mechanical</option>
                    <option value="CE">Civil</option>
                  </select>
                  <select
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={filterSemester}
                    onChange={(e) => setFilterSemester(e.target.value as any)}
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
                    <Plus className="h-4 w-4" />
                    Add Course
                  </button>
                </div>
              </div>

              {/* Courses Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Instructor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Enrollment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Schedule
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredCourses.map((course) => (
                      <motion.tr
                        key={course._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {course.code} - {course.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                              <span>{course.department}</span>
                              <span>•</span>
                              <span>Semester {course.semester}</span>
                              <span>•</span>
                              <span>{course.credits} Credits</span>
                              <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(course.type)}`}>
                                {course.type.charAt(0).toUpperCase() + course.type.slice(1)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{course.instructor.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{course.instructor.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {course.enrolledStudents}/{course.maxCapacity}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{width: `${(course.enrolledStudents / course.maxCapacity) * 100}%`}}
                            ></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {course.schedule.length} classes/week
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {course.schedule[0]?.day} {course.schedule[0]?.time}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(course.status)}`}>
                            {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingCourse(course)}
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => updateCourseStatus(course._id, course.status === 'active' ? 'inactive' : 'active')}
                              className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                            >
                              <Calendar className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteCourse(course._id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredCourses.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No courses found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'semesters' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {semesters.map((semester) => (
                  <motion.div
                    key={semester._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {semester.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {new Date(semester.startDate).toLocaleDateString()} - {new Date(semester.endDate).toLocaleDateString()}
                        </p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(semester.status)}`}>
                          {semester.status.charAt(0).toUpperCase() + semester.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Courses:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{semester.courses.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Year:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{semester.year}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {semesters.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No semesters found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Add semesters to organize academic periods.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'grades' && (
            <div className="p-6">
              {/* Grades Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Scores
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Final Grade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        GPA
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {grades.map((grade) => (
                      <motion.tr
                        key={grade._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{grade.studentName}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{grade.studentId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{grade.courseCode}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{grade.courseName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            A: {grade.assignments}% | M: {grade.midterm}% | F: {grade.finals}%
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Total: {grade.total}%</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(grade.grade)}`}>
                            {grade.grade}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{grade.gpa.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                            <Edit className="h-4 w-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {grades.length === 0 && (
                <div className="text-center py-12">
                  <Star className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No grades found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Student grades will appear here once entered.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="p-6">
              <div className="text-center py-12">
                <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Academic Reports</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Comprehensive academic reporting features coming soon.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAcademicManagement;