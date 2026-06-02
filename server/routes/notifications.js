import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { Notification } from '../models/Misc.js';
const router = Router();
router.use(protect);
router.get('/', async (req, res) => {
  try { res.json(await Notification.find({ recipient:req.user._id }).sort({ createdAt:-1 }).limit(30)); }
  catch (err) { res.status(500).json({ error:err.message }); }
});
router.put('/:id/read', async (req, res) => {
  try { await Notification.findByIdAndUpdate(req.params.id, { isRead:true }); res.json({ ok:true }); }
  catch (err) { res.status(500).json({ error:err.message }); }
});
router.put('/read-all', async (req, res) => {
  try { await Notification.updateMany({ recipient:req.user._id, isRead:false }, { isRead:true }); res.json({ ok:true }); }
  catch (err) { res.status(500).json({ error:err.message }); }
});
export default router;
