import { Building, Calendar, Edit, Eye, GraduationCap, MapPin, Plus, Search, Star, Trash2, TrendingUp, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Company {
  _id: string;
  name: string;
  logo?: string;
  industry: string;
  location: string;
  website?: string;
  description: string;
  status: 'active' | 'inactive' | 'blacklisted';
  contactPerson: {
    name: string;
    email: string;
    phone: string;
  };
  visitHistory: {
    date: string;
    positions: number;
    selected: number;
  }[];
}

interface PlacementDrive {
  _id: string;
  companyId: string;
  companyName: string;
  jobTitle: string;
  package: {
    ctc: number;
    baseSalary: number;
    allowances?: number;
  };
  eligibility: {
    minCGPA: number;
    branches: string[];
    batch: string;
    backlogs: boolean;
  };
  driveDate: string;
  applicationDeadline: string;
  rounds: string[];
  maxPositions: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  applicationsCount: number;
  selectedCount: number;
}

interface Student {
  _id: string;
  studentId: string;
  name: string;
  email: string;
  branch: string;
  cgpa: number;
  batch: string;
  skills: string[];
  placementStatus: 'eligible' | 'placed' | 'not-placed' | 'not-eligible';
  appliedDrives: string[];
  placedCompany?: string;
  package?: number;
}

interface PlacementStats {
  totalCompanies: number;
  activeDrives: number;
  totalApplications: number;
  placedStudents: number;
  eligibleStudents: number;
  placementRate: number;
  averagePackage: number;
  highestPackage: number;
}

const AdminPlacementManagement: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<PlacementStats>({
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
  const [activeTab, setActiveTab] = useState<'drives' | 'companies' | 'students' | 'analytics'>('drives');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled'>('all');
  const [filterBranch, setFilterBranch] = useState<'all' | 'CSE' | 'ECE' | 'ME' | 'CE'>('all');
  const [showAddDrive, setShowAddDrive] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState<PlacementDrive | null>(null);

  useEffect(() => {
    fetchPlacementData();
  }, []);

  const fetchPlacementData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      // Mock data for development
      const mockCompanies: Company[] = [
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

      const mockDrives: PlacementDrive[] = [
        {
          _id: '1',
          companyId: '1',
          companyName: 'TechCorp Solutions',
          jobTitle: 'Software Development Engineer',
          package: {
            ctc: 1200000,
            baseSalary: 1000000,
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
          applicationsCount: 45,
          selectedCount: 0
        },
        {
          _id: '2',
          companyId: '2',
          companyName: 'DataFlow Analytics',
          jobTitle: 'Data Analyst',
          package: {
            ctc: 800000,
            baseSalary: 650000,
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
          applicationsCount: 32,
          selectedCount: 2
        }
      ];

      const mockStudents: Student[] = [
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
        eligibleStudents: totalEligible,
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

  const updateDriveStatus = async (driveId: string, status: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      // Mock API call
      console.log('Updating drive status:', { driveId, status });
      
      setDrives(prev => 
        prev.map(drive => 
          drive._id === driveId ? { ...drive, status: status as any } : drive
        )
      );
    } catch (error) {
      console.error('Error updating drive status:', error);
    }
  };

  const deleteDrive = async (driveId: string) => {
    if (!window.confirm('Are you sure you want to delete this placement drive?')) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      // Mock API call
      console.log('Deleting drive:', driveId);
      
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

  const getStatusColor = (status: string) => {
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
    return colors[status as keyof typeof colors] || colors.upcoming;
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Placement Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage placement drives, companies, and student placements
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Companies</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCompanies}</p>
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
                <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Drives</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeDrives}</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Applications</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalApplications}</p>
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
                <GraduationCap className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Placed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.placedStudents}</p>
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
                <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Placement Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.placementRate.toFixed(1)}%</p>
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
                <Star className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Package</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{(stats.averagePackage / 100000).toFixed(1)}L</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Highest Package</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{(stats.highestPackage / 100000).toFixed(1)}L</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center">
              <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
                <Users className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Eligible</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.eligibleStudents}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 px-6">
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
            </nav>
          </div>

          {activeTab === 'drives' && (
            <div className="p-6">
              {/* Controls */}
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search drives, companies, or job titles..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <select
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
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
                    <Plus className="h-4 w-4" />
                    Add Drive
                  </button>
                </div>
              </div>

              {/* Drives Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredDrives.map((drive) => (
                  <motion.div
                    key={drive._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {drive.jobTitle}
                        </h3>
                        <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">
                          {drive.companyName}
                        </p>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(drive.status)}`}>
                            {drive.status.charAt(0).toUpperCase() + drive.status.slice(1)}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            ₹{(drive.package.ctc / 100000).toFixed(1)}L CTC
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedDrive(drive)}
                          className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-400 hover:text-green-600 dark:hover:text-green-400">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteDrive(drive._id)}
                          className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Drive Date:</span>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {new Date(drive.driveDate).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Deadline:</span>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {new Date(drive.applicationDeadline).toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Positions:</span>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {drive.maxPositions}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Applications:</span>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {drive.applicationsCount}
                          </div>
                        </div>
                      </div>

                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Eligibility:</span>
                        <div className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                          Min CGPA: {drive.eligibility.minCGPA} | 
                          Branches: {drive.eligibility.branches.join(', ')} | 
                          Backlogs: {drive.eligibility.backlogs ? 'Allowed' : 'Not Allowed'}
                        </div>
                      </div>

                      <div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Selection Rounds:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {drive.rounds.map((round, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/30 dark:text-blue-300"
                            >
                              {round}
                            </span>
                          ))}
                        </div>
                      </div>

                      {drive.status !== 'cancelled' && (
                        <div className="flex gap-2 pt-2">
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
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredDrives.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No placement drives found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'companies' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.map((company) => (
                  <motion.div
                    key={company._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {company.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {company.industry}
                        </p>
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{company.location}</span>
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(company.status)}`}>
                          {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {company.description}
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Contact:</span>
                        <div className="text-gray-600 dark:text-gray-400">
                          {company.contactPerson.name} ({company.contactPerson.email})
                        </div>
                      </div>
                      
                      {company.visitHistory.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">Last Visit:</span>
                          <div className="text-gray-600 dark:text-gray-400">
                            {new Date(company.visitHistory[0].date).toLocaleDateString()} - 
                            {company.visitHistory[0].selected}/{company.visitHistory[0].positions} selected
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {companies.length === 0 && (
                <div className="text-center py-12">
                  <Building className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No companies found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Add companies to manage placement drives.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'students' && (
            <div className="p-6">
              {/* Student Filters */}
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search students by name, ID, or email..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <select
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={filterBranch}
                    onChange={(e) => setFilterBranch(e.target.value as any)}
                  >
                    <option value="all">All Branches</option>
                    <option value="CSE">Computer Science</option>
                    <option value="ECE">Electronics</option>
                    <option value="ME">Mechanical</option>
                    <option value="CE">Civil</option>
                  </select>
                </div>
              </div>

              {/* Students Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Academic Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Skills
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Placement Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Applications
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredStudents.map((student) => (
                      <motion.tr
                        key={student._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{student.studentId}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{student.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{student.branch}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">CGPA: {student.cgpa}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Batch: {student.batch}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {student.skills.slice(0, 3).map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/30 dark:text-blue-300"
                              >
                                {skill}
                              </span>
                            ))}
                            {student.skills.length > 3 && (
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full dark:bg-gray-900/30 dark:text-gray-300">
                                +{student.skills.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(student.placementStatus)}`}>
                            {student.placementStatus.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          {student.placedCompany && (
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {student.placedCompany} - ₹{((student.package || 0) / 100000).toFixed(1)}L
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {student.appliedDrives.length} applications
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredStudents.length === 0 && (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No students found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="p-6">
              <div className="text-center py-12">
                <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Placement Analytics</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Detailed analytics and reporting features coming soon.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPlacementManagement;