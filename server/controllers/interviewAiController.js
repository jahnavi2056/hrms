import VideoInterview from '../models/VideoInterview.js';
import { Candidate, Job } from '../models/Recruitment.js';
import { analyzeInterview, generateInterviewQuestions, screenCandidateForInterview } from '../ai/aiServices.js';

// POST /api/ai/interview/:id/analyze
export const analyzeInterviewAI = async (req, res) => {
  try {
    const interview = await VideoInterview.findById(req.params.id)
      .populate('candidate', 'name email stage resumeText aiScore')
      .populate('job', 'title department requirements skills')
      .populate('interviewers', 'firstName lastName');

    if (!interview) return res.status(404).json({ error: 'Interview not found' });

    const result = await analyzeInterview(interview);

    // Save analysis to interview
    await VideoInterview.findByIdAndUpdate(req.params.id, {
      aiAnalysis: result
    });

    res.json({ analysis: result, interview: { id: interview._id, candidate: interview.candidate?.name, role: interview.job?.title } });
  } catch (err) {
    console.error('Interview analyze error:', err);
    res.status(500).json({ error: err.message });
  }
};

// GET /api/ai/interview/:id/generate
export const generateQuestionsAI = async (req, res) => {
  try {
    const interview = await VideoInterview.findById(req.params.id)
      .populate('job', 'title department requirements skills');

    if (!interview) return res.status(404).json({ error: 'Interview not found' });

    const result = await generateInterviewQuestions(
      interview.job?.title || 'General',
      interview.job?.department || 'General',
      interview.type || 'technical'
    );

    res.json({ questions: result, interviewType: interview.type });
  } catch (err) {
    console.error('Generate questions error:', err);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/ai/interview/:id/screen
export const screenCandidateAI = async (req, res) => {
  try {
    const interview = await VideoInterview.findById(req.params.id)
      .populate('candidate')
      .populate('job');

    if (!interview) return res.status(404).json({ error: 'Interview not found' });

    const result = await screenCandidateForInterview(interview.candidate, interview.job);

    res.json({ screening: result, candidate: interview.candidate?.name });
  } catch (err) {
    console.error('Screen candidate error:', err);
    res.status(500).json({ error: err.message });
  }
};
