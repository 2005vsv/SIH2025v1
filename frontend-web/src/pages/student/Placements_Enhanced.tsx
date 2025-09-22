import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign, 
  Users, 
  Building, 
  Send,
  Upload,
  Download,
  Eye,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Star,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  User,
  Mail,
  Phone,
  Award,
  GraduationCap,
  Target,
  TrendingUp,
  FileText,
  Link as LinkIcon,
  Heart,
  Bookmark,
  Share2,
  RefreshCw
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface Job {
  _id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  type: 'full-time' | 'part-time' | 'internship' | 'contract';
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  requirements: string[];
  skills: string[];
  experience: string;
  education: string;
  postedDate: string;
  deadline: string;
  status: 'active' | 'closed' | 'draft';
  applicationsCount: number;
  companyInfo: {
    industry: string;
    size: string;
    website?: string;
    description?: string;
  };
}

interface Application {
  _id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  appliedDate: string;
  status: 'pending' | 'under-review' | 'shortlisted' | 'interview-scheduled' | 'selected' | 'rejected';
  resumeVersion: string;
  coverLetter?: string;
  interviewDetails?: {
    date: string;
    time: string;
    mode: 'online' | 'offline';
    location?: string;
    interviewers?: string[];
    instructions?: string;
  };
  feedback?: string;
}

interface Resume {
  _id: string;
  name: string;
  version: string;
  uploadDate: string;
  fileUrl: string;
  isDefault: boolean;
  downloadCount: number;
}

interface Interview {
  _id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  date: string;
  time: string;
  mode: 'online' | 'offline';
  location?: string;
  meetingLink?: string;
  interviewers: string[];
  round: number;
  instructions?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  feedback?: string;
  result?: 'selected' | 'rejected' | 'next-round';
}

