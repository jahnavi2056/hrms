// ─── LEAVE CONTROLLER ────────────────────────────────────────────────────────
import Leave from '../models/Leave.js';
import Payroll from '../models/Payroll.js';
import Performance from '../models/Performance.js';
import { Job, Candidate } from '../models/Recruitment.js';
import { Notification } from '../models/Misc.js';
import { screenResume } from '../ai/aiServices.js';

// LEAVE
export const applyLeave = async (req, res) => {
  try {
    const { type, startDate, endDate, reason } = req.body;
    const start = new Date(startDate), end = new Date(endDate);
    if (end < start) return res.status(400).json({ error: 'End date must be after start date' });
    const days = Math.ceil((end - start) / 86400000) + 1;
    const leave = await Leave.create({ employee: req.user._id, type, startDate: start, endDate: end, days, reason });
    await Notification.create({ recipient: req.user._id, title: 'Leave applied', message: `Your ${type} leave (${days} day${days>1?'s':''}) is pending approval.`, type: 'leave' });
    res.status(201).json(leave);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user._id }).sort({ createdAt: -1 });
    const balance = { sick: 12, casual: 6, annual: 18 };
    const used = {};
    leaves.filter(l => l.status === 'approved' && ['sick','casual','annual'].includes(l.type))
      .forEach(l => { used[l.type] = (used[l.type] || 0) + l.days; });
    const remaining = { sick: balance.sick - (used.sick||0), casual: balance.casual - (used.casual||0), annual: balance.annual - (used.annual||0) };
    res.json({ leaves, balance, used, remaining });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getAllLeaves = async (req, res) => {
  try {
    const { status, month, year, type } = req.query;
    const q = {};
    if (status && status !== 'all') q.status = status;
    if (type) q.type = type;
    if (month && year) { q.startDate = { $gte: new Date(year, month-1, 1) }; q.endDate = { $lte: new Date(year, month, 0) }; }
    const leaves = await Leave.find(q).populate('employee','firstName lastName department employeeId avatar').populate('approvedBy','firstName lastName').sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const updateLeaveStatus = async (req, res) => {
  try {
    const { status, comments } = req.body;
    const leave = await Leave.findByIdAndUpdate(req.params.id, { status, comments, approvedBy: req.user._id, approvedAt: new Date() }, { new: true }).populate('employee');
    if (!leave) return res.status(404).json({ error: 'Leave not found' });
    await Notification.create({ recipient: leave.employee._id, title: `Leave ${status}`, message: `Your ${leave.type} leave has been ${status}.${comments ? ` Note: ${comments}` : ''}`, type: status === 'approved' ? 'success' : 'error' });
    res.json(leave);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const cancelLeave = async (req, res) => {
  try {
    const leave = await Leave.findOne({ _id: req.params.id, employee: req.user._id, status: 'pending' });
    if (!leave) return res.status(404).json({ error: 'Leave not found or cannot be cancelled' });
    leave.status = 'cancelled'; await leave.save();
    res.json(leave);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// PAYROLL
export const generatePayroll = async (req, res) => {
  try {
    const { employeeId, month, year, basicSalary, allowances=0, bonus=0, deductions=0 } = req.body;
    const hra = basicSalary * 0.4;
    const da = basicSalary * 0.1;
    const ta = basicSalary * 0.05;
    const grossSalary = basicSalary + hra + da + ta + allowances + bonus;
    const pf = basicSalary * 0.12;
    const esi = grossSalary <= 21000 ? grossSalary * 0.0075 : 0;
    const tax = grossSalary > 83333 ? grossSalary * 0.10 : grossSalary > 50000 ? grossSalary * 0.05 : 0;
    const netSalary = grossSalary - pf - esi - tax - deductions;
    const p = await Payroll.findOneAndUpdate(
      { employee: employeeId, month, year },
      { employee: employeeId, month, year, basicSalary, hra, da, ta, allowances, bonus, grossSalary, pf, esi, tax, deductions, netSalary, status: 'processed' },
      { upsert: true, new: true }
    );
    res.json(p);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getMyPayslips = async (req, res) => {
  try {
    const payslips = await Payroll.find({ employee: req.user._id }).sort({ year:-1, month:-1 });
    res.json(payslips);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getPayrollSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const payrolls = await Payroll.find({ month: +month, year: +year }).populate('employee','firstName lastName department employeeId');
    const total = payrolls.reduce((s,p) => s + p.netSalary, 0);
    const gross = payrolls.reduce((s,p) => s + p.grossSalary, 0);
    res.json({ payrolls, total, gross, count: payrolls.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const bulkGeneratePayroll = async (req, res) => {
  try {
    const { month, year } = req.body;
    const { default: User } = await import('../models/User.js');
    const employees = await User.find({ isActive: true });
    let processed = 0;
    for (const emp of employees) {
      const basic = Math.round((emp.salary || 1000000) / 12);
      const hra = basic * 0.4, da = basic * 0.1, ta = basic * 0.05;
      const gross = basic + hra + da + ta;
      const pf = basic * 0.12, tax = gross > 83333 ? gross * 0.1 : 0;
      const net = gross - pf - tax;
      await Payroll.findOneAndUpdate(
        { employee: emp._id, month, year },
        { employee: emp._id, month, year, basicSalary: basic, hra, da, ta, grossSalary: gross, pf, tax, netSalary: net, status: 'processed' },
        { upsert: true }
      );
      processed++;
    }
    res.json({ processed });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const markPayrollPaid = async (req, res) => {
  try {
    const p = await Payroll.findByIdAndUpdate(req.params.id, { status: 'paid', paidAt: new Date() }, { new: true });
    if (!p) return res.status(404).json({ error: 'Payroll not found' });
    await Notification.create({ recipient: p.employee, title: 'Salary credited', message: `Your salary of ₹${p.netSalary.toLocaleString()} has been processed.`, type: 'payroll' });
    res.json(p);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// PERFORMANCE
export const createReview = async (req, res) => {
  try {
    const review = await Performance.create({ ...req.body, reviewer: req.user._id });
    res.status(201).json(review);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Performance.find({ employee: req.user._id }).populate('reviewer','firstName lastName').sort({ year:-1, createdAt:-1 });
    res.json(reviews);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getAllReviews = async (req, res) => {
  try {
    const { year, period, status, department } = req.query;
    const q = {};
    if (year) q.year = +year;
    if (period) q.period = period;
    if (status) q.status = status;
    const { default: User } = await import('../models/User.js');
    let empIds = null;
    if (department) { const emps = await User.find({ department }).select('_id'); empIds = emps.map(e => e._id); q.employee = { $in: empIds }; }
    const reviews = await Performance.find(q).populate('employee','firstName lastName department designation').populate('reviewer','firstName lastName').sort({ createdAt:-1 });
    res.json(reviews);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const updateReview = async (req, res) => {
  try {
    const r = await Performance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(r);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// RECRUITMENT
export const createJob = async (req, res) => {
  try {
    const job = await Job.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json(job);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getJobs = async (req, res) => {
  try {
    const { status, department } = req.query;
    const q = {};
    if (status && status !== 'all') q.status = status;
    if (department) q.department = department;
    const jobs = await Job.find(q).populate('createdBy','firstName lastName').sort({ createdAt:-1 });
    res.json(jobs);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(job);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const addCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.create({ ...req.body, job: req.params.jobId });
    await Job.findByIdAndUpdate(req.params.jobId, { $inc: { applicants: 1 } });
    res.status(201).json(candidate);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getCandidates = async (req, res) => {
  try {
    const { stage } = req.query;
    const q = { job: req.params.jobId };
    if (stage && stage !== 'all') q.stage = stage;
    const candidates = await Candidate.find(q).sort({ aiScore:-1, createdAt:-1 });
    res.json(candidates);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const screenCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id).populate('job');
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    if (!candidate.resumeText) return res.status(400).json({ error: 'No resume text to screen' });
    const result = await screenResume(candidate.resumeText, candidate.job);
    const updated = await Candidate.findByIdAndUpdate(req.params.id, {
      aiScore: result.score, aiAnalysis: result.analysis, strengths: result.strengths,
      weaknesses: result.weaknesses, recommendation: result.recommendation,
      stage: result.score >= 65 ? 'interview' : result.score >= 40 ? 'screening' : 'rejected'
    }, { new: true });
    res.json({ candidate: updated, aiResult: result });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const updateCandidateStage = async (req, res) => {
  try {
    const c = await Candidate.findByIdAndUpdate(req.params.id, { stage: req.body.stage, notes: req.body.notes, interviewDate: req.body.interviewDate }, { new: true });
    res.json(c);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
