import { 
  Award, 
  Download, 
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Calendar,
  FileText,
  Shield,
  Star,
  Send,
  Plus,
  User,
  GraduationCap,
  Trophy,
  Target,
  BookOpen,
  Briefcase,
  Users,
  Link as LinkIcon,
  Share2,
  Copy,
  Mail,
  Phone,
  MapPin,
  Building,
  Globe,
  Hash,
  RefreshCw,
  Printer,
  ExternalLink
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface Certificate {
  _id: string;
  title: string;
  type: 'academic' | 'achievement' | 'participation' | 'completion' | 'skill' | 'internship' | 'project';
  description: string;
  issueDate: string;
  issuer: string;
  category: string;
  grade?: string;
  duration?: string;
  skills?: string[];
  fileUrl?: string;
  certificateNumber: string;
  verificationCode: string;
  status: 'issued' | 'verified' | 'revoked' | 'pending';
  isDigital: boolean;
  credentialData?: {
    gpa?: number;
    credits?: number;
    courseCode?: string;
    instructor?: string;
    institution?: string;
    level?: string;
  };
  metadata?: {
    downloadCount: number;
    sharedCount: number;
    verificationCount: number;
  };
}

interface CertificateRequest {
  _id: string;
  certificateType: string;
  purpose: string;
  urgency: 'low' | 'medium' | 'high';
  requestDate: string;
  expectedDate?: string;
  status: 'pending' | 'processing' | 'ready' | 'issued' | 'rejected';
  documents?: string[];
  fees?: number;
  notes?: string;
  adminComments?: string;
}

interface VerificationResult {
  _id: string;
  certificateNumber: string;
  verificationCode: string;
  isValid: boolean;
  holderName: string;
  issueDate: string;
  title: string;
  issuer: string;
  details?: any;
  verifiedAt: string;
}

const StudentCertificates: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [requests, setRequests] = useState<CertificateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'certificates' | 'requests' | 'verify'>('certificates');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCertificateModal, setShowCertificateModal] = useState<Certificate | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  useEffect(() => {
    fetchCertificateData();
  }, []);

  const fetchCertificateData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      setCertificates([
        {
          _id: '1',
          title: 'Bachelor of Technology in Computer Science',
          type: 'academic',
          description: 'Degree certificate for completion of B.Tech in Computer Science and Engineering',
          issueDate: '2024-06-15',
          issuer: 'ABC University',
          category: 'Degree',
          grade: 'First Class with Distinction',
          duration: '4 years',
          certificateNumber: 'ABCUNI2024CS001',
          verificationCode: 'VF7K9M2P',
          status: 'issued',
          isDigital: true,
          credentialData: {
            gpa: 8.5,
            credits: 160,
            institution: 'ABC University',
            level: 'Undergraduate'
          },
          metadata: {
            downloadCount: 12,
            sharedCount: 5,
            verificationCount: 8
          }
        },
        {
          _id: '2',
          title: 'Best Project Award 2024',
          type: 'achievement',
          description: 'Recognition for outstanding performance in final year project on AI/ML',
          issueDate: '2024-05-20',
          issuer: 'Computer Science Department',
          category: 'Excellence Award',
          certificateNumber: 'CSE2024AWD002',
          verificationCode: 'KL4N7P9R',
          status: 'verified',
          isDigital: true,
          skills: ['Artificial Intelligence', 'Machine Learning', 'Python', 'Research'],
          metadata: {
            downloadCount: 8,
            sharedCount: 12,
            verificationCount: 15
          }
        },
        {
          _id: '3',
          title: 'Web Development Internship Completion',
          type: 'internship',
          description: 'Successfully completed 3-month internship program at TechCorp Solutions',
          issueDate: '2024-03-30',
          issuer: 'TechCorp Solutions',
          category: 'Internship',
          duration: '3 months',
          certificateNumber: 'TECH2024INT003',
          verificationCode: 'RT8Y3M5Q',
          status: 'issued',
          isDigital: true,
          skills: ['React', 'Node.js', 'MongoDB', 'Express.js'],
          credentialData: {
            instructor: 'John Smith - Senior Developer',
            institution: 'TechCorp Solutions'
          },
          metadata: {
            downloadCount: 6,
            sharedCount: 3,
            verificationCount: 4
          }
        },
        {
          _id: '4',
          title: 'Hackathon Participation Certificate',
          type: 'participation',
          description: 'Participated in National Coding Hackathon 2024 and secured 3rd position',
          issueDate: '2024-02-15',
          issuer: 'National Coding Federation',
          category: 'Competition',
          certificateNumber: 'NCF2024HAC004',
          verificationCode: 'MP6Q8K2L',
          status: 'issued',
          isDigital: true,
          skills: ['Problem Solving', 'Team Collaboration', 'Full Stack Development'],
          metadata: {
            downloadCount: 4,
            sharedCount: 8,
            verificationCount: 6
          }
        },
        {
          _id: '5',
          title: 'Cloud Computing Certification',
          type: 'skill',
          description: 'AWS Certified Solutions Architect Associate certification',
          issueDate: '2024-01-10',
          issuer: 'Amazon Web Services',
          category: 'Professional Certification',
          certificateNumber: 'AWS2024SAA005',
          verificationCode: 'BC3X7N9V',
          status: 'verified',
          isDigital: true,
          skills: ['AWS', 'Cloud Architecture', 'DevOps', 'Infrastructure'],
          credentialData: {
            level: 'Associate'
          },
          metadata: {
            downloadCount: 15,
            sharedCount: 10,
            verificationCount: 25
          }
        }
      ]);

      setRequests([
        {
          _id: '1',
          certificateType: 'Transcript',
          purpose: 'Job Application',
          urgency: 'high',
          requestDate: '2024-01-25',
          expectedDate: '2024-02-05',
          status: 'processing',
          fees: 500,
          notes: 'Required for software engineer position application'
        },
        {
          _id: '2',
          certificateType: 'Character Certificate',
          purpose: 'Higher Studies',
          urgency: 'medium',
          requestDate: '2024-01-20',
          status: 'ready',
          fees: 200,
          notes: 'Needed for graduate school application'
        },
        {
          _id: '3',
          certificateType: 'Provisional Certificate',
          purpose: 'Verification',
          urgency: 'low',
          requestDate: '2024-01-15',
          status: 'pending',
          fees: 300,
          notes: 'For background verification process'
        }
      ]);

    } catch (error) {
      console.error('Error fetching certificate data:', error);
      toast.error('Failed to load certificate data');
    } finally {
      setLoading(false);
    }
  };

  const requestCertificate = async (requestData: Omit<CertificateRequest, '_id' | 'requestDate' | 'status'>) => {
    try {
      const newRequest: CertificateRequest = {
        _id: Date.now().toString(),
        ...requestData,
        requestDate: new Date().toISOString().split('T')[0],
        status: 'pending'
      };
      
      setRequests(prev => [newRequest, ...prev]);
      setShowRequestModal(false);
      toast.success('Certificate request submitted successfully!');
    } catch (error) {
      console.error('Error requesting certificate:', error);
      toast.error('Failed to submit certificate request');
    }
  };

  const verifyCertificate = async (code: string) => {
    try {
      setVerifyLoading(true);
      
      // Mock verification API call
      // In real implementation, this would call your verification API
      const mockResult: VerificationResult = {
        _id: '1',
        certificateNumber: 'ABCUNI2024CS001',
        verificationCode: code.toUpperCase(),
        isValid: code.toUpperCase() === 'VF7K9M2P',
        holderName: 'John Doe',
        issueDate: '2024-06-15',
        title: 'Bachelor of Technology in Computer Science',
        issuer: 'ABC University',
        verifiedAt: new Date().toISOString()
      };
      
      setVerificationResult(mockResult);
      
      if (mockResult.isValid) {
        toast.success('Certificate verified successfully!');
      } else {
        toast.error('Invalid verification code');
      }
    } catch (error) {
      console.error('Error verifying certificate:', error);
      toast.error('Failed to verify certificate');
    } finally {
      setVerifyLoading(false);
    }
  };

  const downloadCertificate = async (certificate: Certificate) => {
    try {
      // Mock download functionality
      // In real implementation, this would download the actual certificate file
      toast.success(`Downloaded ${certificate.title}`);
      
      // Update download count
      setCertificates(prev => prev.map(cert => 
        cert._id === certificate._id 
          ? { ...cert, metadata: { ...cert.metadata!, downloadCount: cert.metadata!.downloadCount + 1 }}
          : cert
      ));
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.error('Failed to download certificate');
    }
  };

  const shareCertificate = async (certificate: Certificate) => {
    try {
      const shareUrl = `${window.location.origin}/verify/${certificate.verificationCode}`;
      
      if (navigator.share) {
        await navigator.share({
          title: certificate.title,
          text: `Verify my certificate: ${certificate.title}`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Share link copied to clipboard!');
      }
      
      // Update share count
      setCertificates(prev => prev.map(cert => 
        cert._id === certificate._id 
          ? { ...cert, metadata: { ...cert.metadata!, sharedCount: cert.metadata!.sharedCount + 1 }}
          : cert
      ));
    } catch (error) {
      console.error('Error sharing certificate:', error);
      toast.error('Failed to share certificate');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'issued': case 'verified': case 'ready':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': case 'revoked':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'issued': case 'verified': case 'ready':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending': case 'processing':
        return <Clock className="w-4 h-4" />;
      case 'rejected': case 'revoked':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'academic':
        return <GraduationCap className="w-5 h-5" />;
      case 'achievement':
        return <Trophy className="w-5 h-5" />;
      case 'skill':
        return <Target className="w-5 h-5" />;
      case 'internship':
        return <Briefcase className="w-5 h-5" />;
      case 'participation':
        return <Users className="w-5 h-5" />;
      case 'completion':
        return <BookOpen className="w-5 h-5" />;
      case 'project':
        return <FileText className="w-5 h-5" />;
      default:
        return <Award className="w-5 h-5" />;
    }
  };

  const filteredCertificates = certificates.filter(cert => {
    const matchesSearch = cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.issuer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cert.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || cert.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || cert.category === selectedCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const certificateTypes = ['all', ...Array.from(new Set(certificates.map(cert => cert.type)))];
  const categories = ['all', ...Array.from(new Set(certificates.map(cert => cert.category)))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Certificates</h1>
          <p className="text-gray-600">Manage your digital certificates, request new ones, and verify authenticity</p>
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
              <div className="p-3 rounded-full bg-purple-100">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Certificates</p>
                <p className="text-2xl font-bold text-gray-900">{certificates.length}</p>
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
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-gray-900">{certificates.filter(c => c.status === 'verified').length}</p>
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
              <div className="p-3 rounded-full bg-blue-100">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900">{requests.filter(r => r.status === 'pending').length}</p>
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
                <Shield className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Verifications</p>
                <p className="text-2xl font-bold text-gray-900">{certificates.reduce((sum, cert) => sum + (cert.metadata?.verificationCount || 0), 0)}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('certificates')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'certificates'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Certificates
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'requests'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Certificate Requests
              </button>
              <button
                onClick={() => setActiveTab('verify')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'verify'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Verify Certificate
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'certificates' && (
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
                    placeholder="Search certificates, issuers, categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div className="flex space-x-3">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    {certificateTypes.map(type => (
                      <option key={type} value={type}>
                        {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Certificates Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredCertificates.map((certificate, index) => (
                <motion.div
                  key={certificate._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100">
                        {getTypeIcon(certificate.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{certificate.title}</h3>
                        <p className="text-gray-600">{certificate.issuer}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(certificate.status)}`}>
                      {getStatusIcon(certificate.status)}
                      <span className="ml-1 capitalize">{certificate.status}</span>
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>Issued: {new Date(certificate.issueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Hash className="w-4 h-4 mr-2" />
                      <span>Certificate #: {certificate.certificateNumber}</span>
                    </div>
                    {certificate.grade && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Star className="w-4 h-4 mr-2" />
                        <span>Grade: {certificate.grade}</span>
                      </div>
                    )}
                    {certificate.duration && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>Duration: {certificate.duration}</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 line-clamp-2">{certificate.description}</p>
                  </div>

                  {certificate.skills && certificate.skills.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {certificate.skills.slice(0, 3).map((skill, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {certificate.skills.length > 3 && (
                          <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                            +{certificate.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {certificate.metadata && (
                    <div className="mb-4 grid grid-cols-3 gap-4 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                      <div className="text-center">
                        <p className="font-medium">{certificate.metadata.downloadCount}</p>
                        <p>Downloads</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{certificate.metadata.sharedCount}</p>
                        <p>Shared</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{certificate.metadata.verificationCount}</p>
                        <p>Verified</p>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowCertificateModal(certificate)}
                      className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      <Eye className="w-4 h-4 mr-1 inline" />
                      View
                    </button>
                    <button
                      onClick={() => downloadCertificate(certificate)}
                      className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      <Download className="w-4 h-4 mr-1 inline" />
                      Download
                    </button>
                    <button
                      onClick={() => shareCertificate(certificate)}
                      className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {filteredCertificates.length === 0 && (
              <div className="text-center py-12">
                <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No certificates found matching your criteria</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'requests' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Certificate Requests</h2>
              <button
                onClick={() => setShowRequestModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <Plus className="w-4 h-4 mr-2 inline" />
                New Request
              </button>
            </div>

            <div className="space-y-4">
              {requests.map((request, index) => (
                <motion.div
                  key={request._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{request.certificateType}</h3>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1 capitalize">{request.status}</span>
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          request.urgency === 'high' ? 'bg-red-100 text-red-800' :
                          request.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {request.urgency.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">Purpose: {request.purpose}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Request Date:</span>
                          <span className="ml-2">{new Date(request.requestDate).toLocaleDateString()}</span>
                        </div>
                        {request.expectedDate && (
                          <div>
                            <span className="font-medium">Expected:</span>
                            <span className="ml-2">{new Date(request.expectedDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {request.fees && (
                          <div>
                            <span className="font-medium">Fees:</span>
                            <span className="ml-2">₹{request.fees}</span>
                          </div>
                        )}
                      </div>
                      {request.notes && (
                        <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>Notes:</strong> {request.notes}
                          </p>
                        </div>
                      )}
                      {request.adminComments && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Admin Comments:</strong> {request.adminComments}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {requests.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No certificate requests submitted yet</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'verify' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
              <div className="text-center mb-8">
                <div className="p-4 rounded-full bg-purple-100 w-16 h-16 mx-auto mb-4">
                  <Shield className="w-8 h-8 text-purple-600 mx-auto" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Certificate</h2>
                <p className="text-gray-600">Enter the verification code to validate certificate authenticity</p>
              </div>

              <div className="max-w-md mx-auto">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter verification code (e.g., VF7K9M2P)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-center font-mono text-lg"
                  />
                </div>

                <button
                  onClick={() => verifyCertificate(verificationCode)}
                  disabled={!verificationCode || verifyLoading}
                  className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {verifyLoading ? (
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    <>
                      <Shield className="w-5 h-5 mr-2 inline" />
                      Verify Certificate
                    </>
                  )}
                </button>
              </div>

              {verificationResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 max-w-2xl mx-auto"
                >
                  <div className={`p-6 rounded-xl border-2 ${
                    verificationResult.isValid 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center space-x-3 mb-4">
                      {verificationResult.isValid ? (
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      ) : (
                        <XCircle className="w-8 h-8 text-red-600" />
                      )}
                      <div>
                        <h3 className={`text-lg font-semibold ${
                          verificationResult.isValid ? 'text-green-900' : 'text-red-900'
                        }`}>
                          {verificationResult.isValid ? 'Certificate Verified' : 'Verification Failed'}
                        </h3>
                        <p className={`text-sm ${
                          verificationResult.isValid ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {verificationResult.isValid 
                            ? 'This certificate is authentic and valid'
                            : 'Invalid verification code or certificate not found'
                          }
                        </p>
                      </div>
                    </div>

                    {verificationResult.isValid && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-green-900">Certificate Title:</span>
                          <p className="text-green-800">{verificationResult.title}</p>
                        </div>
                        <div>
                          <span className="font-medium text-green-900">Holder Name:</span>
                          <p className="text-green-800">{verificationResult.holderName}</p>
                        </div>
                        <div>
                          <span className="font-medium text-green-900">Issuer:</span>
                          <p className="text-green-800">{verificationResult.issuer}</p>
                        </div>
                        <div>
                          <span className="font-medium text-green-900">Issue Date:</span>
                          <p className="text-green-800">{new Date(verificationResult.issueDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="font-medium text-green-900">Certificate Number:</span>
                          <p className="text-green-800">{verificationResult.certificateNumber}</p>
                        </div>
                        <div>
                          <span className="font-medium text-green-900">Verified At:</span>
                          <p className="text-green-800">{new Date(verificationResult.verifiedAt).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Certificate Details Modal */}
      <AnimatePresence>
        {showCertificateModal && (
          <CertificateDetailsModal
            certificate={showCertificateModal}
            onClose={() => setShowCertificateModal(null)}
            onDownload={downloadCertificate}
            onShare={shareCertificate}
          />
        )}
      </AnimatePresence>

      {/* Request Modal */}
      <AnimatePresence>
        {showRequestModal && (
          <RequestModal
            onClose={() => setShowRequestModal(false)}
            onSubmit={requestCertificate}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Certificate Details Modal Component
const CertificateDetailsModal: React.FC<{
  certificate: Certificate;
  onClose: () => void;
  onDownload: (certificate: Certificate) => void;
  onShare: (certificate: Certificate) => void;
}> = ({ certificate, onClose, onDownload, onShare }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{certificate.title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Certificate Information</h3>
                <p className="text-gray-600">{certificate.description}</p>
              </div>

              {certificate.credentialData && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Credential Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {certificate.credentialData.gpa && (
                      <div>
                        <span className="font-medium text-gray-700">GPA:</span>
                        <span className="ml-2 text-gray-600">{certificate.credentialData.gpa}</span>
                      </div>
                    )}
                    {certificate.credentialData.credits && (
                      <div>
                        <span className="font-medium text-gray-700">Credits:</span>
                        <span className="ml-2 text-gray-600">{certificate.credentialData.credits}</span>
                      </div>
                    )}
                    {certificate.credentialData.courseCode && (
                      <div>
                        <span className="font-medium text-gray-700">Course Code:</span>
                        <span className="ml-2 text-gray-600">{certificate.credentialData.courseCode}</span>
                      </div>
                    )}
                    {certificate.credentialData.instructor && (
                      <div>
                        <span className="font-medium text-gray-700">Instructor:</span>
                        <span className="ml-2 text-gray-600">{certificate.credentialData.instructor}</span>
                      </div>
                    )}
                    {certificate.credentialData.institution && (
                      <div>
                        <span className="font-medium text-gray-700">Institution:</span>
                        <span className="ml-2 text-gray-600">{certificate.credentialData.institution}</span>
                      </div>
                    )}
                    {certificate.credentialData.level && (
                      <div>
                        <span className="font-medium text-gray-700">Level:</span>
                        <span className="ml-2 text-gray-600">{certificate.credentialData.level}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {certificate.skills && certificate.skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Skills & Competencies</h3>
                  <div className="flex flex-wrap gap-2">
                    {certificate.skills.map((skill, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">Issuer</h4>
                <p className="text-gray-600">{certificate.issuer}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">Category</h4>
                <p className="text-gray-600">{certificate.category}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">Type</h4>
                <p className="text-gray-600 capitalize">{certificate.type}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">Issue Date</h4>
                <p className="text-gray-600">{new Date(certificate.issueDate).toLocaleDateString()}</p>
              </div>
              
              {certificate.duration && (
                <div>
                  <h4 className="font-medium text-gray-900">Duration</h4>
                  <p className="text-gray-600">{certificate.duration}</p>
                </div>
              )}
              
              {certificate.grade && (
                <div>
                  <h4 className="font-medium text-gray-900">Grade</h4>
                  <p className="text-gray-600">{certificate.grade}</p>
                </div>
              )}
              
              <div>
                <h4 className="font-medium text-gray-900">Certificate Number</h4>
                <p className="text-gray-600 font-mono text-sm">{certificate.certificateNumber}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">Verification Code</h4>
                <p className="text-gray-600 font-mono text-sm">{certificate.verificationCode}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">Status</h4>
                <span className={`px-3 py-1 text-xs font-medium rounded-full border ${
                  certificate.status === 'verified' ? 'bg-green-100 text-green-800 border-green-200' :
                  certificate.status === 'issued' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                  'bg-gray-100 text-gray-800 border-gray-200'
                }`}>
                  {certificate.status.charAt(0).toUpperCase() + certificate.status.slice(1)}
                </span>
              </div>

              {certificate.metadata && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Statistics</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Downloads:</span>
                      <span>{certificate.metadata.downloadCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shared:</span>
                      <span>{certificate.metadata.sharedCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Verifications:</span>
                      <span>{certificate.metadata.verificationCount}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={() => onDownload(certificate)}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <Download className="w-4 h-4 mr-2 inline" />
                Download Certificate
              </button>
              <button
                onClick={() => onShare(certificate)}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <Share2 className="w-4 h-4 mr-2 inline" />
                Share Certificate
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Request Modal Component
const RequestModal: React.FC<{
  onClose: () => void;
  onSubmit: (requestData: Omit<CertificateRequest, '_id' | 'requestDate' | 'status'>) => void;
}> = ({ onClose, onSubmit }) => {
  const [certificateType, setCertificateType] = useState('');
  const [purpose, setPurpose] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [notes, setNotes] = useState('');

  const certificateTypes = [
    'Transcript',
    'Degree Certificate',
    'Character Certificate',
    'Provisional Certificate',
    'Migration Certificate',
    'Conduct Certificate',
    'Bonafide Certificate',
    'Course Completion Certificate'
  ];

  const purposes = [
    'Job Application',
    'Higher Studies',
    'Verification',
    'Scholarship Application',
    'Visa Application',
    'Personal Records',
    'Other'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certificateType || !purpose) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    onSubmit({
      certificateType,
      purpose,
      urgency,
      notes: notes || undefined,
      fees: 500 // Mock fee calculation
    });
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
          <h3 className="text-lg font-semibold text-gray-900">Request Certificate</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certificate Type *
              </label>
              <select
                value={certificateType}
                onChange={(e) => setCertificateType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              >
                <option value="">Select certificate type</option>
                {certificateTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purpose *
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              >
                <option value="">Select purpose</option>
                {purposes.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Urgency Level
            </label>
            <div className="flex space-x-4">
              {(['low', 'medium', 'high'] as const).map(level => (
                <label key={level} className="flex items-center">
                  <input
                    type="radio"
                    name="urgency"
                    value={level}
                    checked={urgency === level}
                    onChange={(e) => setUrgency(e.target.value as 'low' | 'medium' | 'high')}
                    className="mr-2 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="capitalize">{level}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Any additional information or special requirements..."
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Processing fees of ₹500 will be charged for this certificate request. 
              Processing time is typically 3-5 business days.
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Submit Request
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default StudentCertificates;