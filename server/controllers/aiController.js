import { chatWithHR, analysePerformance, predictLeaveRisk } from '../ai/aiServices.js';
import Performance from '../models/Performance.js';
import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

export const hrChat = async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages?.length) return res.status(400).json({ error: 'Messages required' });
    const reply = await chatWithHR(messages);
    res.json({ reply, timestamp: new Date().toISOString() });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const generatePerformanceReview = async (req, res) => {
  try {
    const review = await Performance.findById(req.params.id).populate('employee');
    if (!review) return res.status(404).json({ error: 'Review not found' });
    if (!review.kpis?.length) return res.status(400).json({ error: 'Add KPI data first' });
    const result = await analysePerformance(review.employee, review.kpis, review.period, review.year);
    const updated = await Performance.findByIdAndUpdate(req.params.id, {
      rating: result.overallRating, aiReview: result.review, strengths: result.strengths,
      improvements: result.improvements, goals: result.goals, status: 'reviewed'
    }, { new: true });
    res.json({ review: updated, aiResult: result });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getLeaveRiskAnalysis = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) return res.status(404).json({ error: 'Employee not found' });
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const history = await Attendance.find({ employee: req.params.id, date: { $gte: threeMonthsAgo } }).select('date status workHours overtime');
    const result = await predictLeaveRisk(employee, history);
    res.json({ employee: { id: employee._id, name: `${employee.firstName} ${employee.lastName}`, department: employee.department }, ...result });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getTeamRiskReport = async (req, res) => {
  try {
    const employees = await User.find({ isActive: true }).limit(20);
    const results = [];
    for (const emp of employees.slice(0, 5)) { // limit for API cost
      try {
        const threeMonthsAgo = new Date(); threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const history = await Attendance.find({ employee: emp._id, date: { $gte: threeMonthsAgo } }).select('date status workHours');
        const risk = await predictLeaveRisk(emp, history);
        results.push({ employee: { id: emp._id, name: `${emp.firstName} ${emp.lastName}`, department: emp.department }, ...risk });
      } catch (e) { /* skip individual failures */ }
    }
    res.json(results);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
