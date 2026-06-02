import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Payroll from '../models/Payroll.js';
import { Job, Candidate } from '../models/Recruitment.js';
import Performance from '../models/Performance.js';
const router = Router();
router.use(protect);

router.get('/stats', async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const m = today.getMonth()+1, y = today.getFullYear();
    const isAdmin = ['admin','senior_manager'].includes(req.user.role);
    if (isAdmin) {
      const [totalEmp, todayPresent, pendingLeaves, openJobs, newJoinees] = await Promise.all([
        User.countDocuments({ isActive:true }),
        Attendance.countDocuments({ date:today, status:{ $in:['present','late','wfh'] } }),
        Leave.countDocuments({ status:'pending' }),
        Job.countDocuments({ status:'open' }),
        User.countDocuments({ isActive:true, joiningDate:{ $gte:new Date(y, m-1, 1) } }),
      ]);
      const payrollData = await Payroll.aggregate([{ $match:{ month:m, year:y } }, { $group:{ _id:null, total:{ $sum:'$netSalary' }, count:{ $sum:1 } } }]);
      const deptBreakdown = await User.aggregate([{ $match:{ isActive:true } }, { $group:{ _id:'$department', count:{ $sum:1 } } }, { $sort:{ count:-1 } }]);
      const weekAttendance = [];
      for (let i=6; i>=0; i--) {
        const d = new Date(); d.setDate(d.getDate()-i); d.setHours(0,0,0,0);
        const c = await Attendance.countDocuments({ date:d, status:{ $in:['present','late','wfh'] } });
        weekAttendance.push({ date:d.toISOString().slice(0,10), count:c, day:d.toLocaleDateString('en',{weekday:'short'}) });
      }
      return res.json({ totalEmp, todayPresent, pendingLeaves, openJobs, newJoinees, payroll: payrollData[0]||{total:0,count:0}, deptBreakdown, weekAttendance, attendanceRate: totalEmp ? Math.round((todayPresent/totalEmp)*100) : 0 });
    }
    // Employee dashboard
    const [todayAtt, myLeaves, myPayslip, myReviews] = await Promise.all([
      Attendance.findOne({ employee:req.user._id, date:today }),
      Leave.find({ employee:req.user._id, status:{ $in:['pending','approved'] } }).sort({ createdAt:-1 }).limit(3),
      Payroll.findOne({ employee:req.user._id, month:m, year:y }),
      Performance.find({ employee:req.user._id }).sort({ createdAt:-1 }).limit(1),
    ]);
    res.json({ todayAtt, myLeaves, myPayslip, myReviews });
  } catch (err) { res.status(500).json({ error:err.message }); }
});

router.get('/analytics', authorize('admin','senior_manager'), async (req, res) => {
  try {
    const months = [];
    for (let i=5; i>=0; i--) {
      const d = new Date(); d.setMonth(d.getMonth()-i);
      const m = d.getMonth()+1, y = d.getFullYear();
      const [hires, payroll] = await Promise.all([
        User.countDocuments({ isActive:true, joiningDate:{ $gte:new Date(y,m-1,1), $lte:new Date(y,m,0) } }),
        Payroll.aggregate([{ $match:{ month:m, year:y } }, { $group:{ _id:null, total:{ $sum:'$netSalary' } } }])
      ]);
      months.push({ month:`${d.toLocaleString('en',{month:'short'})} ${y}`, hires, payroll: payroll[0]?.total||0 });
    }
    const roleBreakdown = await User.aggregate([{ $match:{ isActive:true } }, { $group:{ _id:'$role', count:{ $sum:1 } } }]);
    res.json({ months, roleBreakdown });
  } catch (err) { res.status(500).json({ error:err.message }); }
});

export default router;
