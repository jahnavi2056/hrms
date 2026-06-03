import { analyzeInterviewConversation, generateInterviewQuestions, evaluateVoiceScreening } from '../ai/aiServices.js';
import VideoInterview from '../models/VideoInterview.js';
import { Candidate, Job } from '../models/Recruitment.js';

export const analyzeTranscript = async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript?.trim()) return res.status(400).json({ error: 'Transcript is required' });
    const interview = await VideoInterview.findById(req.params.id)
      .populate('candidate', 'name')
      .populate('job', 'title');
    if (!interview) return res.status(404).json({ error: 'Interview not found' });
    const result = await analyzeInterviewConversation(
      transcript,
      interview.candidate?.name || 'Candidate',
      interview.job?.title || 'Role'
    );
    await VideoInterview.findByIdAndUpdate(req.params.id, {
      aiTranscriptSummary: result.summary,
      'feedback.rating': Math.round(result.overallScore / 20),
      'feedback.recommendation': result.recommendation,
      'feedback.notes': result.summary,
    });
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const getInterviewQuestions = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { experienceLevel = 'mid' } = req.query;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    const result = await generateInterviewQuestions(
      job.title, job.department,
      job.skills || [], experienceLevel
    );
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

export const screenVoiceCandidate = async (req, res) => {
  try {
    const { candidateId, responses } = req.body;
    if (!responses?.length) return res.status(400).json({ error: 'Responses required' });
    const candidate = await Candidate.findById(candidateId).populate('job');
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    const result = await evaluateVoiceScreening(
      responses, candidate.name,
      candidate.job?.title || 'Position'
    );
    await Candidate.findByIdAndUpdate(candidateId, {
      aiScreeningScore: result.screeningScore,
      aiScreeningVerdict: result.verdict,
      aiScreeningSummary: result.summary,
      stage: result.verdict === 'proceed' ? 'interview' : result.verdict === 'reject' ? 'rejected' : 'screening'
    });
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
