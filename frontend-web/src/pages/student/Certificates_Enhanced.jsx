import {
  Award,
  Download,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Search,
  Calendar,
  FileText,
  Trophy,
  BookOpen,
  Briefcase,
  Users,
  Star,
  GraduationCap,
  Target,
  Plus,
  Share2,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const StudentCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('certificates');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCertificateModal, setShowCertificateModal] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  useEffect(() => {
    fetchCertificateData();
  }, []);

  const fetchCertificateData = async () => {
    try {
      setLoading(true);
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
            credits: 180,
            institution: 'ABC University',
            level: 'Undergraduate'
          },
          metadata: {
            downloadCount: 10,
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
            downloadCount: 7,
            sharedCount: 3,
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
            downloadCount: 2,
            sharedCount: 1,
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
            sharedCount: 2,
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
            downloadCount: 12,
            sharedCount: 6,
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
          fees: 500,
          notes: 'Needed for graduate school application'
        },
        {
          _id: '3',
          certificateType: 'Provisional Certificate',
          purpose: 'Verification',
          urgency: 'low',
          requestDate: '2024-01-15',
          status: 'pending',
          fees: 500,
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

  const requestCertificate = async (requestData) => {
    try {
      const newRequest = {
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

  const verifyCertificate = async (code) => {
    try {
      setVerifyLoading(true);
      const mockResult = {
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

  const downloadCertificate = async (certificate) => {
    try {
      toast.success(`Downloaded ${certificate.title}`);
      setCertificates(prev => prev.map(cert =>
        cert._id === certificate._id
          ? { ...cert, metadata: { ...cert.metadata, downloadCount: cert.metadata.downloadCount + 1 } }
          : cert
      ));
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.error('Failed to download certificate');
    }
  };

  const shareCertificate = async (certificate) => {
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
      setCertificates(prev => prev.map(cert =>
        cert._id === certificate._id
          ? { ...cert, metadata: { ...cert.metadata, sharedCount: cert.metadata.sharedCount + 1 } }
          : cert
      ));
    } catch (error) {
      console.error('Error sharing certificate:', error);
      toast.error('Failed to share certificate');
    }
  };

  const getStatusColor = (status) => {
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'issued': return <CheckCircle className="w-4 h-4 text-green-500 inline mr-1" />;
      case 'verified': return <CheckCircle className="w-4 h-4 text-green-700 inline mr-1" />;
      case 'ready': return <CheckCircle className="w-4 h-4 text-green-400 inline mr-1" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500 inline mr-1" />;
      case 'processing': return <Clock className="w-4 h-4 text-yellow-600 inline mr-1" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-500 inline mr-1" />;
      case 'revoked': return <AlertTriangle className="w-4 h-4 text-red-700 inline mr-1" />;
      default: return <Clock className="w-4 h-4 text-gray-400 inline mr-1" />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'academic': return <GraduationCap className="w-5 h-5 text-blue-500 mr-2" />;
      case 'achievement': return <Trophy className="w-5 h-5 text-yellow-500 mr-2" />;
      case 'skill': return <Star className="w-5 h-5 text-purple-500 mr-2" />;
      case 'internship': return <Briefcase className="w-5 h-5 text-green-500 mr-2" />;
      case 'participation': return <Users className="w-5 h-5 text-pink-500 mr-2" />;
      case 'completion': return <BookOpen className="w-5 h-5 text-indigo-500 mr-2" />;
      case 'project': return <Target className="w-5 h-5 text-orange-500 mr-2" />;
      default: return <FileText className="w-5 h-5 text-gray-400 mr-2" />;
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
          <Award className="w-6 h-6 text-purple-500" />
          Certificates
        </h1>
        <div className="text-gray-500">Manage your digital certificates, request new ones, and verify authenticity</div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center"
        >
          <div className="font-semibold text-gray-600 mb-1">Total Certificates</div>
          <div className="text-2xl font-bold">{certificates.length}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center"
        >
          <div className="font-semibold text-gray-600 mb-1">Verified</div>
          <div className="text-2xl font-bold">{certificates.filter(c => c.status === 'verified').length}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center"
        >
          <div className="font-semibold text-gray-600 mb-1">Pending Requests</div>
          <div className="text-2xl font-bold">{requests.filter(r => r.status === 'pending').length}</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center"
        >
          <div className="font-semibold text-gray-600 mb-1">Verifications</div>
          <div className="text-2xl font-bold">{certificates.reduce((sum, cert) => sum + (cert.metadata?.verificationCount || 0), 0)}</div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-6">
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
      </div>

      {/* Tab Content */}
      {activeTab === 'certificates' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search certificates, issuers, categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
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

          {/* Certificates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredCertificates.map((certificate, index) => (
              <motion.div
                key={certificate._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow flex flex-col gap-2"
              >
                <div className="flex items-center gap-2 mb-2">
                  {getTypeIcon(certificate.type)}
                  <span className="font-bold text-lg">{certificate.title}</span>
                  {/* FIX: Proper className concatenation */}
                  <span className={`ml-auto px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(certificate.status)}`}>
                    {getStatusIcon(certificate.status)}
                    {certificate.status.charAt(0).toUpperCase() + certificate.status.slice(1)}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mb-1">Issued by: {certificate.issuer}</div>
                <div className="text-gray-700 mb-2">{certificate.description}</div>
                <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-2">
                  <span>
                    <Calendar className="inline w-4 h-4 mr-1" />
                    Issued: {certificate.issueDate ? new Date(certificate.issueDate).toLocaleDateString() : 'N/A'}
                  </span>
                  <span>
                    <FileText className="inline w-4 h-4 mr-1" />
                    Certificate #: {certificate.certificateNumber}
                  </span>
                  {certificate.grade && (
                    <span>
                      <Star className="inline w-4 h-4 mr-1" />
                      Grade: {certificate.grade}
                    </span>
                  )}
                  {certificate.duration && (
                    <span>
                      <BookOpen className="inline w-4 h-4 mr-1" />
                      Duration: {certificate.duration}
                    </span>
                  )}
                </div>
                {certificate.skills && certificate.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {certificate.skills.slice(0, 3).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                    {certificate.skills.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-purple-200 text-purple-800 rounded-full">
                        +{certificate.skills.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                {certificate.metadata && (
                  <div className="flex gap-4 text-xs text-gray-500 mb-2">
                    <span>{certificate.metadata.downloadCount} Downloads</span>
                    <span>{certificate.metadata.sharedCount} Shared</span>
                    <span>{certificate.metadata.verificationCount} Verified</span>
                  </div>
                )}
                <div className="flex gap-2 mt-2">
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
                    <Share2 className="w-4 h-4 inline" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          {filteredCertificates.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              <div className="font-semibold mb-1">No certificates found matching your criteria</div>
            </div>
          )}
        </motion.div>
      )}

      {/* ...rest of your code unchanged... */}
      {/* The rest of your file is already correct and does not need changes. */}
      {/* If you want to fix modal close on background click, wrap modal in a div and add onClick handler. */}
      {/* If you want that, let me know! */}
      {/* ... */}
    </div>
  );
};

// ...rest of your file unchanged...

export default StudentCertificates;