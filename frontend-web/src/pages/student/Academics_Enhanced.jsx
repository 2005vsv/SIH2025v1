import { motion } from 'framer-motion';
import {
    BookOpen,
    Calendar as CalendarIcon,
    Clock as ClockIcon,
    GraduationCap,
    MapPin,
    Download,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI, courseAPI, examAPI, semesterAPI } from '../../services/api';

const DEFAULT_SEMESTER = 6;
const DEFAULT_CREDITS = 4;
const DEFAULT_GRADE_POINT = 10;
const DEFAULT_MAX_MARKS = 100;
const DEFAULT_DURATION = 180;

const Academics = () => {
  const { user, updateUser } = useAuth();
  const [examSchedule, setExamSchedule] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('courses');
  const [selectedSemester, setSelectedSemester] = useState(user?.profile?.semester || DEFAULT_SEMESTER);


  const fetchUserProfile = async () => {
    try {
      const response = await authAPI.me();
      if (response.data && response.data.user) {
        await updateUser(response.data.user);
      }
    } catch (error) {
      // ignore
    }
  };

  const fetchSemesters = async () => {
    try {
      const response = await semesterAPI.getAll();
      if (response.data && response.data.data) {
        setSemesters(response.data.data.semesters || []);
      }
    } catch (error) {
      console.warn('Failed to fetch semesters:', error);
      setSemesters([]);
    }
  };

  useEffect(() => {
    fetchSemesters();
    fetchAcademicData();
    fetchUserProfile();
    fetchCourses();

    // Set up polling for real-time updates every 5 minutes
    const interval = setInterval(() => {
      fetchAcademicData();
      fetchCourses();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [selectedSemester]);

  const fetchAcademicData = async () => {
    try {
      setLoading(true);

      // Fetch exam timetable filtered by selected semester
      console.log('Fetching exams for semester:', selectedSemester);
      let examScheduleData = [];
      try {
        const examResponse = await examAPI.getMyTimetable({ semesterNumber: selectedSemester });
        console.log('Exam response:', examResponse.data);
        if (examResponse.data && examResponse.data.data) {
          examScheduleData = examResponse.data.data.exams || [];
        }
      } catch (examError) {
        console.warn('Failed to fetch exam timetable:', examError);
      }

      // Set exam schedule from API data
      setExamSchedule(examScheduleData.map(exam => ({
        _id: exam._id,
        subjectId: exam.courseId?._id,
        subjectName: exam.courseId?.name || 'Unknown Course',
        subjectCode: exam.courseId?.code || 'N/A',
        examDate: exam.examDate,
        startTime: exam.startTime,
        endTime: exam.endTime,
        duration: exam.duration,
        roomNumber: exam.room,
        examType: exam.examType,
        instructions: exam.instructions,
        syllabusTopics: exam.syllabus ? exam.syllabus.split(',').map(t => t.trim()) : []
      })));

    } catch (error) {
      console.error('Error fetching academic data:', error);
      toast.error('Failed to load academic data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const [availableResponse, enrolledResponse] = await Promise.all([
        courseAPI.getAvailable({ semester: selectedSemester }),
        courseAPI.getMyCourses()
      ]);

      if (availableResponse.data && availableResponse.data.data) {
        setAvailableCourses(availableResponse.data.data.courses || []);
      }

      if (enrolledResponse.data && enrolledResponse.data.data) {
        setEnrolledCourses(enrolledResponse.data.data.courses || []);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      toast.error('Failed to load courses');
    }
  };

  const handleEnrollInCourse = async (courseId) => {
    try {
      await courseAPI.enroll(courseId);
      toast.success('Successfully enrolled in course!');
      fetchCourses(); // Refresh the course lists
    } catch (error) {
      console.error('Failed to enroll in course:', error);
      toast.error(error.response?.data?.message || 'Failed to enroll in course');
    }
  };

  const handleDropCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to drop this course?')) return;

    try {
      await courseAPI.drop(courseId);
      toast.success('Successfully dropped course!');
      fetchCourses(); // Refresh the course lists
    } catch (error) {
      console.error('Failed to drop course:', error);
      toast.error(error.response?.data?.message || 'Failed to drop course');
    }
  };

  const downloadExamSchedule = () => {
    if (examSchedule.length === 0) {
      toast.error('No exams to download');
      return;
    }

    const jsonData = {
      examSchedule: examSchedule.map(exam => ({
        subjectName: exam.subjectName,
        subjectCode: exam.subjectCode,
        examDate: exam.examDate,
        startTime: exam.startTime,
        endTime: exam.endTime,
        duration: exam.duration,
        roomNumber: exam.roomNumber,
        examType: exam.examType,
        instructions: exam.instructions,
        syllabusTopics: exam.syllabusTopics
      })),
      semester: selectedSemester,
      generatedOn: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam-schedule-semester-${selectedSemester}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Exam schedule downloaded!');
  };



  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-indigo-500" />
          Academic Management
        </h1>
        <div className="text-gray-500">Select courses and view your exam timetable</div>
      </motion.div>


      {/* Tabs */}
      <div className="flex gap-4 border-b mb-6">
        <button
          onClick={() => setActiveTab('courses')}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'courses'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Course Selection
        </button>
        <button
          onClick={() => setActiveTab('exams')}
          className={`py-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'exams'
              ? 'border-indigo-500 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Exam Timetable
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'courses' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Semester Selector */}
          <div className="flex items-center gap-4 mb-4">
            <div>
              <span className="font-semibold">Select Semester:</span>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(Number(e.target.value))}
                className="ml-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                  <option key={sem} value={sem}>
                    {sem}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Enrolled Courses */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Enrolled Courses ({enrolledCourses.length}/4)</h3>
            {enrolledCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {enrolledCourses.map((course) => (
                  <motion.div
                    key={course._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 border border-green-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-green-800">{course.code} - {course.name}</span>
                      <button
                        onClick={() => handleDropCourse(course._id)}
                        className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Drop
                      </button>
                    </div>
                    <div className="text-sm text-green-700">
                      <div>Instructor: {course.instructor?.name}</div>
                      <div>Credits: {course.credits} | Type: {course.type}</div>
                      <div>Enrolled: {new Date(course.enrolledAt).toLocaleDateString()}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-4 mb-6">
                No courses enrolled for this semester
              </div>
            )}
          </div>

          {/* Available Courses */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Available Courses</h3>
            {availableCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableCourses.map((course) => (
                  <motion.div
                    key={course._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="font-semibold mb-2">{course.code} - {course.name}</div>
                    <div className="text-sm text-gray-600 mb-2">
                      <div>Instructor: {course.instructor?.name}</div>
                      <div>Credits: {course.credits} | Type: {course.type}</div>
                      <div>Capacity: {course.enrolledStudents}/{course.maxCapacity}</div>
                      {course.schedule && course.schedule.length > 0 && (
                        <div>Schedule: {course.schedule[0].day} {course.schedule[0].time}</div>
                      )}
                    </div>
                    {course.description && (
                      <div className="text-xs text-gray-500 mb-2">{course.description}</div>
                    )}
                    <button
                      onClick={() => handleEnrollInCourse(course._id)}
                      disabled={enrolledCourses.length >= 4}
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {enrolledCourses.length >= 4 ? 'Enrollment Limit Reached' : 'Enroll'}
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No available courses for this semester
              </div>
            )}
          </div>
        </motion.div>
      )}


      {activeTab === 'exams' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Semester Selector and Download */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div>
                <span className="font-semibold">Select Semester:</span>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(Number(e.target.value))}
                  className="ml-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {semesters.length > 0 ? semesters.map(sem => (
                    <option key={sem._id} value={sem.semesterNumber}>
                      {sem.name} ({sem.year}) - Semester {sem.semesterNumber}
                    </option>
                  )) : [1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <option key={sem} value={sem}>
                      {sem}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={downloadExamSchedule}
              disabled={examSchedule.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Download Schedule
            </button>
          </div>

          <div className="font-semibold mb-2">Upcoming Exams</div>
          <div className="mb-2 text-sm text-gray-500">{examSchedule.length} exams scheduled for Semester {selectedSemester}</div>
          {examSchedule.map((exam, index) => (
            <motion.div
              key={exam._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-5 h-5 text-indigo-500" />
                <span className="font-semibold">{exam.subjectName}</span>
                <span className="text-xs text-gray-500">{exam.subjectCode}</span>
                <span className="ml-auto px-2 py-1 rounded text-xs font-semibold border bg-indigo-50 text-indigo-700 border-indigo-200">
                  {exam.examType.replace('-', ' ')}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-700 mb-2">
                <span>
                  <CalendarIcon className="inline w-4 h-4 mr-1" />
                  {new Date(exam.examDate).toLocaleDateString()}
                </span>
                <span>
                  <ClockIcon className="inline w-4 h-4 mr-1" />
                  {exam.startTime} - {exam.endTime} ({exam.duration} mins)
                </span>
                <span>
                  <MapPin className="inline w-4 h-4 mr-1" />
                  Room {exam.roomNumber}
                </span>
              </div>
              {exam.instructions && (
                <div className="text-xs text-gray-500 mb-1">
                  <span className="font-semibold">Instructions:</span> {exam.instructions}
                </div>
              )}
              {exam.syllabusTopics && exam.syllabusTopics.length > 0 && (
                <div className="text-xs text-gray-500">
                  <span className="font-semibold">Syllabus Topics:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {exam.syllabusTopics.map((topic, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
          {examSchedule.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              <div className="font-semibold mb-1">No exams scheduled</div>
            </div>
          )}
        </motion.div>
      )}


    </div>
  );
};


export default Academics;