const StudentPlacements: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'jobs' | 'applications' | 'resumes' | 'interviews'>('jobs');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [showJobModal, setShowJobModal] = useState<Job | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState<Job | null>(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    fetchPlacementData();
    loadFavorites();
  }, []);

  const fetchPlacementData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      setJobs([
        {
          _id: '1',
          title: 'Software Engineer',
          company: 'TechCorp Inc.',
          location: 'Bangalore, India',
          type: 'full-time',
          salary: { min: 800000, max: 1200000, currency: 'INR' },
          description: 'We are looking for a talented Software Engineer to join our dynamic team...',
          requirements: ['Bachelor\'s in Computer Science', '2+ years experience', 'Strong problem-solving skills'],
          skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'AWS'],
          experience: '2-4 years',
          education: 'Bachelor\'s degree in Computer Science or related field',
          postedDate: '2024-01-15',
          deadline: '2024-02-15',
          status: 'active',
          applicationsCount: 45,
          companyInfo: {
            industry: 'Technology',
            size: '500-1000 employees',
            website: 'https://techcorp.com',
            description: 'Leading technology company specializing in web solutions'
          }
        },
        {
          _id: '2',
          title: 'Data Scientist',
          company: 'DataFlow Analytics',
          location: 'Mumbai, India',
          type: 'full-time',
          salary: { min: 1000000, max: 1500000, currency: 'INR' },
          description: 'Join our data science team to work on cutting-edge AI/ML projects...',
          requirements: ['Master\'s in Data Science/Statistics', 'Python expertise', 'Machine Learning experience'],
          skills: ['Python', 'TensorFlow', 'Pandas', 'SQL', 'Tableau'],
          experience: '3-5 years',
          education: 'Master\'s degree in Data Science, Statistics, or related field',
          postedDate: '2024-01-20',
          deadline: '2024-02-20',
          status: 'active',
          applicationsCount: 32,
          companyInfo: {
            industry: 'Analytics',
            size: '100-500 employees',
            website: 'https://dataflow.com'
          }
        },
        {
          _id: '3',
          title: 'Frontend Developer Intern',
          company: 'StartupXYZ',
          location: 'Remote',
          type: 'internship',
          salary: { min: 25000, max: 40000, currency: 'INR' },
          description: 'Exciting internship opportunity for frontend development...',
          requirements: ['Currently pursuing Computer Science degree', 'React knowledge', 'Portfolio of projects'],
          skills: ['React', 'JavaScript', 'CSS', 'Git'],
          experience: '0-1 years',
          education: 'Currently pursuing Bachelor\'s degree',
          postedDate: '2024-01-25',
          deadline: '2024-02-25',
          status: 'active',
          applicationsCount: 78,
          companyInfo: {
            industry: 'Technology',
            size: '10-50 employees'
          }
        }
      ]);

      setApplications([
        {
          _id: '1',
          jobId: '1',
          jobTitle: 'Software Engineer',
          company: 'TechCorp Inc.',
          appliedDate: '2024-01-16',
          status: 'interview-scheduled',
          resumeVersion: 'Resume_v2.pdf',
          interviewDetails: {
            date: '2024-02-05',
            time: '10:00 AM',
            mode: 'online',
            interviewers: ['John Smith - Tech Lead', 'Sarah Johnson - HR Manager'],
            instructions: 'Please join the meeting 5 minutes early. Have your ID ready.'
          }
        },
        {
          _id: '2',
          jobId: '2',
          jobTitle: 'Data Scientist',
          company: 'DataFlow Analytics',
          appliedDate: '2024-01-22',
          status: 'under-review',
          resumeVersion: 'Resume_v2.pdf'
        },
        {
          _id: '3',
          jobId: '3',
          jobTitle: 'Frontend Developer Intern',
          company: 'StartupXYZ',
          appliedDate: '2024-01-26',
          status: 'pending',
          resumeVersion: 'Resume_v1.pdf'
        }
      ]);

      setResumes([
        {
          _id: '1',
          name: 'Software Engineer Resume',
          version: 'v2.0',
          uploadDate: '2024-01-15',
          fileUrl: '/resumes/resume_v2.pdf',
          isDefault: true,
          downloadCount: 12
        },
        {
          _id: '2',
          name: 'Data Science Resume',
          version: 'v1.5',
          uploadDate: '2024-01-10',
          fileUrl: '/resumes/resume_ds_v1.pdf',
          isDefault: false,
          downloadCount: 8
        }
      ]);

      setInterviews([
        {
          _id: '1',
          jobId: '1',
          jobTitle: 'Software Engineer',
          company: 'TechCorp Inc.',
          date: '2024-02-05',
          time: '10:00 AM',
          mode: 'online',
          meetingLink: 'https://meet.google.com/xyz-abc-def',
          interviewers: ['John Smith', 'Sarah Johnson'],
          round: 1,
          instructions: 'Technical round focusing on coding and system design',
          status: 'scheduled'
        }
      ]);

    } catch (error) {
      console.error('Error fetching placement data:', error);
      toast.error('Failed to load placement data');
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = () => {
    const savedFavorites = localStorage.getItem('jobFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  };

  const toggleFavorite = (jobId: string) => {
    const newFavorites = favorites.includes(jobId) 
      ? favorites.filter(id => id !== jobId)
      : [...favorites, jobId];
    
    setFavorites(newFavorites);
    localStorage.setItem('jobFavorites', JSON.stringify(newFavorites));
    toast.success(favorites.includes(jobId) ? 'Removed from favorites' : 'Added to favorites');
  };

  const applyToJob = async (jobId: string, resumeId: string, coverLetter?: string) => {
    try {
      // Mock API call
      const newApplication: Application = {
        _id: Date.now().toString(),
        jobId,
        jobTitle: jobs.find(j => j._id === jobId)?.title || '',
        company: jobs.find(j => j._id === jobId)?.company || '',
        appliedDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        resumeVersion: resumes.find(r => r._id === resumeId)?.name || '',
        coverLetter
      };
      
      setApplications(prev => [newApplication, ...prev]);
      setShowApplicationModal(null);
      toast.success('Application submitted successfully!');
    } catch (error) {
      console.error('Error applying to job:', error);
      toast.error('Failed to submit application');
    }
  };

  const uploadResume = async (file: File, name: string) => {
    try {
      // Mock API call
      const newResume: Resume = {
        _id: Date.now().toString(),
        name,
        version: 'v1.0',
        uploadDate: new Date().toISOString().split('T')[0],
        fileUrl: URL.createObjectURL(file),
        isDefault: resumes.length === 0,
        downloadCount: 0
      };
      
      setResumes(prev => [newResume, ...prev]);
      setShowResumeModal(false);
      toast.success('Resume uploaded successfully!');
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast.error('Failed to upload resume');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'selected': case 'active': case 'scheduled':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': case 'under-review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'interview-scheduled': case 'shortlisted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rejected': case 'closed': case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'selected': case 'scheduled':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending': case 'under-review':
        return <Clock className="w-4 h-4" />;
      case 'interview-scheduled': case 'shortlisted':
        return <Calendar className="w-4 h-4" />;
      case 'rejected': case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'completed':
        return <Award className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLocation = selectedLocation === 'all' || job.location.toLowerCase().includes(selectedLocation.toLowerCase());
    const matchesType = selectedType === 'all' || job.type === selectedType;
    const matchesCompany = selectedCompany === 'all' || job.company === selectedCompany;
    return matchesSearch && matchesLocation && matchesType && matchesCompany;
  });

  const locations = ['all', ...Array.from(new Set(jobs.map(job => job.location)))];
  const jobTypes = ['all', 'full-time', 'part-time', 'internship', 'contract'];
  const companies = ['all', ...Array.from(new Set(jobs.map(job => job.company)))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Placement Portal</h1>
          <p className="text-gray-600">Explore job opportunities, manage applications, and track your career journey</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Briefcase className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{jobs.filter(j => j.status === 'active').length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <Send className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Applications</p>
                <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Interviews</p>
                <p className="text-2xl font-bold text-gray-900">{interviews.filter(i => i.status === 'scheduled').length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <FileText className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resumes</p>
                <p className="text-2xl font-bold text-gray-900">{resumes.length}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('jobs')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'jobs'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Job Opportunities
              </button>
              <button
                onClick={() => setActiveTab('applications')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'applications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Applications
              </button>
              <button
                onClick={() => setActiveTab('resumes')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'resumes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Resume Management
              </button>
              <button
                onClick={() => setActiveTab('interviews')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'interviews'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Interview Schedule
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'jobs' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search jobs, companies, skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex space-x-3">
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {locations.map(location => (
                      <option key={location} value={location}>
                        {location === 'all' ? 'All Locations' : location}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {jobTypes.map(type => (
                      <option key={type} value={type}>
                        {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {companies.map(company => (
                      <option key={company} value={company}>
                        {company === 'all' ? 'All Companies' : company}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Jobs Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                        <Building className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                        <p className="text-gray-600">{job.company}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleFavorite(job._id)}
                        className={`p-2 rounded-full ${favorites.includes(job._id) ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                      >
                        <Heart className={`w-5 h-5 ${favorites.includes(job._id) ? 'fill-current' : ''}`} />
                      </button>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(job.type)}`}>
                        {job.type.replace('-', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2" />
                      <span>₹{(job.salary.min / 100000).toFixed(1)}L - ₹{(job.salary.max / 100000).toFixed(1)}L per annum</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Apply by {new Date(job.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{job.applicationsCount} applications</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
                  </div>

                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {job.skills.slice(0, 4).map((skill, idx) => (
                        <span 
                          key={idx}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 4 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                          +{job.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowJobModal(job)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Eye className="w-4 h-4 mr-2 inline" />
                      View Details
                    </button>
                    <button
                      onClick={() => setShowApplicationModal(job)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Send className="w-4 h-4 mr-2 inline" />
                      Apply Now
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredJobs.length === 0 && (
              <div className="text-center py-12">
                <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No jobs found matching your criteria</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'applications' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              {applications.map((application, index) => (
                <motion.div
                  key={application._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{application.jobTitle}</h3>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(application.status)}`}>
                          {getStatusIcon(application.status)}
                          <span className="ml-1 capitalize">{application.status.replace('-', ' ')}</span>
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{application.company}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Applied Date:</span>
                          <span className="ml-2">{new Date(application.appliedDate).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="font-medium">Resume:</span>
                          <span className="ml-2">{application.resumeVersion}</span>
                        </div>
                      </div>
                      {application.interviewDetails && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">Interview Scheduled</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-blue-800">
                            <div>Date: {new Date(application.interviewDetails.date).toLocaleDateString()}</div>
                            <div>Time: {application.interviewDetails.time}</div>
                            <div>Mode: {application.interviewDetails.mode}</div>
                            <div>Interviewers: {application.interviewDetails.interviewers?.join(', ')}</div>
                          </div>
                          {application.interviewDetails.instructions && (
                            <p className="text-sm text-blue-700 mt-2">
                              <strong>Instructions:</strong> {application.interviewDetails.instructions}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {applications.length === 0 && (
              <div className="text-center py-12">
                <Send className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No applications submitted yet</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'resumes' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Resume Management</h2>
              <button
                onClick={() => setShowResumeModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="w-4 h-4 mr-2 inline" />
                Upload Resume
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.map((resume, index) => (
                <motion.div
                  key={resume._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-lg bg-blue-100">
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    {resume.isDefault && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Default
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{resume.name}</h3>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div>Version: {resume.version}</div>
                    <div>Uploaded: {new Date(resume.uploadDate).toLocaleDateString()}</div>
                    <div>Downloads: {resume.downloadCount}</div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => toast.success('Resume downloaded!')}
                      className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Download className="w-4 h-4 mr-1 inline" />
                      Download
                    </button>
                    <button
                      onClick={() => toast.success('Set as default!')}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Star className="w-4 h-4 mr-1 inline" />
                      Set Default
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {resumes.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No resumes uploaded yet</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'interviews' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="space-y-4">
              {interviews.map((interview, index) => (
                <motion.div
                  key={interview._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{interview.jobTitle}</h3>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(interview.status)}`}>
                          {getStatusIcon(interview.status)}
                          <span className="ml-1 capitalize">{interview.status}</span>
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{interview.company} - Round {interview.round}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                        <div>
                          <span className="font-medium">Date:</span>
                          <span className="ml-2">{new Date(interview.date).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="font-medium">Time:</span>
                          <span className="ml-2">{interview.time}</span>
                        </div>
                        <div>
                          <span className="font-medium">Mode:</span>
                          <span className="ml-2 capitalize">{interview.mode}</span>
                        </div>
                      </div>
                      {interview.instructions && (
                        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            <strong>Instructions:</strong> {interview.instructions}
                          </p>
                        </div>
                      )}
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Interviewers:</span>
                        <span className="ml-2">{interview.interviewers.join(', ')}</span>
                      </div>
                    </div>
                    <div className="mt-4 lg:mt-0 lg:ml-6">
                      {interview.status === 'scheduled' && interview.meetingLink && (
                        <button
                          onClick={() => window.open(interview.meetingLink, '_blank')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <ExternalLink className="w-4 h-4 mr-2 inline" />
                          Join Meeting
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {interviews.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No interviews scheduled</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Job Details Modal */}
      <AnimatePresence>
        {showJobModal && (
          <JobDetailsModal
            job={showJobModal}
            onClose={() => setShowJobModal(null)}
            onApply={() => {
              setShowApplicationModal(showJobModal);
              setShowJobModal(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Application Modal */}
      <AnimatePresence>
        {showApplicationModal && (
          <ApplicationModal
            job={showApplicationModal}
            resumes={resumes}
            onClose={() => setShowApplicationModal(null)}
            onSubmit={applyToJob}
          />
        )}
      </AnimatePresence>

      {/* Resume Upload Modal */}
      <AnimatePresence>
        {showResumeModal && (
          <ResumeUploadModal
            onClose={() => setShowResumeModal(false)}
            onUpload={uploadResume}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Job Details Modal Component
const JobDetailsModal: React.FC<{
  job: Job;
  onClose: () => void;
  onApply: () => void;
}> = ({ job, onClose, onApply }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Description</h3>
                <p className="text-gray-600">{job.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Requirements</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  {job.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {job.companyInfo.description && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">About Company</h3>
                  <p className="text-gray-600">{job.companyInfo.description}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">Company</h4>
                <p className="text-gray-600">{job.company}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">Location</h4>
                <p className="text-gray-600">{job.location}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">Job Type</h4>
                <p className="text-gray-600 capitalize">{job.type.replace('-', ' ')}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">Salary</h4>
                <p className="text-gray-600">₹{(job.salary.min / 100000).toFixed(1)}L - ₹{(job.salary.max / 100000).toFixed(1)}L</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">Experience</h4>
                <p className="text-gray-600">{job.experience}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">Education</h4>
                <p className="text-gray-600">{job.education}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">Industry</h4>
                <p className="text-gray-600">{job.companyInfo.industry}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">Company Size</h4>
                <p className="text-gray-600">{job.companyInfo.size}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">Applications</h4>
                <p className="text-gray-600">{job.applicationsCount} applied</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">Deadline</h4>
                <p className="text-gray-600">{new Date(job.deadline).toLocaleDateString()}</p>
              </div>

              {job.companyInfo.website && (
                <div>
                  <h4 className="font-medium text-gray-900">Website</h4>
                  <a 
                    href={job.companyInfo.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <LinkIcon className="w-4 h-4 mr-1" />
                    Visit Website
                  </a>
                </div>
              )}
            </div>

            <button
              onClick={onApply}
              className="w-full mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Send className="w-4 h-4 mr-2 inline" />
              Apply for this Job
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Application Modal Component
const ApplicationModal: React.FC<{
  job: Job;
  resumes: Resume[];
  onClose: () => void;
  onSubmit: (jobId: string, resumeId: string, coverLetter?: string) => void;
}> = ({ job, resumes, onClose, onSubmit }) => {
  const [selectedResume, setSelectedResume] = useState<string>('');
  const [coverLetter, setCoverLetter] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResume) {
      toast.error('Please select a resume');
      return;
    }
    onSubmit(job._id, selectedResume, coverLetter);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Apply for {job.title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900">{job.title}</h4>
          <p className="text-gray-600">{job.company}</p>
          <p className="text-sm text-gray-500">{job.location}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Resume *
            </label>
            <select
              value={selectedResume}
              onChange={(e) => setSelectedResume(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Choose a resume</option>
              {resumes.map(resume => (
                <option key={resume._id} value={resume._id}>
                  {resume.name} ({resume.version}) {resume.isDefault ? '- Default' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Letter (Optional)
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Write a brief cover letter explaining why you're interested in this position..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Submit Application
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Resume Upload Modal Component
const ResumeUploadModal: React.FC<{
  onClose: () => void;
  onUpload: (file: File, name: string) => void;
}> = ({ onClose, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resumeName, setResumeName] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      if (!resumeName) {
        setResumeName(e.target.files[0].name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !resumeName) {
      toast.error('Please select a file and provide a name');
      return;
    }
    onUpload(selectedFile, resumeName);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Upload Resume</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resume Name *
            </label>
            <input
              type="text"
              value={resumeName}
              onChange={(e) => setResumeName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Software Engineer Resume"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload File *
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              accept=".pdf,.doc,.docx"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Accepted formats: PDF, DOC, DOCX (Max 5MB)
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Upload Resume
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default StudentPlacements;