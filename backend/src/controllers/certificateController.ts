import { Response } from 'express';
import Certificate, { ICertificate } from '../models/Certificate';
import User, { IUser } from '../models/User';
import { AuthenticatedRequest } from '../types';

export class APIError extends Error {
  public statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'APIError';
  }
}

// Create certificate template (admin only)
export const createCertificate = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const certificateData = req.body;
    
    // Generate certificate number and verification hash
    const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const verificationHash = `${certificateNumber}-${Date.now()}`;
    
    const certificate = new Certificate({
      ...certificateData,
      certificateNumber,
      verificationHash,
      qrCode: `${process.env.BASE_URL}/api/certificates/verify/${certificateNumber}`,
      pdfUrl: '', // Will be generated after creation
      downloadCount: 0,
      verificationCount: 0,
      issuedBy: req.user?.id
    });
    
    await certificate.save();
    
    res.status(201).json({
      success: true,
      message: 'Certificate created successfully',
      data: certificate
    });
  } catch (error: any) {
    throw new APIError(error.message, 400);
  }
};

// Get all certificates
export const getAllCertificates = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type, 
      status,
      userId 
    } = req.query;

    const filter: any = {};
    
    if (type) filter.type = type;
    if (status) filter.status = status;

    // Students can only see their own certificates
    if (req.user?.role === 'student') {
      filter.userId = req.user.id;
    } else if (userId) {
      filter.userId = userId;
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const certificates = await Certificate.find(filter)
      .populate('userId', 'name email studentId profile')
      .populate('issuedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Certificate.countDocuments(filter);

    res.json({
      success: true,
      data: {
        certificates,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / Number(limit)),
          total
        }
      }
    });
  } catch (error: any) {
    throw new APIError(error.message, 400);
  }
};

// Get certificate by ID
export const getCertificateById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const certificate = await Certificate.findById(id)
      .populate('userId', 'name email studentId profile')
      .populate('issuedBy', 'name email');

    if (!certificate) {
      throw new APIError('Certificate not found', 404);
    }

    // Students can only view their own certificates
    if (req.user?.role === 'student' && certificate.userId.toString() !== req.user.id) {
      throw new APIError('Access denied', 403);
    }

    res.json({
      success: true,
      data: certificate
    });
  } catch (error: any) {
    throw new APIError(error.message, 400);
  }
};

// Update certificate (admin only)
export const updateCertificate = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const certificate = await Certificate.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'name email studentId profile')
     .populate('issuedBy', 'name email');

    if (!certificate) {
      throw new APIError('Certificate not found', 404);
    }

    res.json({
      success: true,
      message: 'Certificate updated successfully',
      data: certificate
    });
  } catch (error: any) {
    throw new APIError(error.message, 400);
  }
};

// Delete certificate (admin only)
export const deleteCertificate = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const certificate = await Certificate.findByIdAndDelete(id);

    if (!certificate) {
      throw new APIError('Certificate not found', 404);
    }

    res.json({
      success: true,
      message: 'Certificate deleted successfully'
    });
  } catch (error: any) {
    throw new APIError(error.message, 400);
  }
};

// Issue certificate to student (admin only)
export const issueCertificate = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId, type, title, description, metadata } = req.body;

    // Verify student exists
    const student = await User.findById(userId);
    if (!student || student.role !== 'student') {
      throw new APIError('Student not found', 404);
    }

    // Generate certificate number and verification hash
    const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const verificationHash = `${certificateNumber}-${Date.now()}`;

    const certificate = new Certificate({
      userId,
      type,
      title,
      description,
      certificateNumber,
      verificationHash,
      qrCode: `${process.env.BASE_URL}/api/certificates/verify/${certificateNumber}`,
      pdfUrl: '', // Will be generated after creation
      metadata: {
        ...metadata,
        institution: 'Your Institution Name' // Replace with actual institution
      },
      issueDate: new Date(),
      downloadCount: 0,
      verificationCount: 0,
      isRevoked: false,
      issuedBy: req.user?.id
    });

    await certificate.save();

    res.status(201).json({
      success: true,
      message: 'Certificate issued successfully',
      data: certificate
    });
  } catch (error: any) {
    throw new APIError(error.message, 400);
  }
};

// Verify certificate
export const verifyCertificate = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { certificateNumber } = req.params;

    const certificate = await Certificate.findOne({ certificateNumber })
      .populate('userId', 'name email studentId profile')
      .populate('issuedBy', 'name email');

    if (!certificate) {
      throw new APIError('Certificate not found', 404);
    }

    if (certificate.isRevoked) {
      throw new APIError('Certificate is not valid', 400);
    }

    res.json({
      success: true,
      data: {
        isValid: true,
        certificate: {
          certificateNumber: certificate.certificateNumber,
          title: certificate.title,
          type: certificate.type,
          issueDate: certificate.issueDate,
          student: {
            name: (certificate.userId as any).name,
            studentId: (certificate.userId as any).studentId,
            email: (certificate.userId as any).email
          }
        }
      }
    });
  } catch (error: any) {
    throw new APIError(error.message, 400);
  }
};

