import { motion } from 'framer-motion';
import { Eye, FileText, Plus, Search, Trash2, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { interviewAPI, placementAPI } from '../../services/api';

const AdminPlacementManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [drives, setDrives] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    totalCompanies: 0,
    activeDrives: 0,
    totalApplications: 0,
    placedStudents: 0,
    eligibleStudents: 0,
    placementRate: 0,
    averagePackage: 0,
    highestPackage: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('drives');
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterBranch, setFilterBranch] = useState('all');
  const [showAddDrive, setShowAddDrive] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState(null);
    const [editDrive, setEditDrive] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
  const [scheduleModalApp, setScheduleModalApp] = useState(null);
  const [interviewForm, setInterviewForm] = useState({
    date: '',
    time: '',
    mode: 'online',
    questions: [''],
  });
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    fetchPlacementData();
  }, []);

  useEffect(() => {
    if (activeTab === 'applications') {
      fetchApplications();
    }
    // eslint-disable-next-line
  }, [activeTab]);

  const fetchApplications = async () => {
    setLoadingApps(true);
    try {
      const res = await placementAPI.getAllStudentApplications();
      setApplications(res.data.applications || []);
    } catch (err) {
      setApplications([]);
      toast.error('Failed to fetch applications');
    } finally {
      setLoadingApps(false);
    }
  };

  const fetchPlacementData = async () => {
    try {
      setLoading(true);
      // Fetch drives from backend
  const drivesRes = await placementAPI.getJobs({ limit: 100 });
  console.log('Fetched jobs:', drivesRes.data.data.jobs);
  setDrives(drivesRes.data.data.jobs || []);
      // TODO: Fetch companies and students from backend if needed
      // setCompanies(...)
      // setStudents(...)
      // Show all jobs for admin
      setStats((prev) => ({
        ...prev,
        activeDrives: (drivesRes.data.data.jobs || []).length,
      }));
    } catch (error) {
      toast.error('Error fetching placement drives');
      console.error('Error fetching placement data:', error);
    } finally {
      setLoading(false);
    }
  };

    // Open edit modal when selectedDrive is set
    useEffect(() => {
      if (selectedDrive) {
        setEditDrive({
          ...selectedDrive,
          requirements: (selectedDrive.requirements || []).join(', '),
          departments: (selectedDrive.eligibilityCriteria?.departments || []).join(', '),
          graduationYears: (selectedDrive.eligibilityCriteria?.graduationYears || []).join(', '),
          skills: (selectedDrive.eligibilityCriteria?.skills || []).join(', '),
          cgpaMin: selectedDrive.eligibilityCriteria?.cgpaMin ?? '',
          salaryMin: selectedDrive.salaryRange?.min ?? '',
          salaryMax: selectedDrive.salaryRange?.max ?? '',
          salaryCurrency: selectedDrive.salaryRange?.currency ?? 'INR',
          applicationDeadline: selectedDrive.applicationDeadline ? new Date(selectedDrive.applicationDeadline).toISOString().slice(0,10) : '',
        });
        setShowEditModal(true);
      } else {
        setShowEditModal(false);
      }
    }, [selectedDrive]);

    const handleEditDriveChange = (field, value) => {
      setEditDrive(prev => ({ ...prev, [field]: value }));
    };

    const handleUpdateDrive = async () => {
      if (!editDrive.title || !editDrive.companyId || !editDrive.description || !editDrive.location || !editDrive.salaryMin || !editDrive.salaryMax || !editDrive.applicationDeadline || !editDrive.totalPositions) {
        toast.error('Please fill all required fields');
        return;
      }
      try {
        const payload = {
          title: editDrive.title,
          companyId: editDrive.companyId,
          description: editDrive.description,
          requirements: editDrive.requirements.split(',').map(r => r.trim()).filter(Boolean),
          location: editDrive.location,
          employmentType: editDrive.employmentType,
          salaryRange: {
            min: Number(editDrive.salaryMin),
            max: Number(editDrive.salaryMax),
            currency: editDrive.salaryCurrency,
          },
          applicationDeadline: new Date(editDrive.applicationDeadline),
          eligibilityCriteria: {
            cgpaMin: editDrive.cgpaMin ? Number(editDrive.cgpaMin) : undefined,
            departments: editDrive.departments.split(',').map(d => d.trim()).filter(Boolean),
            graduationYears: editDrive.graduationYears.split(',').map(y => Number(y.trim())).filter(Boolean),
            skills: editDrive.skills.split(',').map(s => s.trim()).filter(Boolean),
          },
          totalPositions: Number(editDrive.totalPositions),
          isActive: editDrive.isActive,
        };
        await placementAPI.updateJob(editDrive._id, payload);
        toast.success('Drive updated');
        setShowEditModal(false);
        setSelectedDrive(null);
        fetchPlacementData();
      } catch (error) {
        const msg = error?.response?.data?.message || error.message || 'Failed to update drive';
        toast.error(msg);
      }
    };
  // Add Drive Modal State
  const [newDrive, setNewDrive] = useState({
    title: '',
  companyId: '',
  companyName: '',
    description: '',
    requirements: '',
    location: '',
    employmentType: 'full_time',
    salaryMin: '',
    salaryMax: '',
    salaryCurrency: 'INR',
    applicationDeadline: '',
    cgpaMin: '',
    departments: '',
    graduationYears: '',
    skills: '',
    totalPositions: '',
  });

  const handleAddDrive = async () => {
    // Extra validation
  if (!newDrive.title || !newDrive.companyId || !newDrive.companyName || !newDrive.description || !newDrive.location || !newDrive.salaryMin || !newDrive.salaryMax || !newDrive.applicationDeadline || !newDrive.totalPositions) {
      toast.error('Please fill all required fields');
      return;
    }
    // Validate ObjectId format (24 hex chars)
    if (!/^[a-fA-F0-9]{24}$/.test(newDrive.companyId)) {
      toast.error('Company ID must be a valid MongoDB ObjectId (24 hex characters)');
      return;
    }
    // Validate date format
    if (isNaN(Date.parse(newDrive.applicationDeadline))) {
      toast.error('Application deadline must be a valid date');
      return;
    }
    // Validate numbers
    if (Number(newDrive.salaryMin) <= 0 || Number(newDrive.salaryMax) <= 0 || Number(newDrive.totalPositions) <= 0) {
      toast.error('Salary and total positions must be positive numbers');
      return;
    }
    try {
      const payload = {
        title: newDrive.title,
  companyId: newDrive.companyId,
  companyName: newDrive.companyName,
        description: newDrive.description,
        requirements: newDrive.requirements.split(',').map(r => r.trim()).filter(Boolean),
        location: newDrive.location,
        employmentType: newDrive.employmentType,
        salaryRange: {
          min: Number(newDrive.salaryMin),
          max: Number(newDrive.salaryMax),
          currency: newDrive.salaryCurrency,
        },
        applicationDeadline: new Date(newDrive.applicationDeadline),
        eligibilityCriteria: {
          cgpaMin: newDrive.cgpaMin ? Number(newDrive.cgpaMin) : undefined,
          departments: newDrive.departments.split(',').map(d => d.trim()).filter(Boolean),
          graduationYears: newDrive.graduationYears.split(',').map(y => Number(y.trim())).filter(Boolean),
          skills: newDrive.skills.split(',').map(s => s.trim()).filter(Boolean),
        },
        totalPositions: Number(newDrive.totalPositions),
      };
      console.log('Submitting payload:', payload);
      await placementAPI.createJob(payload);
      toast.success('Placement drive added');
      setShowAddDrive(false);
      setNewDrive({
        title: '',
        companyId: '',
        description: '',
        requirements: '',
        location: '',
        employmentType: 'full_time',
        salaryMin: '',
        salaryMax: '',
        salaryCurrency: 'INR',
        applicationDeadline: '',
        cgpaMin: '',
        departments: '',
        graduationYears: '',
        skills: '',
        totalPositions: '',
      });
      fetchPlacementData();
    } catch (error) {
      // Show backend error message if available
      const msg = error?.response?.data?.message || error.message || 'Failed to add placement drive';
      toast.error(msg);
      console.error('Add drive error:', error, 'Payload:', payload);
    }
  };

  const updateDriveStatus = async (driveId, status) => {
    try {
      setDrives(prev =>
        prev.map(drive =>
          drive._id === driveId ? { ...drive, status } : drive
        )
      );
    } catch (error) {
      console.error('Error updating drive status:', error);
    }
  };

  const deleteDrive = async (driveId) => {
    if (!window.confirm('Are you sure you want to delete this placement drive?')) return;
    try {
      await placementAPI.deleteJob(driveId);
      toast.success('Drive deleted successfully');
      fetchPlacementData();
    } catch (error) {
      toast.error('Failed to delete drive');
      console.error('Error deleting drive:', error);
    }
  };

  const filteredDrives = drives.filter(drive => {
    const matchesSearch = drive.title?.toLowerCase().includes(searchTerm.toLowerCase());
    return !searchTerm || matchesSearch;
  });

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = filterBranch === 'all' || student.branch === filterBranch;
    return matchesSearch && matchesBranch;
  });

  const getStatusColor = (status) => {
    const colors = {
      upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      ongoing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
      blacklisted: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      eligible: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      placed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'not-placed': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'not-eligible': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return colors[status] || colors.upcoming;
  };

  const handleInterviewFormChange = (field, value) => {
    setInterviewForm((prev) => ({ ...prev, [field]: value }));
  };
  const handleInterviewQuestionChange = (idx, value) => {
    setInterviewForm((prev) => {
      const questions = [...prev.questions];
      questions[idx] = value;
      return { ...prev, questions };
    });
  };
  const addInterviewQuestion = () => {
    setInterviewForm((prev) => ({ ...prev, questions: [...prev.questions, ''] }));
  };
  const removeInterviewQuestion = (idx) => {
    setInterviewForm((prev) => ({ ...prev, questions: prev.questions.filter((_, i) => i !== idx) }));
  };
  const handleScheduleInterview = async () => {
    // Validate date
    if (!interviewForm.date || isNaN(Date.parse(interviewForm.date))) {
      toast.error('Please select a valid date');
      return;
    }
    // Validate time
    if (!interviewForm.time || typeof interviewForm.time !== 'string' || interviewForm.time.length < 3) {
      toast.error('Please enter a valid time');
      return;
    }
    // Validate mode
    if (!['online', 'offline'].includes(interviewForm.mode)) {
      toast.error('Please select interview mode');
      return;
    }
    // Validate questions
    if (!Array.isArray(interviewForm.questions) || interviewForm.questions.length === 0 || interviewForm.questions.some(q => !q.trim())) {
      toast.error('Please add at least one valid aptitude question');
      return;
    }
    setScheduling(true);
    try {
      const payload = {
        date: interviewForm.date, // send as string (YYYY-MM-DD)
        time: interviewForm.time, // send as string (HH:mm)
        mode: interviewForm.mode,
        questions: interviewForm.questions.map(q => q.trim()),
      };
      const res = await interviewAPI.scheduleInterview(scheduleModalApp._id, payload);
      toast.success('Interview scheduled successfully');
      // Update the scheduled application in state immediately for instant feedback
      if (res.data && res.data.application) {
        setApplications(applications => applications.map(app =>
          app._id === res.data.application._id ? res.data.application : app
        ));
      }
      setScheduleModalApp(null);
      setInterviewForm({ date: '', time: '', mode: 'online', questions: [''] });
      // Also refresh applications after a short delay to ensure backend sync
      setTimeout(() => {
        fetchApplications();
      }, 300);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to schedule interview');
    } finally {
      setScheduling(false);
    }
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
          <TrendingUp className="w-6 h-6 text-blue-500" />
          Placement Management
        </h1>
        <div className="text-gray-500">Manage placement drives, companies, and student placements</div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-1">Companies</div>
          <div className="text-2xl font-bold">{stats.totalCompanies}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-1">Active Drives</div>
          <div className="text-2xl font-bold">{stats.activeDrives}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-1">Applications</div>
          <div className="text-2xl font-bold">{stats.totalApplications}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-1">Placed</div>
          <div className="text-2xl font-bold">{stats.placedStudents}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-1">Placement Rate</div>
          <div className="text-2xl font-bold">{stats.placementRate.toFixed(1)}%</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-1">Avg Package</div>
          <div className="text-2xl font-bold">₹{(stats.averagePackage / 100000).toFixed(1)}L</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-1">Highest Package</div>
          <div className="text-2xl font-bold">₹{(stats.highestPackage / 100000).toFixed(1)}L</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="text-xs text-gray-500 mb-1">Eligible</div>
          <div className="text-2xl font-bold">{stats.eligibleStudents}</div>
        </motion.div>
      </div>

      {/* Tabs */}
  <div className="flex border-b mb-6 gap-4">
        <button
          onClick={() => setActiveTab('drives')}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'drives'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Placement Drives ({drives.length})
        </button>
        <button
          onClick={() => setActiveTab('companies')}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'companies'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Companies ({companies.length})
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'students'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Student Placements ({students.length})
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'applications'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Applications
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'analytics'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Analytics & Reports
        </button>
      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <div className="flex flex-col items-center w-full">
          {/* Main Applications Section (placeholder for other content) */}
          <div className="w-full max-w-7xl mb-10">
            {/* Place your main applications content here if any */}
          </div>
          {/* Student Job Applications Table */}
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 self-start">
            <FileText className="w-6 h-6 text-blue-500" />
            Student Job Applications
          </h2>
          <div className="w-full max-w-7xl">
            {loadingApps ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Loading applications...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No applications found</p>
              </div>
            ) : (
              <div className="overflow-x-auto w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100">
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="py-3 px-4 text-left whitespace-nowrap">Student Name</th>
                      <th className="py-3 px-4 text-left whitespace-nowrap">Email</th>
                      <th className="py-3 px-4 text-left whitespace-nowrap">Student ID</th>
                      <th className="py-3 px-4 text-left whitespace-nowrap">Department</th>
                      <th className="py-3 px-4 text-left whitespace-nowrap">Job Title</th>
                      <th className="py-3 px-4 text-left whitespace-nowrap">Company</th>
                      <th className="py-3 px-4 text-left whitespace-nowrap">Location</th>
                      <th className="py-3 px-4 text-left whitespace-nowrap">Status</th>
                      <th className="py-3 px-4 text-left whitespace-nowrap">Applied At</th>
                      <th className="py-3 px-4 text-left whitespace-nowrap">Resume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app, idx) => {
                      const isInterviewScheduled = app.status === 'interview_scheduled';
                      return (
                        <tr key={app._id} className={idx % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-900"}>
                          <td className="py-2 px-4 max-w-[160px] truncate" title={app.userId?.name}>{app.userId?.name || '-'}</td>
                          <td className="py-2 px-4 max-w-[180px] truncate" title={app.userId?.email}>{app.userId?.email || '-'}</td>
                          <td className="py-2 px-4 max-w-[120px] truncate" title={app.userId?.studentId}>{app.userId?.studentId || '-'}</td>
                          <td className="py-2 px-4 max-w-[120px] truncate" title={app.userId?.profile?.department}>{app.userId?.profile?.department || '-'}</td>
                          <td className="py-2 px-4 max-w-[160px] truncate" title={app.jobId?.title}>{app.jobId?.title || '-'}</td>
                          <td className="py-2 px-4 max-w-[160px] truncate" title={app.jobId?.company}>{app.jobId?.company || '-'}</td>
                          <td className="py-2 px-4 max-w-[120px] truncate" title={app.jobId?.location}>{app.jobId?.location || '-'}</td>
                          <td className="py-2 px-4 max-w-[100px] truncate" title={app.status}>{app.status.replace('_', ' ')}</td>
                          <td className="py-2 px-4 max-w-[120px] truncate" title={app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '-'}>{app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : '-'}</td>
                          <td className="py-2 px-4 max-w-[100px] truncate">
                            {app.resumeUrl ? (
                              (() => {
                                const fullUrl = `${import.meta.env.VITE_API_BASE_URL}${app.resumeUrl}`;
                                return (
                                  <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Download</a>
                                );
                              })()
                            ) : (
                              <span className="text-gray-400">No resume</span>
                            )}
                          </td>
                          <td className="py-2 px-4">
                            {isInterviewScheduled ? (
                              <button className="px-3 py-1 bg-gray-400 text-white rounded text-xs cursor-default" disabled>
                                Scheduled
                              </button>
                            ) : (
                              <button
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                                onClick={() => setScheduleModalApp(app)}
                              >
                                Schedule Interview
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  {/* Interview scheduling modal state and functions are moved above the return statement */}
      {/* Interview Scheduling Modal */}
      {scheduleModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Schedule Interview for {scheduleModalApp.userId?.name}</h2>
            <form className="flex flex-col gap-4">
              <div>
                <label className="font-medium">Date</label>
                <input type="date" className="input w-full" value={interviewForm.date} onChange={e => handleInterviewFormChange('date', e.target.value)} />
              </div>
              <div>
                <label className="font-medium">Time</label>
                <input type="time" className="input w-full" value={interviewForm.time} onChange={e => handleInterviewFormChange('time', e.target.value)} />
              </div>
              <div>
                <label className="font-medium">Mode</label>
                <select className="input w-full" value={interviewForm.mode} onChange={e => handleInterviewFormChange('mode', e.target.value)}>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
              <div>
                <label className="font-medium">Aptitude Questions</label>
                {interviewForm.questions.map((q, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input type="text" className="input flex-1" placeholder={`Question ${idx + 1}`} value={q} onChange={e => handleInterviewQuestionChange(idx, e.target.value)} />
                    {interviewForm.questions.length > 1 && (
                      <button type="button" className="text-red-500" onClick={() => removeInterviewQuestion(idx)}>Remove</button>
                    )}
                  </div>
                ))}
                <button type="button" className="text-blue-600 mt-2" onClick={addInterviewQuestion}>Add Question</button>
              </div>
            </form>
            <div className="flex gap-4 mt-6 justify-center">
              <button className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold" onClick={handleScheduleInterview} disabled={scheduling}>{scheduling ? 'Scheduling...' : 'Schedule'}</button>
              <button className="px-6 py-2 bg-gray-300 rounded-lg font-semibold" onClick={() => setScheduleModalApp(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      </div>

      {/* Drives Tab */}
      {activeTab === 'drives' && (
        <div>
          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search drives, companies, or job titles..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              onClick={() => setShowAddDrive(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Drive
            </button>
          </div>
          {/* Add Drive Modal */}
          {showAddDrive && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6 text-center">Add Placement Drive</h2>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col">
                    <label className="font-medium mb-1">Company Name<span className="text-red-500">*</span></label>
                    <input type="text" className="input" placeholder="e.g. Infosys" value={newDrive.companyName} onChange={e => setNewDrive({ ...newDrive, companyName: e.target.value })} />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-medium mb-1">Job Title<span className="text-red-500">*</span></label>
                    <input type="text" className="input" placeholder="e.g. Software Engineer" value={newDrive.title} onChange={e => setNewDrive({ ...newDrive, title: e.target.value })} />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-medium mb-1">Company ID<span className="text-red-500">*</span></label>
                    <input type="text" className="input" placeholder="Paste Company ObjectId" value={newDrive.companyId} onChange={e => setNewDrive({ ...newDrive, companyId: e.target.value })} />
                  </div>
                  <div className="flex flex-col md:col-span-2">
                    <label className="font-medium mb-1">Description<span className="text-red-500">*</span></label>
                    <textarea className="input" rows={2} placeholder="Job description" value={newDrive.description} onChange={e => setNewDrive({ ...newDrive, description: e.target.value })} />
                  </div>
                  <div className="flex flex-col md:col-span-2">
                    <label className="font-medium mb-1">Requirements (comma separated)</label>
                    <input type="text" className="input" placeholder="e.g. React, Node.js" value={newDrive.requirements} onChange={e => setNewDrive({ ...newDrive, requirements: e.target.value })} />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-medium mb-1">Location<span className="text-red-500">*</span></label>
                    <input type="text" className="input" placeholder="e.g. Bangalore" value={newDrive.location} onChange={e => setNewDrive({ ...newDrive, location: e.target.value })} />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-medium mb-1">Employment Type<span className="text-red-500">*</span></label>
                    <select className="input" value={newDrive.employmentType} onChange={e => setNewDrive({ ...newDrive, employmentType: e.target.value })}>
                      <option value="full_time">Full Time</option>
                      <option value="part_time">Part Time</option>
                      <option value="internship">Internship</option>
                      <option value="contract">Contract</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="font-medium mb-1">Salary Min<span className="text-red-500">*</span></label>
                    <input type="number" className="input" placeholder="e.g. 500000" value={newDrive.salaryMin} onChange={e => setNewDrive({ ...newDrive, salaryMin: e.target.value })} />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-medium mb-1">Salary Max<span className="text-red-500">*</span></label>
                    <input type="number" className="input" placeholder="e.g. 1200000" value={newDrive.salaryMax} onChange={e => setNewDrive({ ...newDrive, salaryMax: e.target.value })} />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-medium mb-1">Currency</label>
                    <select className="input" value={newDrive.salaryCurrency} onChange={e => setNewDrive({ ...newDrive, salaryCurrency: e.target.value })}>
                      <option value="INR">INR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="font-medium mb-1">Application Deadline<span className="text-red-500">*</span></label>
                    <input type="date" className="input" value={newDrive.applicationDeadline} onChange={e => setNewDrive({ ...newDrive, applicationDeadline: e.target.value })} />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-medium mb-1">Min CGPA</label>
                    <input type="number" className="input" placeholder="e.g. 7.5" value={newDrive.cgpaMin} onChange={e => setNewDrive({ ...newDrive, cgpaMin: e.target.value })} />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-medium mb-1">Departments (comma separated)</label>
                    <input type="text" className="input" placeholder="e.g. CSE, ECE" value={newDrive.departments} onChange={e => setNewDrive({ ...newDrive, departments: e.target.value })} />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-medium mb-1">Graduation Years (comma separated)</label>
                    <input type="text" className="input" placeholder="e.g. 2024, 2025" value={newDrive.graduationYears} onChange={e => setNewDrive({ ...newDrive, graduationYears: e.target.value })} />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-medium mb-1">Skills (comma separated)</label>
                    <input type="text" className="input" placeholder="e.g. Python, Java" value={newDrive.skills} onChange={e => setNewDrive({ ...newDrive, skills: e.target.value })} />
                  </div>
                  <div className="flex flex-col">
                    <label className="font-medium mb-1">Total Positions<span className="text-red-500">*</span></label>
                    <input type="number" className="input" placeholder="e.g. 10" value={newDrive.totalPositions} onChange={e => setNewDrive({ ...newDrive, totalPositions: e.target.value })} />
                  </div>
                </form>
                <div className="flex gap-4 mt-8 justify-center">
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold" onClick={handleAddDrive}>Add Drive</button>
                  <button className="px-6 py-2 bg-gray-300 rounded-lg font-semibold" onClick={() => setShowAddDrive(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Drives Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {filteredDrives.map((drive) => (
              <motion.div
                key={drive._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <div className="font-bold text-lg">{drive.title}</div>
                    <div className="text-sm text-gray-500">Company ID: {drive.companyId}</div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(drive.isActive ? 'active' : 'inactive')}`}>
                      {drive.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      ₹{(drive.salaryRange?.max / 100000).toFixed(1)}L Max
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => setSelectedDrive(drive)}
                    className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    title="View/Edit"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => deleteDrive(drive._id)}
                    className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="text-xs text-gray-700 dark:text-gray-200 mb-2">
                  <div>Description: <span className="font-medium">{drive.description}</span></div>
                  <div>Location: <span className="font-medium">{drive.location}</span></div>
                  <div>Deadline: <span className="font-medium">{new Date(drive.applicationDeadline).toLocaleDateString()}</span></div>
                  <div>Positions: <span className="font-medium">{drive.totalPositions}</span></div>
                  <div>Applications: <span className="font-medium">{drive.appliedCount || 0}</span></div>
                </div>
                <div className="text-xs text-gray-700 dark:text-gray-200 mb-2">
                  <div>
                    <span className="font-semibold">Eligibility:</span>
                    Min CGPA: {drive.eligibilityCriteria?.cgpaMin ?? '-'} | Departments: {drive.eligibilityCriteria?.departments?.join(', ') ?? '-'}
                  </div>
                </div>
                <div className="text-xs text-gray-700 dark:text-gray-200 mb-2">
                  <span className="font-semibold">Skills:</span>
                  {drive.eligibilityCriteria?.skills?.map((skill, index) => (
                    <span
                      key={index}
                      className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/30 dark:text-blue-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                {/* Status/Actions can be added here if needed */}
              </motion.div>
            ))}
          </div>
            {/* Edit Drive Modal */}
            {showEditModal && editDrive && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <h2 className="text-2xl font-bold mb-6 text-center">View/Edit Placement Drive</h2>
                  <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col">
                      <label className="font-medium mb-1">Job Title<span className="text-red-500">*</span></label>
                      <input type="text" className="input" value={editDrive.title} onChange={e => handleEditDriveChange('title', e.target.value)} />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-medium mb-1">Company ID<span className="text-red-500">*</span></label>
                      <input type="text" className="input" value={editDrive.companyId} onChange={e => handleEditDriveChange('companyId', e.target.value)} />
                    </div>
                    <div className="flex flex-col md:col-span-2">
                      <label className="font-medium mb-1">Description<span className="text-red-500">*</span></label>
                      <textarea className="input" rows={2} value={editDrive.description} onChange={e => handleEditDriveChange('description', e.target.value)} />
                    </div>
                    <div className="flex flex-col md:col-span-2">
                      <label className="font-medium mb-1">Requirements (comma separated)</label>
                      <input type="text" className="input" value={editDrive.requirements} onChange={e => handleEditDriveChange('requirements', e.target.value)} />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-medium mb-1">Location<span className="text-red-500">*</span></label>
                      <input type="text" className="input" value={editDrive.location} onChange={e => handleEditDriveChange('location', e.target.value)} />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-medium mb-1">Employment Type<span className="text-red-500">*</span></label>
                      <select className="input" value={editDrive.employmentType} onChange={e => handleEditDriveChange('employmentType', e.target.value)}>
                        <option value="full_time">Full Time</option>
                        <option value="part_time">Part Time</option>
                        <option value="internship">Internship</option>
                        <option value="contract">Contract</option>
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label className="font-medium mb-1">Salary Min<span className="text-red-500">*</span></label>
                      <input type="number" className="input" value={editDrive.salaryMin} onChange={e => handleEditDriveChange('salaryMin', e.target.value)} />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-medium mb-1">Salary Max<span className="text-red-500">*</span></label>
                      <input type="number" className="input" value={editDrive.salaryMax} onChange={e => handleEditDriveChange('salaryMax', e.target.value)} />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-medium mb-1">Currency</label>
                      <select className="input" value={editDrive.salaryCurrency} onChange={e => handleEditDriveChange('salaryCurrency', e.target.value)}>
                        <option value="INR">INR</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label className="font-medium mb-1">Application Deadline<span className="text-red-500">*</span></label>
                      <input type="date" className="input" value={editDrive.applicationDeadline} onChange={e => handleEditDriveChange('applicationDeadline', e.target.value)} />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-medium mb-1">Min CGPA</label>
                      <input type="number" className="input" value={editDrive.cgpaMin} onChange={e => handleEditDriveChange('cgpaMin', e.target.value)} />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-medium mb-1">Departments (comma separated)</label>
                      <input type="text" className="input" value={editDrive.departments} onChange={e => handleEditDriveChange('departments', e.target.value)} />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-medium mb-1">Graduation Years (comma separated)</label>
                      <input type="text" className="input" value={editDrive.graduationYears} onChange={e => handleEditDriveChange('graduationYears', e.target.value)} />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-medium mb-1">Skills (comma separated)</label>
                      <input type="text" className="input" value={editDrive.skills} onChange={e => handleEditDriveChange('skills', e.target.value)} />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-medium mb-1">Total Positions<span className="text-red-500">*</span></label>
                      <input type="number" className="input" value={editDrive.totalPositions} onChange={e => handleEditDriveChange('totalPositions', e.target.value)} />
                    </div>
                    <div className="flex flex-col">
                      <label className="font-medium mb-1">Active</label>
                      <select className="input" value={editDrive.isActive} onChange={e => handleEditDriveChange('isActive', e.target.value === 'true')}>
                        <option value={true}>Active</option>
                        <option value={false}>Inactive</option>
                      </select>
                    </div>
                  </form>
                  <div className="flex gap-4 mt-8 justify-center">
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold" onClick={handleUpdateDrive}>Save Changes</button>
                    <button className="px-6 py-2 bg-gray-300 rounded-lg font-semibold" onClick={() => { setShowEditModal(false); setSelectedDrive(null); }}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
          {filteredDrives.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <div className="font-semibold text-lg mb-2">No placement drives found</div>
              <div className="text-sm">Try adjusting your search or filter criteria.</div>
            </div>
          )}
        </div>
      )}

      {/* Companies Tab */}
      {activeTab === 'companies' && (
        <div className="grid md:grid-cols-2 gap-4">
          {companies.map((company) => (
            <motion.div
              key={company._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
            >
              <div className="font-bold text-lg">{company.name}</div>
              <div className="text-sm text-gray-500">{company.industry}</div>
              <div className="text-xs text-gray-700 dark:text-gray-200 mb-2">{company.location}</div>
              <div className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(company.status)}`}>
                {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
              </div>
              <div className="my-2 text-gray-700 dark:text-gray-200">{company.description}</div>
              <div className="text-xs text-gray-700 dark:text-gray-200 mb-2">
                <span className="font-semibold">Contact:</span> {company.contactPerson.name} ({company.contactPerson.email})
              </div>
              {company.visitHistory.length > 0 && (
                <div className="text-xs text-gray-700 dark:text-gray-200">
                  <span className="font-semibold">Last Visit:</span> {new Date(company.visitHistory[0].date).toLocaleDateString()} - {company.visitHistory[0].selected}/{company.visitHistory[0].positions} selected
                </div>
              )}
            </motion.div>
          ))}
          {companies.length === 0 && (
            <div className="text-center text-gray-500 py-8 col-span-2">
              <div className="font-semibold text-lg mb-2">No companies found</div>
              <div className="text-sm">Add companies to manage placement drives.</div>
            </div>
          )}
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div>
          {/* Student Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search students by name, ID, or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
            >
              <option value="all">All Branches</option>
              <option value="CSE">Computer Science</option>
              <option value="ECE">Electronics</option>
              <option value="ME">Mechanical</option>
              <option value="CE">Civil</option>
            </select>
          </div>
          {/* Students Table */}
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="py-3 px-4 text-left">Student</th>
                  <th className="py-3 px-4 text-left">Academic Info</th>
                  <th className="py-3 px-4 text-left">Skills</th>
                  <th className="py-3 px-4 text-left">Placement Status</th>
                  <th className="py-3 px-4 text-left">Applications</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <motion.tr
                    key={student._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="py-2 px-4">
                      <div className="font-semibold">{student.name}</div>
                      <div className="text-xs text-gray-500">{student.studentId}</div>
                      <div className="text-xs text-gray-500">{student.email}</div>
                    </td>
                    <td className="py-2 px-4">
                      <div>{student.branch}</div>
                      <div>CGPA: {student.cgpa}</div>
                      <div>Batch: {student.batch}</div>
                    </td>
                    <td className="py-2 px-4">
                      {student.skills.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="mr-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/30 dark:text-blue-300"
                        >
                          {skill}
                        </span>
                      ))}
                      {student.skills.length > 3 && (
                        <span className="text-xs text-gray-500">+{student.skills.length - 3}</span>
                      )}
                    </td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(student.placementStatus)}`}>
                        {student.placementStatus.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      {student.placedCompany && (
                        <div className="text-xs text-blue-700 dark:text-blue-300">
                          {student.placedCompany} - ₹{((student.package || 0) / 100000).toFixed(1)}L
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-4">
                      {student.appliedDrives.length} applications
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filteredStudents.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <div className="font-semibold text-lg mb-2">No students found</div>
                <div className="text-sm">Try adjusting your search or filter criteria.</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="text-center text-gray-500 py-8">
          <div className="font-semibold text-lg mb-2">Placement Analytics</div>
          <div className="text-sm">Detailed analytics and reporting features coming soon.</div>
        </div>
      )}
    </div>
  );
};

export default AdminPlacementManagement;