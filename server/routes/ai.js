import { Router } from 'express';
import { hrChat, generatePerformanceReview, getLeaveRiskAnalysis, getTeamRiskReport } from '../controllers/aiController.js';
import { analyzeTranscript, getInterviewQuestions, screenVoiceCandidate } from '../controllers/interviewAIController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();
router.use(protect);

// Existing
router.post('/chat', hrChat);
router.post('/performance/:id/generate', authorize('admin','senior_manager','hr_recruiter'), generatePerformanceReview);
router.get('/leave-risk/:id', authorize('admin','senior_manager','hr_recruiter'), getLeaveRiskAnalysis);
router.get('/team-risk', authorize('admin','senior_manager'), getTeamRiskReport);

// New interview AI
router.post('/interview/:id/analyze', authorize('admin','hr_recruiter','senior_manager'), analyzeTranscript);
router.get('/interview/questions/:jobId', authorize('admin','hr_recruiter','senior_manager'), getInterviewQuestions);
router.post('/interview/voice-screen', authorize('admin','hr_recruiter'), screenVoiceCandidate);

export default router;
