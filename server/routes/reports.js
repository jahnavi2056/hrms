import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Payroll from '../models/Payroll.js';
const router = Router();
router.use(protect);
router.use(authorize('admin','senior_manager','hr_recruiter'));
router.get('/headcount', async (req, res) => {
  try {
    const [total, byDept, byRole] = await Promise.all([
      User.countDocuments({ isActive:true }),
      User.aggregate([{ $match:{ isActive:true } }, { $group:{ _id:'$department', count:{ $sum:1 } } }, { $sort:{ count:-1 } }]),
      User.aggregate([{ $match:{ isActive:true } }, { $group:{ _id:'$role', count:{ $sum:1 } } }]),
    ]);
    res.json({ total, byDept, byRole });
  } catch (err) { res.status(500).json({ error:err.message }); }
});
router.get('/leave-summary', async (req, res) => {
  try {
    const { year } = req.query;
    const summary = await Leave.aggregate([
      { $match:{ status:'approved', startDate:{ $gte:new Date(year||new Date().getFullYear(), 0, 1) } } },
      { $group:{ _id:{ type:'$type', month:{ $month:'$startDate' } }, total:{ $sum:'$days' }, count:{ $sum:1 } } },
      { $sort:{ '_id.month':1 } }
    ]);
    res.json(summary);
  } catch (err) { res.status(500).json({ error:err.message }); }
});
router.get('/payroll-summary', async (req, res) => {
  try {
    const { year } = req.query;
    const summary = await Payroll.aggregate([
      { $match:{ year:+(year||new Date().getFullYear()) } },
      { $group:{ _id:'$month', total:{ $sum:'$netSalary' }, gross:{ $sum:'$grossSalary' }, count:{ $sum:1 } } },
      { $sort:{ _id:1 } }
    ]);
    res.json(summary);
  } catch (err) { res.status(500).json({ error:err.message }); }
});
export default router;
