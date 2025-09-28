import { BookOpen, Calendar, Edit, GraduationCap, Plus, RefreshCw, Search, Star, Trash2, Users, FileText, Clock } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { courseAPI, semesterAPI, examAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminAcademicManagement = () => {
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    activeCourses: 0,
    totalStudents: 0,
    totalInstructors: 0,
    averageGPA: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('courses');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterSemester, setFilterSemester] = useState('all');
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showAddSemester, setShowAddSemester] = useState(false);
  const [editingSemester, setEditingSemester] = useState(null);
  const [exams, setExams] = useState([]);
  const [selectedSemesterForExams, setSelectedSemesterForExams] = useState(null);
  const [showAddExam, setShowAddExam] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [semesterSubTab, setSemesterSubTab] = useState('semesters');
  const [courseForm, setCourseForm] = useState({
    code: '',
    name: '',
    department: '',
    semesterId: '',
    credits: '',
    type: 'core',
    instructor: { name: '', email: '' },
    maxCapacity: '',
    schedule: [{ day: 'Monday', startTime: '', endTime: '', room: '' }],
    description: '',
    prerequisites: []
  });

  const [semesterForm, setSemesterForm] = useState({
    name: '',
    semesterNumber: '',
    year: new Date().getFullYear(),
    startDate: '',
    endDate: '',
    status: 'upcoming',
    description: '',
    isCurrent: false
  });

  const [examForm, setExamForm] = useState({
    courseId: '',
    semesterNumber: '',
    title: '',
    examType: 'midterm',
    examDate: '',
    startTime: '',
    endTime: '',
    duration: '',
    room: '',
    building: '',
    maxMarks: '',
    passingMarks: '',
    instructions: '',
    syllabus: '',
    status: 'scheduled'
  });

  useEffect(() => {
    fetchAcademicData();
  }, []);

  const fetchAcademicData = async (retryCount = 0) => {
    const maxRetries = 3;
    try {
      setLoading(true);

      // Fetch courses from API with retry logic
      let coursesResponse;
      try {
        coursesResponse = await courseAPI.getAll({
          page: 1,
          limit: 1000, // Get all courses for admin view
          status: activeTab === 'courses' ? undefined : 'active', // Show all courses in courses tab
          populate: 'semesterId' // Populate semester info for filtering
        });
      } catch (apiError) {
        if (retryCount < maxRetries && apiError.code === 'ERR_NETWORK') {
          console.log(`Retrying API call (${retryCount + 1}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
          return fetchAcademicData(retryCount + 1);
        }
        throw apiError;
      }

      // Handle different response structures
      let coursesData = [];
      if (coursesResponse.data && coursesResponse.data.data) {
        coursesData = coursesResponse.data.data.courses || [];
      } else if (coursesResponse.data && Array.isArray(coursesResponse.data)) {
        coursesData = coursesResponse.data;
      }
      setCourses(coursesData);

      // Fetch semesters from API
      let semestersData = [];
      try {
        const semestersResponse = await semesterAPI.getAll({
          page: 1,
          limit: 100,
        });
        if (semestersResponse.data && semestersResponse.data.data) {
          semestersData = semestersResponse.data.data.semesters || [];
        }
        setSemesters(semestersData);
      } catch (semesterError) {
        console.warn('Failed to fetch semesters:', semesterError);
        setSemesters([]);
      }


      // Calculate stats
      const totalCourses = coursesData.length;
      const activeCourses = coursesData.filter(c => c.status === 'active').length;
      const totalInstructors = [...new Set(coursesData.map(c => c.instructor?.email).filter(Boolean))].length;

      setStats({
        totalCourses,
        activeCourses,
        totalStudents: 0, // Will be calculated from enrollments if needed
        totalInstructors,
        averageGPA: 0,
        completionRate: 0
      });
    } catch (error) {
      console.error('Error fetching academic data:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load academic data';

      // Only show error toast if not retrying
      if (retryCount === 0) {
        toast.error(errorMessage);
      }

      // Set empty data on error
      setCourses([]);
      setSemesters([]);
      setStats({
        totalCourses: 0,
        activeCourses: 0,
        totalStudents: 0,
        totalInstructors: 0,
        averageGPA: 0,
        completionRate: 0
      });

      // Re-throw error for retry logic
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = () => {
    setCourseForm(prev => ({
      ...prev,
      schedule: [...prev.schedule, { day: 'Monday', startTime: '', endTime: '', room: '' }]
    }));
  };

  const handleRemoveSchedule = (index) => {
    setCourseForm(prev => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index)
    }));
  };

  const handleScheduleChange = (index, field, value) => {
    setCourseForm(prev => ({
      ...prev,
      schedule: prev.schedule.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleSubmitCourse = async (e) => {
    e.preventDefault();

    // Validate schedule times
    for (const item of courseForm.schedule) {
      if (item.startTime && item.endTime && item.startTime >= item.endTime) {
        toast.error('End time must be after start time');
        return;
      }
    }

    try {
      // Format schedule data
      const formattedSchedule = courseForm.schedule.map(item => ({
        day: item.day,
        time: `${item.startTime}-${item.endTime}`,
        room: item.room
      }));

      const courseData = {
        ...courseForm,
        credits: parseInt(courseForm.credits),
        maxCapacity: parseInt(courseForm.maxCapacity),
        schedule: formattedSchedule,
        prerequisites: courseForm.prerequisites.filter(p => p.trim() !== '')
      };

      if (editingCourse) {
        await courseAPI.update(editingCourse._id, courseData);
        toast.success('Course updated successfully');
      } else {
        await courseAPI.create(courseData);
        toast.success('Course created successfully');
      }

      setShowAddCourse(false);
      setEditingCourse(null);
      resetCourseForm();
      fetchAcademicData();
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error(error.response?.data?.message || 'Failed to save course');
    }
  };

  const resetCourseForm = () => {
    setCourseForm({
      code: '',
      name: '',
      department: '',
      semesterId: '',
      credits: '',
      type: 'core',
      instructor: { name: '', email: '' },
      maxCapacity: '',
      schedule: [{ day: 'Monday', startTime: '', endTime: '', room: '' }],
      description: '',
      prerequisites: []
    });
  };

  const handleSubmitSemester = async (e) => {
    e.preventDefault();

    try {
      const semesterData = {
        ...semesterForm,
        year: parseInt(semesterForm.year),
      };

      if (editingSemester) {
        await semesterAPI.update(editingSemester._id, semesterData);
        toast.success('Semester updated successfully');
      } else {
        await semesterAPI.create(semesterData);
        toast.success('Semester created successfully');
      }

      setShowAddSemester(false);
      setEditingSemester(null);
      resetSemesterForm();
      fetchAcademicData();
    } catch (error) {
      console.error('Error saving semester:', error);
      toast.error(error.response?.data?.message || 'Failed to save semester');
    }
  };

  const resetSemesterForm = () => {
    setSemesterForm({
      name: '',
      semesterNumber: '',
      year: new Date().getFullYear(),
      startDate: '',
      endDate: '',
      status: 'upcoming',
      description: '',
      isCurrent: false
    });
  };

  const handleEditSemester = (semester) => {
    setEditingSemester(semester);
    setSemesterForm({
      name: semester.name,
      semesterNumber: semester.semesterNumber,
      year: semester.year,
      startDate: semester.startDate ? new Date(semester.startDate).toISOString().split('T')[0] : '',
      endDate: semester.endDate ? new Date(semester.endDate).toISOString().split('T')[0] : '',
      status: semester.status,
      description: semester.description || '',
      isCurrent: semester.isCurrent || false
    });
    setShowAddSemester(true);
  };

  const deleteSemester = async (semesterId) => {
    if (!window.confirm('Are you sure you want to delete this semester? This action cannot be undone.')) return;
    try {
      await semesterAPI.delete(semesterId);
      toast.success('Semester deleted successfully');
      await fetchAcademicData();
    } catch (error) {
      console.error('Error deleting semester:', error);
      toast.error(error.response?.data?.message || 'Failed to delete semester');
    }
  };

  const fetchExamsForSemester = async (semesterId) => {
    try {
      const semester = semesters.find(s => s._id === semesterId);
      const semesterNumber = semester ? semester.semesterNumber : null;
      const response = await examAPI.getAll({ semesterNumber });
      if (response.data && response.data.data) {
        setExams(response.data.data.exams || []);
      }
      setSelectedSemesterForExams(semesterId);
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast.error('Failed to load exams');
      setExams([]);
    }
  };

  const fetchExamsForSemesterByNumber = async (semesterNumber) => {
    try {
      const response = await examAPI.getAll({ semesterNumber });
      if (response.data && response.data.data) {
        setExams(response.data.data.exams || []);
      }
      // Find the semester ID that matches this number
      const semester = semesters.find(s => s.semesterNumber === semesterNumber);
      setSelectedSemesterForExams(semester?._id || null);
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast.error('Failed to load exams');
      setExams([]);
    }
  };

  const handleSubmitExam = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!examForm.title.trim()) {
      toast.error('Exam title is required');
      return;
    }
    if (!examForm.courseId) {
      toast.error('Course selection is required');
      return;
    }
    if (!examForm.semesterNumber) {
      toast.error('Semester number is required');
      return;
    }
    if (!examForm.examDate) {
      toast.error('Exam date is required');
      return;
    }
    if (!examForm.startTime) {
      toast.error('Start time is required');
      return;
    }
    if (!examForm.endTime) {
      toast.error('End time is required');
      return;
    }
    if (!examForm.duration) {
      toast.error('Duration is required');
      return;
    }
    if (!examForm.room.trim()) {
      toast.error('Room is required');
      return;
    }
    if (!examForm.maxMarks) {
      toast.error('Max marks is required');
      return;
    }

    try {
      const { semesterId, ...formData } = examForm; // Exclude semesterId
      const examData = {
        ...formData,
        semesterNumber: parseInt(examForm.semesterNumber),
        duration: parseInt(examForm.duration),
        maxMarks: parseInt(examForm.maxMarks),
        passingMarks: examForm.passingMarks ? parseInt(examForm.passingMarks) : undefined,
      };

      console.log('Sending exam data:', examData);

      if (editingExam) {
        await examAPI.update(editingExam._id, examData);
        toast.success('Exam updated successfully');
      } else {
        await examAPI.create(examData);
        toast.success('Exam created successfully');
      }

      setShowAddExam(false);
      setEditingExam(null);
      resetExamForm();
      // Refresh exams for the semester that was just used
      if (examData.semesterNumber) {
        fetchExamsForSemesterByNumber(examData.semesterNumber);
      }
    } catch (error) {
      console.error('Error saving exam:', error);
      toast.error(error.response?.data?.message || 'Failed to save exam');
    }
  };

  const resetExamForm = () => {
    setExamForm({
      courseId: '',
      semesterNumber: '',
      title: '',
      examType: 'midterm',
      examDate: '',
      startTime: '',
      endTime: '',
      duration: '',
      room: '',
      building: '',
      maxMarks: '',
      passingMarks: '',
      instructions: '',
      syllabus: '',
      status: 'scheduled'
    });
  };

  const handleEditExam = (exam) => {
    setEditingExam(exam);
    setExamForm({
      courseId: exam.courseId?._id || exam.courseId,
      semesterNumber: exam.semesterNumber?.toString() || '',
      title: exam.title || '',
      examType: exam.examType,
      examDate: exam.examDate ? new Date(exam.examDate).toISOString().split('T')[0] : '',
      startTime: exam.startTime,
      endTime: exam.endTime,
      duration: exam.duration.toString(),
      room: exam.room,
      building: exam.building || '',
      maxMarks: exam.maxMarks.toString(),
      passingMarks: exam.passingMarks ? exam.passingMarks.toString() : '',
      instructions: exam.instructions || '',
      syllabus: exam.syllabus || '',
      status: exam.status
    });
    setShowAddExam(true);
  };

  const deleteExam = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this exam? This action cannot be undone.')) return;
    try {
      await examAPI.delete(examId);
      toast.success('Exam deleted successfully');
      if (selectedSemesterForExams) {
        fetchExamsForSemester(selectedSemesterForExams);
      }
    } catch (error) {
      console.error('Error deleting exam:', error);
      toast.error(error.response?.data?.message || 'Failed to delete exam');
    }
  };

  const closeExamModal = () => {
    setShowAddExam(false);
    setEditingExam(null);
    resetExamForm();
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);

    // Parse schedule data for editing
    const parsedSchedule = course.schedule.length > 0
      ? course.schedule.map(item => {
          const [startTime, endTime] = item.time.split('-');
          return {
            day: item.day,
            startTime: startTime || '',
            endTime: endTime || '',
            room: item.room
          };
        })
      : [{ day: 'Monday', startTime: '', endTime: '', room: '' }];

    setCourseForm({
      code: course.code,
      name: course.name,
      department: course.department,
      semesterId: course.semesterId,
      credits: course.credits.toString(),
      type: course.type,
      instructor: course.instructor,
      maxCapacity: course.maxCapacity.toString(),
      schedule: parsedSchedule,
      description: course.description || '',
      prerequisites: course.prerequisites || []
    });
    setShowAddCourse(true);
  };

  const deleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;
    try {
      await courseAPI.delete(courseId);
      toast.success('Course deleted successfully');
      await fetchAcademicData(); // Ensure data refreshes
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error(error.response?.data?.message || 'Failed to delete course');
    }
  };

  const updateCourseStatus = async (courseId, status) => {
    try {
      await courseAPI.update(courseId, { status });
      const statusText = status === 'active' ? 'activated' : 'deactivated';
      toast.success(`Course ${statusText} successfully`);
      await fetchAcademicData(); // Ensure data refreshes
    } catch (error) {
      console.error('Error updating course status:', error);
      toast.error(error.response?.data?.message || 'Failed to update course status');
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || course.department === filterDepartment;
    const matchesSemester = filterSemester === 'all' || course.semesterId === filterSemester;
    return matchesSearch && matchesDepartment && matchesSemester;
  });

  const closeModal = () => {
    setShowAddCourse(false);
    setEditingCourse(null);
    resetCourseForm();
  };

  const closeSemesterModal = () => {
    setShowAddSemester(false);
    setEditingSemester(null);
    resetSemesterForm();
  };

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
      {/* Add/Edit Course Modal */}
      {showAddCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingCourse ? 'Edit Course' : 'Add New Course'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitCourse} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Course Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={courseForm.code}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., CSE101"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Course Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={courseForm.name}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Course name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Department *
                    </label>
                    <input
                      type="text"
                      required
                      value={courseForm.department}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, department: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., CSE"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Semester *
                    </label>
                    <select
                      required
                      value={courseForm.semesterId}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, semesterId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select a semester</option>
                      {semesters.map((semester) => (
                        <option key={semester._id} value={semester._id}>
                          {semester.name} ({semester.year})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Credits *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="6"
                      value={courseForm.credits}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, credits: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type
                    </label>
                    <select
                      value={courseForm.type}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="core">Core</option>
                      <option value="elective">Elective</option>
                      <option value="lab">Lab</option>
                      <option value="project">Project</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Capacity *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={courseForm.maxCapacity}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, maxCapacity: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Instructor Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={courseForm.instructor.name}
                      onChange={(e) => setCourseForm(prev => ({
                        ...prev,
                        instructor: { ...prev.instructor, name: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Instructor name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Instructor Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={courseForm.instructor.email}
                      onChange={(e) => setCourseForm(prev => ({
                        ...prev,
                        instructor: { ...prev.instructor, email: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="instructor@university.edu"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Schedule *
                  </label>
                  {courseForm.schedule.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2">
                      <select
                        value={item.day}
                        onChange={(e) => handleScheduleChange(index, 'day', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                        <option value="Saturday">Saturday</option>
                        <option value="Sunday">Sunday</option>
                      </select>
                      <input
                        type="time"
                        required
                        value={item.startTime}
                        onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <input
                        type="time"
                        required
                        value={item.endTime}
                        onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <input
                        type="text"
                        required
                        value={item.room}
                        onChange={(e) => handleScheduleChange(index, 'room', e.target.value)}
                        placeholder="Room"
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      {courseForm.schedule.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSchedule(index)}
                          className="px-3 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 flex items-center justify-center"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddSchedule}
                    className="mt-2 px-4 py-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    + Add Schedule
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={courseForm.description}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Course description (optional)"
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    {editingCourse ? 'Update Course' : 'Create Course'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add/Edit Semester Modal */}
      {showAddSemester && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingSemester ? 'Edit Semester' : 'Add New Semester'}
                </h2>
                <button
                  onClick={closeSemesterModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitSemester} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Semester Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={semesterForm.name}
                      onChange={(e) => setSemesterForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., Fall 2024"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Semester Number *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="12"
                      value={semesterForm.semesterNumber}
                      onChange={(e) => setSemesterForm(prev => ({ ...prev, semesterNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., 1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Academic Year *
                    </label>
                    <input
                      type="number"
                      required
                      min="2020"
                      max="2030"
                      value={semesterForm.year}
                      onChange={(e) => setSemesterForm(prev => ({ ...prev, year: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={semesterForm.startDate}
                      onChange={(e) => setSemesterForm(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={semesterForm.endDate}
                      onChange={(e) => setSemesterForm(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={semesterForm.status}
                      onChange={(e) => setSemesterForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isCurrent"
                      checked={semesterForm.isCurrent}
                      onChange={(e) => setSemesterForm(prev => ({ ...prev, isCurrent: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isCurrent" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                      Set as current semester
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={semesterForm.description}
                    onChange={(e) => setSemesterForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Semester description (optional)"
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={closeSemesterModal}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    {editingSemester ? 'Update Semester' : 'Create Semester'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add/Edit Exam Modal */}
      {showAddExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingExam ? 'Edit Exam' : 'Add New Exam'}
                </h2>
                <button
                  onClick={closeExamModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitExam} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Exam Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={examForm.title}
                      onChange={(e) => setExamForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., Midterm Exam - Data Structures"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Course *
                    </label>
                    <select
                      required
                      value={examForm.courseId}
                      onChange={(e) => setExamForm(prev => ({ ...prev, courseId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select a course</option>
                      {courses.map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.code} - {course.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Semester Number *
                    </label>
                    <select
                      required
                      value={examForm.semesterNumber}
                      onChange={(e) => setExamForm(prev => ({ ...prev, semesterNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select semester</option>
                      <option value="1">Semester 1</option>
                      <option value="2">Semester 2</option>
                      <option value="3">Semester 3</option>
                      <option value="4">Semester 4</option>
                      <option value="5">Semester 5</option>
                      <option value="6">Semester 6</option>
                      <option value="7">Semester 7</option>
                      <option value="8">Semester 8</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Exam Type *
                    </label>
                    <select
                      required
                      value={examForm.examType}
                      onChange={(e) => setExamForm(prev => ({ ...prev, examType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="midterm">Midterm</option>
                      <option value="final">Final</option>
                      <option value="quiz">Quiz</option>
                      <option value="practical">Practical</option>
                      <option value="viva">Viva</option>
                      <option value="project">Project</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Exam Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={examForm.examDate}
                      onChange={(e) => setExamForm(prev => ({ ...prev, examDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={examForm.startTime}
                      onChange={(e) => setExamForm(prev => ({ ...prev, startTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={examForm.endTime}
                      onChange={(e) => setExamForm(prev => ({ ...prev, endTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Duration (minutes) *
                    </label>
                    <input
                      type="number"
                      required
                      min="30"
                      max="480"
                      value={examForm.duration}
                      onChange={(e) => setExamForm(prev => ({ ...prev, duration: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Room *
                    </label>
                    <input
                      type="text"
                      required
                      value={examForm.room}
                      onChange={(e) => setExamForm(prev => ({ ...prev, room: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., Room 101"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Building
                    </label>
                    <input
                      type="text"
                      value={examForm.building}
                      onChange={(e) => setExamForm(prev => ({ ...prev, building: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., Main Building"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Marks *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={examForm.maxMarks}
                      onChange={(e) => setExamForm(prev => ({ ...prev, maxMarks: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Passing Marks
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={examForm.passingMarks}
                      onChange={(e) => setExamForm(prev => ({ ...prev, passingMarks: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={examForm.status}
                      onChange={(e) => setExamForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="ongoing">Ongoing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="postponed">Postponed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Instructions
                  </label>
                  <textarea
                    value={examForm.instructions}
                    onChange={(e) => setExamForm(prev => ({ ...prev, instructions: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Exam instructions for students..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Syllabus Topics
                  </label>
                  <textarea
                    value={examForm.syllabus}
                    onChange={(e) => setExamForm(prev => ({ ...prev, syllabus: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Topics covered in this exam..."
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button
                    type="button"
                    onClick={closeExamModal}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    {editingExam ? 'Update Exam' : 'Create Exam'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

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
              {semesters.map((semester) => (
                <option key={semester._id} value={semester._id}>
                  {semester.name} ({semester.year})
                </option>
              ))}
            </select>
            <button
              onClick={async () => {
                setRefreshing(true);
                try {
                  await fetchAcademicData();
                  toast.success('Data refreshed successfully');
                } catch (error) {
                  // Error already handled in fetchAcademicData
                } finally {
                  setRefreshing(false);
                }
              }}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prerequisites</th>
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
                      <div className="text-xs text-gray-500">{course.department} • {course.semesterId?.name} ({course.semesterId?.year}) • {course.credits} Credits</div>
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
                      <div className="text-sm">
                        {course.prerequisites && course.prerequisites.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {course.prerequisites.map((prereq, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                              >
                                {prereq.courseCode || prereq}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">None</span>
                        )}
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
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleEditCourse(course)}
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Edit Course"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateCourseStatus(course._id, course.status === 'active' ? 'inactive' : 'active')}
                          className={`p-2 rounded-lg transition-colors ${
                            course.status === 'active'
                              ? 'text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:text-yellow-300 dark:hover:bg-yellow-900/20'
                              : 'text-green-600 hover:text-green-900 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20'
                          }`}
                          title={course.status === 'active' ? 'Deactivate Course' : 'Activate Course'}
                        >
                          <Star className={`w-4 h-4 ${course.status === 'active' ? '' : 'fill-current'}`} />
                        </button>
                        <button
                          onClick={() => deleteCourse(course._id)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete Course"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
        <div>
          {/* Sub-tabs for Semester Management */}
          <div className="flex border-b mb-6 gap-4">
            <button
              onClick={() => setSemesterSubTab('semesters')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                semesterSubTab === 'semesters'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-1" />
              Semesters ({semesters.length})
            </button>
            <button
              onClick={() => setSemesterSubTab('exams')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                semesterSubTab === 'exams'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-1" />
              Exam Management ({exams.length})
            </button>
          </div>

          {/* Semesters Sub-tab */}
          {semesterSubTab === 'semesters' && (
            <div>
              {/* Controls */}
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => setShowAddSemester(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Semester
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {semesters.map((semester) => (
                  <motion.div
                    key={semester._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-lg">{semester.name}</div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            fetchExamsForSemester(semester._id);
                            setSemesterSubTab('exams');
                          }}
                          className="p-1 text-purple-600 hover:text-purple-900 hover:bg-purple-50 dark:text-purple-400 dark:hover:text-purple-300 dark:hover:bg-purple-900/20 rounded transition-colors"
                          title="Manage Exams"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditSemester(semester)}
                          className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded transition-colors"
                          title="Edit Semester"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteSemester(semester._id)}
                          className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Delete Semester"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {new Date(semester.startDate).toLocaleDateString()} - {new Date(semester.endDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(semester.status)}`}>
                        {semester.status.charAt(0).toUpperCase() + semester.status.slice(1)}
                      </span>
                      {semester.isCurrent && (
                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <div>Courses: {semester.courses.length}</div>
                      <div>Year: {semester.year}</div>
                      {semester.description && (
                        <div className="mt-1 text-xs">{semester.description}</div>
                      )}
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
            </div>
          )}

          {/* Exams Sub-tab */}
          {semesterSubTab === 'exams' && (
            <div>
              {/* Semester Selector and Controls */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div>
                    <span className="font-semibold">Select Semester:</span>
                    <select
                      value={selectedSemesterForExams || ''}
                      onChange={(e) => {
                        const semesterId = e.target.value;
                        if (semesterId) {
                          fetchExamsForSemester(semesterId);
                        } else {
                          setSelectedSemesterForExams(null);
                          setExams([]);
                        }
                      }}
                      className="ml-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select a semester</option>
                      {semesters.map((semester) => (
                        <option key={semester._id} value={semester._id}>
                          {semester.name} ({semester.year})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setExamForm(prev => ({ ...prev, semesterId: selectedSemesterForExams }));
                      setShowAddExam(true);
                    }}
                    disabled={!selectedSemesterForExams}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                    Add Exam
                  </button>
                  <button
                    onClick={() => {
                      if (selectedSemesterForExams) {
                        fetchExamsForSemester(selectedSemesterForExams);
                      }
                    }}
                    disabled={!selectedSemesterForExams}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Exams Table */}
              {selectedSemesterForExams ? (
                <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schedule</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exams.map((exam) => (
                        <tr key={exam._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4">
                            <div className="font-semibold">{exam.courseId?.code} - {exam.courseId?.name}</div>
                            <div className="text-xs text-gray-500">{exam.courseId?.department}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold capitalize">{exam.examType}</div>
                            <div className="text-sm text-gray-600">Max Marks: {exam.maxMarks}</div>
                            {exam.passingMarks && (
                              <div className="text-sm text-gray-600">Passing: {exam.passingMarks}</div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div>{new Date(exam.examDate).toLocaleDateString()}</div>
                            <div className="text-sm text-gray-600">{exam.startTime} - {exam.endTime}</div>
                            <div className="text-sm text-gray-600">Room: {exam.room}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(exam.status)}`}>
                              {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleEditExam(exam)}
                                className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                title="Edit Exam"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteExam(exam._id)}
                                className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Delete Exam"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {exams.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center text-gray-500 py-8">
                            <div className="font-semibold text-lg mb-2">No exams found</div>
                            <div className="text-sm">Add exams to schedule assessments for this semester.</div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <div className="font-semibold text-lg mb-2">Select a semester to manage exams</div>
                  <div className="text-sm">Choose a semester from the dropdown above to view and manage its exams.</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default AdminAcademicManagement;