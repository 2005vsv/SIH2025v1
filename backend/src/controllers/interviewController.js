const InterviewSchedule = require('../models/InterviewSchedule');
const Application = require('../models/Application');

// Admin: Schedule interview for a job application
exports.scheduleInterview = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { date, time, mode, questions } = req.body;
    // Find application
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    // Create or update interview schedule
    let interview = await InterviewSchedule.findOne({ applicationId });
    if (interview) {
      interview.date = date;
      interview.time = time;
      interview.mode = mode;
      interview.questions = questions;
      await interview.save();
    } else {
      interview = new InterviewSchedule({
        applicationId,
        studentId: application.userId,
        jobId: application.jobId,
        date,
        time,
        mode,
        questions,
        createdBy: req.user.id
      });
      await interview.save();
    }
    // Update application status and interview details
    application.status = 'interview_scheduled';
    application.interviewDate = new Date(`${date}T${time}`);
    application.interviewMode = mode;
    await application.save();
    // Populate user and job for frontend
    const populatedApp = await Application.findById(applicationId)
      .populate('userId', 'name email studentId profile')
      .populate('jobId', 'title company location');
    res.json({ success: true, message: 'Interview scheduled', data: interview, application: populatedApp });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Student: Get scheduled interviews
exports.getStudentInterviews = async (req, res) => {
  try {
    const studentId = req.user.id;
    const interviews = await InterviewSchedule.find({ studentId })
      .populate('jobId', 'title company location')
      .populate('applicationId')
      .sort({ date: 1, time: 1 });
    res.json({ success: true, data: interviews });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
