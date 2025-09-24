const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');

// Custom APIError class
class APIError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'APIError';
  }
}
exports.APIError = APIError;

// Create job posting (admin only)
exports.createJob = async (req, res) => {
  try {
    const jobData = req.body;

    const job = new Job({
      ...jobData,
      postedBy: req.user && req.user.id
    });

    await job.save();

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      data: job
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all jobs
exports.getAllJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      company,
      location,
      jobType,
      experience,
      status = 'active',
      salary
    } = req.query;

    const filter = {};

    if (company) filter.company = { $regex: company, $options: 'i' };
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (jobType) filter.jobType = jobType;
    if (experience) filter.experienceRequired = experience;
    if (status) filter.status = status;
    if (salary) {
      const [min, max] = String(salary).split('-');
      if (min) filter['salary.min'] = { $gte: Number(min) };
      if (max) filter['salary.max'] = { $lte: Number(max) };
    }

    // Students can only see active jobs
    if (req.user && req.user.role === 'student') {
      filter.status = 'active';
      filter.applicationDeadline = { $gte: new Date() };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const jobs = await Job.find(filter)
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Job.countDocuments(filter);

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / Number(limit)),
          total
        }
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get job by ID
exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id)
      .populate('postedBy', 'name email');

    if (!job) {
      res.status(404).json({ success: false, message: 'Job not found' });
      return;
    }

    // Students can only view active jobs
    if (req.user && req.user.role === 'student' && !job.isActive) {
      res.status(403).json({ success: false, message: 'Job not available' });
      return;
    }

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update job (admin only)
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const job = await Job.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('postedBy', 'name email');

    if (!job) {
      res.status(404).json({ success: false, message: 'Job not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: job
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete job (admin only)
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findByIdAndDelete(id);

    if (!job) {
      res.status(404).json({ success: false, message: 'Job not found' });
      return;
    }

    // Also delete related applications
    await Application.deleteMany({ jobId: id });

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Apply for job (student only)
exports.applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { coverLetter, resume } = req.body;

    // Verify job exists and is active
    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json({ success: false, message: 'Job not found' });
      return;
    }

    if (!job.isActive) {
      res.status(400).json({ success: false, message: 'Job is not accepting applications' });
      return;
    }

    if (new Date() > job.applicationDeadline) {
      res.status(400).json({ success: false, message: 'Application deadline has passed' });
      return;
    }

    // Check if student has already applied
    const existingApplication = await Application.findOne({
      jobId,
      userId: req.user && req.user.id
    });

    if (existingApplication) {
      res.status(400).json({ success: false, message: 'You have already applied for this job' });
      return;
    }

    const application = new Application({
      jobId,
      userId: req.user && req.user.id,
      coverLetter,
      resume,
      status: 'applied'
    });

    await application.save();

    // Update job application count
    await Job.findByIdAndUpdate(jobId, {
      $inc: { applicationsCount: 1 }
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get applications for a job (admin only)
exports.getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const {
      page = 1,
      limit = 10,
      status
    } = req.query;

    const filter = { jobId };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const applications = await Application.find(filter)
      .populate('userId', 'name email studentId profile')
      .populate('jobId', 'title company')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Application.countDocuments(filter);

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / Number(limit)),
          total
        }
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get student applications
exports.getStudentApplications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status
    } = req.query;

    const userId = req.user && req.user.role === 'student' ? req.user.id : req.params.userId;

    const filter = { userId };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);

    const applications = await Application.find(filter)
      .populate('jobId', 'title company location salary applicationDeadline')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Application.countDocuments(filter);

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          current: Number(page),
          pages: Math.ceil(total / Number(limit)),
          total
        }
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update application status (admin only)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body;

    const application = await Application.findByIdAndUpdate(
      id,
      {
        status,
        feedback,
        reviewedAt: new Date(),
        reviewedBy: req.user && req.user.id
      },
      { new: true, runValidators: true }
    ).populate('userId', 'name email')
     .populate('jobId', 'title company');

    if (!application) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: application
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get placement statistics (admin only)
exports.getPlacementStatistics = async (req, res) => {
  try {
    const { year, department } = req.query;

    const matchStage = {};
    if (year) {
      const startDate = new Date(`${year}-01-01`);
      const endDate = new Date(`${year}-12-31`);
      matchStage.createdAt = { $gte: startDate, $lte: endDate };
    }

    // Get total jobs
    const totalJobs = await Job.countDocuments(
      year ? {
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      } : {}
    );

    // Get total applications
    const totalApplications = await Application.countDocuments(matchStage);

    // Get applications by status
    const applicationsByStatus = await Application.aggregate([
      { $match: matchStage },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get top companies by job postings
    const topCompanies = await Job.aggregate([
      year ? {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      } : { $match: {} },
      { $group: { _id: '$company', jobCount: { $sum: 1 } } },
      { $sort: { jobCount: -1 } },
      { $limit: 10 }
    ]);

    // Get placement rate by department
    const placementByDepartment = await Application.aggregate([
      { $match: { ...matchStage, status: 'selected' } },
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
          placements: { $sum: 1 }
        }
      },
      { $sort: { placements: -1 } }
    ]);

    // Get average package (if salary data is available)
    const averagePackage = await Job.aggregate([
      year ? {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      } : { $match: {} },
      {
        $group: {
          _id: null,
          avgMin: { $avg: '$salary.min' },
          avgMax: { $avg: '$salary.max' },
          highestPackage: { $max: '$salary.max' }
        }
      }
    ]);

    const avgMin = averagePackage[0]?.avgMin || 0;
    const avgMax = averagePackage[0]?.avgMax || 0;
    const highestPackage = averagePackage[0]?.highestPackage || 0;

    const stats = {
      totalJobs,
      totalApplications,
      placementRate: totalApplications > 0 ?
        ((applicationsByStatus.find(s => s._id === 'selected')?.count || 0) / totalApplications * 100).toFixed(2) : '0.00',
      applicationsByStatus: applicationsByStatus.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      topCompanies,
      placementByDepartment,
      averagePackage: {
        avgMin,
        avgMax,
        highestPackage
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get trending jobs
exports.getTrendingJobs = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const trendingJobs = await Job.find({
      status: 'active',
      applicationDeadline: { $gte: new Date() }
    })
      .sort({ applicationsCount: -1, createdAt: -1 })
      .limit(Number(limit))
      .populate('postedBy', 'name email')
      .select('title company location salary applicationsCount jobType');

    res.json({
      success: true,
      data: trendingJobs
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get recent placements
exports.getRecentPlacements = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const recentPlacements = await Application.find({
      status: 'selected'
    })
      .populate('userId', 'name profile.department')
      .populate('jobId', 'title company salary')
      .sort({ updatedAt: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      data: recentPlacements
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Bulk update job status (admin only)
exports.bulkUpdateJobStatus = async (req, res) => {
  try {
    const { jobIds, status } = req.body;

    if (!Array.isArray(jobIds) || jobIds.length === 0) {
      res.status(400).json({ success: false, message: 'Job IDs array is required' });
      return;
    }

    const result = await Job.updateMany(
      { _id: { $in: jobIds } },
      { status }
    );

    res.json({
      success: true,
      message: `Updated ${result.modifiedCount} jobs successfully`,
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};