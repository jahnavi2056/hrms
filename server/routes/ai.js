import { Router } from 'express';
import { hrChat, generatePerformanceReview, getLeaveRiskAnalysis, getTeamRiskReport } from '../controllers/aiController.js';
import { analyzeInterviewAI, generateQuestionsAI, screenCandidateAI } from '../controllers/interviewAiController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();
router.use(protect);

// HR Chatbot
router.post('/chat', hrChat);

// Performance AI
router.post('/performance/:id/generate', authorize('admin','senior_manager','hr_recruiter'), generatePerformanceReview);

// Leave Risk
router.get('/leave-risk/:id', authorize('admin','senior_manager','hr_recruiter'), getLeaveRiskAnalysis);
router.get('/team-risk', authorize('admin','senior_manager'), getTeamRiskReport);

// Interview AI — these were the missing routes causing 500 errors
router.post('/interview/:id/analyze', authorize('admin','hr_recruiter','senior_manager'), analyzeInterviewAI);
router.get('/interview/:id/generate', authorize('admin','hr_recruiter','senior_manager'), generateQuestionsAI);
router.post('/interview/:id/screen', authorize('admin','hr_recruiter','senior_manager'), screenCandidateAI);

export default router;
