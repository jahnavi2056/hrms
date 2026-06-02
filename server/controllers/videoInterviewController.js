import VideoInterview from '../models/VideoInterview.js';
import { Candidate, Job } from '../models/Recruitment.js';

const generateMeetLink = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  const seg = (n) => Array.from({length:n}, () => chars[Math.floor(Math.random()*26)]).join('');
  return `https://meet.google.com/${seg(3)}-${seg(4)}-${seg(3)}`;
};

export const scheduleInterview = async (req, res) => {
  try {
    const { candidateId, jobId, scheduledAt, duration, interviewers, type, notes } = req.body;
    const meetingLink = generateMeetLink();
    const interview = await VideoInterview.create({
      candidate: candidateId, job: jobId, scheduledAt, duration: duration || 60,
      interviewers: interviewers || [req.user._id], type: type || 'screening',
      meetingLink, notes, status: 'scheduled'
    });
    await Candidate.findByIdAndUpdate(candidateId, { stage: 'interview', interviewDate: scheduledAt });
    await interview.populate([
      { path: 'candidate', select: 'name email' },
      { path: 'job', select: 'title department' },
      { path: 'interviewers', select: 'firstName lastName email' }
    ]);
    res.status(201).json(interview);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getInterviews = async (req, res) => {
  try {
    const { status, upcoming } = req.query;
    const q = {};
    if (status) q.status = status;
    if (upcoming === 'true') q.scheduledAt = { $gte: new Date() };
    if (!['admin','hr_recruiter','senior_manager'].includes(req.user.role)) {
      q.interviewers = req.user._id;
    }
    const interviews = await VideoInterview.find(q)
      .populate('candidate', 'name email phone')
      .populate('job', 'title department')
      .populate('interviewers', 'firstName lastName email avatar')
      .sort({ scheduledAt: 1 });
    res.json(interviews);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const submitFeedback = async (req, res) => {
  try {
    const { rating, notes, recommendation } = req.body;
    const interview = await VideoInterview.findByIdAndUpdate(
      req.params.id,
      { status: 'completed', feedback: { rating, notes, recommendation, submittedBy: req.user._id, submittedAt: new Date() } },
      { new: true }
    ).populate('candidate').populate('job');
    if (recommendation === 'hire') await Candidate.findByIdAndUpdate(interview.candidate._id, { stage: 'offer' });
    else if (recommendation === 'reject') await Candidate.findByIdAndUpdate(interview.candidate._id, { stage: 'rejected' });
    res.json(interview);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const cancelInterview = async (req, res) => {
  try {
    const interview = await VideoInterview.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true });
    res.json(interview);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
