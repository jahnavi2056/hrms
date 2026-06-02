import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { Document } from '../models/Misc.js';
const router = Router();
router.use(protect);
router.get('/', async (req, res) => {
  try {
    const q = req.user.role === 'employee' ? { employee: req.user._id } : (req.query.employeeId ? { employee: req.query.employeeId } : {});
    res.json(await Document.find(q).populate('employee','firstName lastName').sort({ createdAt:-1 }));
  } catch (err) { res.status(500).json({ error:err.message }); }
});
router.post('/', authorize('admin','hr_recruiter'), async (req, res) => {
  try { res.status(201).json(await Document.create({ ...req.body, uploadedBy: req.user._id })); }
  catch (err) { res.status(500).json({ error:err.message }); }
});
router.delete('/:id', authorize('admin','hr_recruiter'), async (req, res) => {
  try { await Document.findByIdAndDelete(req.params.id); res.json({ ok:true }); }
  catch (err) { res.status(500).json({ error:err.message }); }
});
export default router;
