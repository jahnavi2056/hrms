import { Router } from 'express';
import {
  createJob,
  getJobs,
  updateJob,
  addCandidate,
  getCandidates,
  screenCandidate,
  updateCandidateStage
} from '../controllers/mainControllers.js';

import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/jobs', getJobs);
router.post('/jobs', authorize('admin', 'hr_recruiter'), createJob);
router.put('/jobs/:id', authorize('admin', 'hr_recruiter'), updateJob);

router.get('/jobs/:jobId/candidates', authorize('admin', 'hr_recruiter', 'senior_manager'), getCandidates);
router.post('/jobs/:jobId/candidates', authorize('admin', 'hr_recruiter'), addCandidate);

router.post('/candidates/:id/screen', authorize('admin', 'hr_recruiter'), screenCandidate);
router.put('/candidates/:id/stage', authorize('admin', 'hr_recruiter', 'senior_manager'), updateCandidateStage);

export default router;