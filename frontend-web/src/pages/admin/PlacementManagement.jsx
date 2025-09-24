import { Building, Calendar, Edit, Eye, GraduationCap, MapPin, Plus, Search, Star, Trash2, TrendingUp, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterBranch, setFilterBranch] = useState('all');
  const [showAddDrive, setShowAddDrive] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState(null);

  useEffect(() => {
    fetchPlacementData();
  }, []);

  const fetchPlacementData = async () => {
    try {
      setLoading(true);

      // Mock data for development
      const mockCompanies = [
        {
          _id: '1',
          name: 'TechCorp Solutions',
          industry: 'Information Technology',
          location: 'Bangalore, India',
          website: 'https://techcorp.com',
          description: 'Leading software development company specializing in AI and machine learning solutions.',
          status: 'active',
          contactPerson: {
            name: 'John Smith',
            email: 'john@techcorp.com',
            phone: '+91-9876543210'
          },
          visitHistory: [
            { date: '2024-03-15', positions: 10, selected: 8 },
            { date: '2023-09-20', positions: 8, selected: 6 }
          ]
        },
        {
          _id: '2',
          name: 'DataFlow Analytics',
          industry: 'Data Analytics',
          location: 'Mumbai, India',
          website: 'https://dataflow.com',
          description: 'Data analytics and business intelligence solutions provider.',
          status: 'active',
          contactPerson: {
            name: 'Sarah Johnson',
            email: 'sarah@dataflow.com',
            phone: '+91-9876543211'
          },
          visitHistory: [
            { date: '2024-02-10', positions: 5, selected: 4 }
          ]
        }
      ];

      const mockDrives = [
        {
          _id: '1',
          companyId: '1',
          companyName: 'TechCorp Solutions',
          jobTitle: 'Software Development Engineer',
          package: {
            ctc: 1200000,
            baseSalary: 900000,
            allowances: 200000
          },
          eligibility: {
            minCGPA: 7.5,
            branches: ['CSE', 'ECE'],
            batch: '2024',
            backlogs: false
          },
          driveDate: '2024-09-25',
          applicationDeadline: '2024-09-20',
          rounds: ['Online Test', 'Technical Interview', 'HR Interview'],
          maxPositions: 10,
          status: 'upcoming',
          applicationsCount: 25,
          selectedCount: 0
        },
        {
          _id: '2',
          companyId: '2',
          companyName: 'DataFlow Analytics',
          jobTitle: 'Data Analyst',
          package: {
            ctc: 900000,
            baseSalary: 700000,
            allowances: 150000
          },
          eligibility: {
            minCGPA: 7.0,
            branches: ['CSE', 'ECE', 'ME'],
            batch: '2024',
            backlogs: true
          },
          driveDate: '2024-09-30',
          applicationDeadline: '2024-09-25',
          rounds: ['Aptitude Test', 'Technical Interview', 'Group Discussion'],
          maxPositions: 5,
          status: 'ongoing',
          applicationsCount: 18,
          selectedCount: 2
        }
      ];

      const mockStudents = [
        {
          _id: '1',
          studentId: 'ST001',
          name: 'John Doe',
          email: 'john@student.edu',
          branch: 'CSE',
          cgpa: 8.5,
          batch: '2024',
          skills: ['JavaScript', 'React', 'Node.js', 'Python'],
          placementStatus: 'placed',
          appliedDrives: ['1', '2'],
          placedCompany: 'TechCorp Solutions',
          package: 1200000
        },
        {
          _id: '2',
          studentId: 'ST002',
          name: 'Jane Smith',
          email: 'jane@student.edu',
          branch: 'ECE',
          cgpa: 7.8,
          batch: '2024',
          skills: ['C++', 'MATLAB', 'Python', 'Machine Learning'],
          placementStatus: 'eligible',
          appliedDrives: ['2'],
        },
        {
          _id: '3',
          studentId: 'ST003',
          name: 'Mike Johnson',
          email: 'mike@student.edu',
          branch: 'ME',
          cgpa: 6.5,
          batch: '2024',
          skills: ['AutoCAD', 'SolidWorks', 'ANSYS'],
          placementStatus: 'not-eligible',
          appliedDrives: [],
        }
      ];

      setCompanies(mockCompanies);
      setDrives(mockDrives);
      setStudents(mockStudents);

      // Calculate stats
      const totalCompanies = mockCompanies.length;
      const activeDrives = mockDrives.filter(d => ['upcoming', 'ongoing'].includes(d.status)).length;
      const totalApplications = mockDrives.reduce((sum, drive) => sum + drive.applicationsCount, 0);
      const placedStudents = mockStudents.filter(s => s.placementStatus === 'placed').length;
      const eligibleStudents = mockStudents.filter(s => s.placementStatus === 'eligible').length;
      const totalEligible = placedStudents + eligibleStudents;
      const placementRate = totalEligible > 0 ? (placedStudents / totalEligible) * 100 : 0;
      const placedStudentsWithPackage = mockStudents.filter(s => s.package);
      const averagePackage = placedStudentsWithPackage.length > 0
        ? placedStudentsWithPackage.reduce((sum, s) => sum + (s.package || 0), 0) / placedStudentsWithPackage.length
        : 0;
      const highestPackage = Math.max(...placedStudentsWithPackage.map(s => s.package || 0), 0);

      setStats({
        totalCompanies,
        activeDrives,
        totalApplications,
        placedStudents,
        eligibleStudents,
        placementRate,
        averagePackage,
        highestPackage
      });
    } catch (error) {
      console.error('Error fetching placement data:', error);
    } finally {
      setLoading(false);
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
      setDrives(prev => prev.filter(drive => drive._id !== driveId));
    } catch (error) {
      console.error('Error deleting drive:', error);
    }
  };

  const filteredDrives = drives.filter(drive => {
    const matchesSearch = drive.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drive.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || drive.status === filterStatus;
    return matchesSearch && matchesStatus;
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
          onClick={() => setActiveTab('analytics')}
          className={`py-4 px-1 border-b-2 font-medium text-sm ${
            activeTab === 'analytics'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          Analytics & Reports
        </button>
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
                    <div className="font-bold text-lg">{drive.jobTitle}</div>
                    <div className="text-sm text-gray-500">{drive.companyName}</div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(drive.status)}`}>
                      {drive.status.charAt(0).toUpperCase() + drive.status.slice(1)}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      ₹{(drive.package.ctc / 100000).toFixed(1)}L CTC
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
                  <div>Drive Date: <span className="font-medium">{new Date(drive.driveDate).toLocaleDateString()}</span></div>
                  <div>Deadline: <span className="font-medium">{new Date(drive.applicationDeadline).toLocaleDateString()}</span></div>
                  <div>Positions: <span className="font-medium">{drive.maxPositions}</span></div>
                  <div>Applications: <span className="font-medium">{drive.applicationsCount}</span></div>
                </div>
                <div className="text-xs text-gray-700 dark:text-gray-200 mb-2">
                  <div>
                    <span className="font-semibold">Eligibility:</span>
                    Min CGPA: {drive.eligibility.minCGPA} | Branches: {drive.eligibility.branches.join(', ')} | Backlogs: {drive.eligibility.backlogs ? 'Allowed' : 'Not Allowed'}
                  </div>
                </div>
                <div className="text-xs text-gray-700 dark:text-gray-200 mb-2">
                  <span className="font-semibold">Selection Rounds:</span>
                  {drive.rounds.map((round, index) => (
                    <span
                      key={index}
                      className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/30 dark:text-blue-300"
                    >
                      {round}
                    </span>
                  ))}
                </div>
                {drive.status !== 'cancelled' && (
                  <div className="flex gap-2 mt-2">
                    {drive.status === 'upcoming' && (
                      <button
                        onClick={() => updateDriveStatus(drive._id, 'ongoing')}
                        className="flex-1 px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Start Drive
                      </button>
                    )}
                    {drive.status === 'ongoing' && (
                      <button
                        onClick={() => updateDriveStatus(drive._id, 'completed')}
                        className="flex-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Complete Drive
                      </button>
                    )}
                    <button
                      onClick={() => updateDriveStatus(drive._id, 'cancelled')}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
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