// Get certificate statistics (admin only)
export const getCertificateStatistics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { year, department } = req.query;

    const matchStage: any = {};
    if (year) {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31`);
      matchStage.issueDate = { $gte: startDate, $lte: endDate };
    }

    // Total certificates issued
    const totalCertificates = await Certificate.countDocuments(matchStage);

    // Certificates by type
    const certificatesByType = await Certificate.aggregate([
      { $match: matchStage },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Certificates by status
    const certificatesByStatus = await Certificate.aggregate([
      { $match: matchStage },
      { 
        $group: { 
          _id: { $cond: { if: '$isRevoked', then: 'revoked', else: 'issued' } }, 
          count: { $sum: 1 } 
        } 
      }
    ]);

    // Top students by certificate count
    const topStudents = await Certificate.aggregate([
      { $match: { ...matchStage, isRevoked: false } },
      { $group: { _id: '$userId', certificateCount: { $sum: 1 } } },
      { $sort: { certificateCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $project: {
          name: '$student.name',
          email: '$student.email',
          studentId: '$student.studentId',
          certificateCount: 1
        }
      }
    ]);

    // Certificates by department
    const certificatesByDepartment = await Certificate.aggregate([
      { $match: { ...matchStage, isRevoked: false } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $group: {
          _id: '$user.profile.department',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Monthly certificate trends
    const monthlyTrends = await Certificate.aggregate([
      { 
        $match: { 
          ...matchStage, 
          isRevoked: false,
          issueDate: { 
            $gte: new Date(new Date().getFullYear(), 0, 1),
            $lte: new Date(new Date().getFullYear(), 11, 31)
          }
        } 
      },
      {
        $group: {
          _id: { 
            month: { $month: '$issueDate' },
            year: { $year: '$issueDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const stats = {
      totalCertificates,
      certificatesByType: certificatesByType.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      certificatesByStatus: certificatesByStatus.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      topStudents,
      certificatesByDepartment,
      monthlyTrends
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    throw new APIError(error.message, 400);
  }
};

// Bulk issue certificates (admin only)
export const bulkIssueCertificates = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { certificates } = req.body;

    if (!Array.isArray(certificates) || certificates.length === 0) {
      throw new APIError('Certificates array is required', 400);
    }

    const issuedCertificates: any[] = [];
    const errors: string[] = [];

    for (let i = 0; i < certificates.length; i++) {
      try {
        const { userId, type, title, description, metadata } = certificates[i];

        // Verify student exists
        const student = await User.findById(userId);
        if (!student || student.role !== 'student') {
          errors.push(`Row ${i + 1}: Student not found`);
          continue;
        }

        // Generate certificate number and verification hash
        const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const verificationHash = `${certificateNumber}-${Date.now()}`;

        const certificate = new Certificate({
          userId,
          type,
          title,
          description,
          certificateNumber,
          verificationHash,
          qrCode: `${process.env.BASE_URL}/api/certificates/verify/${certificateNumber}`,
          pdfUrl: '',
          metadata: {
            ...metadata,
            institution: 'Your Institution Name'
          },
          issueDate: new Date(),
          downloadCount: 0,
          verificationCount: 0,
          isRevoked: false,
          issuedBy: req.user?.id
        });

        await certificate.save();
        issuedCertificates.push(certificate);

      } catch (error: any) {
        errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    res.json({
      success: true,
      message: `Issued ${issuedCertificates.length} certificates successfully`,
      data: {
        issued: issuedCertificates.length,
        errors: errors.length,
        errorDetails: errors
      }
    });
  } catch (error: any) {
    throw new APIError(error.message, 400);
  }
};

// Revoke certificate (admin only)
export const revokeCertificate = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const certificate = await Certificate.findByIdAndUpdate(
      id,
      { 
        isRevoked: true,
        revokedAt: new Date(),
        revokedBy: req.user?.id,
        revokeReason: reason
      },
      { new: true }
    ).populate('userId', 'name email studentId');

    if (!certificate) {
      throw new APIError('Certificate not found', 404);
    }

    res.json({
      success: true,
      message: 'Certificate revoked successfully',
      data: certificate
    });
  } catch (error: any) {
    throw new APIError(error.message, 400);
  }
};

// Download certificate (student/admin)
export const downloadCertificate = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const certificate = await Certificate.findById(id)
      .populate('userId', 'name email studentId profile');

    if (!certificate) {
      throw new APIError('Certificate not found', 404);
    }

    // Students can only download their own certificates
    if (req.user?.role === 'student' && certificate.userId.toString() !== req.user.id) {
      throw new APIError('Access denied', 403);
    }

    if (certificate.isRevoked) {
      throw new APIError('Certificate is not available for download', 400);
    }

    // In a real implementation, you would generate a PDF here
    // For now, we'll return the certificate data
    res.json({
      success: true,
      message: 'Certificate ready for download',
      data: {
        downloadUrl: `/api/certificates/${id}/download`,
        certificate
      }
    });
  } catch (error: any) {
    throw new APIError(error.message, 400);
  }
};