import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── AI FEATURE 1: Resume Screener ──────────────────────────────────────────
export const screenResume = async (resumeText, job) => {
  const prompt = `You are a senior technical recruiter. Analyze this resume for the job and return ONLY valid JSON.

JOB: ${job.title} | ${job.department}
REQUIREMENTS: ${(job.requirements || []).join(', ')}
SKILLS NEEDED: ${(job.skills || []).join(', ')}
DESCRIPTION: ${job.description || ''}

RESUME:
${resumeText}

Return ONLY this JSON (no markdown, no text outside JSON):
{
  "score": <number 0-100>,
  "analysis": "<2-3 sentence professional analysis>",
  "strengths": ["<strength1>", "<strength2>", "<strength3>"],
  "weaknesses": ["<gap1>", "<gap2>"],
  "recommendation": "<hire|maybe|reject>",
  "fitScore": {
    "technical": <0-100>,
    "experience": <0-100>,
    "cultural": <0-100>
  },
  "suggestedRole": "<role title if different>"
}`;

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1200,
    messages: [{ role: 'user', content: prompt }]
  });
  const text = msg.content[0].text.trim().replace(/```json|```/g, '').trim();
  return JSON.parse(text);
};

// ─── AI FEATURE 2: HR Chatbot ────────────────────────────────────────────────
const HR_SYSTEM = `You are ARIA (AI Resource Intelligence Assistant), the intelligent HR assistant for FWC IT Services Pvt. Ltd. You are helpful, professional, and empathetic.

COMPANY POLICIES:
- Annual leave: 18 days/year | Sick leave: 12 days/year | Casual leave: 6 days/year
- Work hours: 9:00 AM – 6:00 PM, Monday to Friday
- Salary credited: Last working day of each month
- Notice period: 90 days for all employees
- Probation: 3 months
- Starting CTC: ₹10 LPA (post training)
- Training bond: 3 years mandatory
- Growth: 20-40% hike based on performance

You can help with: leave policies, attendance, payroll queries, company policies, HR procedures, onboarding, benefits, performance reviews, career growth.
For sensitive issues (termination, legal), escalate to HR Manager.
Be concise but thorough. Use bullet points for lists. Format nicely.`;

export const chatWithHR = async (messages) => {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1200,
    system: HR_SYSTEM,
    messages
  });
  return response.content[0].text;
};

// ─── AI FEATURE 3: Performance Analyser ─────────────────────────────────────
export const analysePerformance = async (employee, kpis, period, year) => {
  const kpiText = kpis.map(k =>
    `• ${k.name}: Target=${k.target}, Actual=${k.actual}, Score=${k.score}/10 (Weight: ${k.weight || 25}%)`
  ).join('\n');

  const prompt = `You are an expert HR performance consultant. Write a professional performance review.

EMPLOYEE: ${employee.firstName} ${employee.lastName}
DEPARTMENT: ${employee.department} | DESIGNATION: ${employee.designation}
REVIEW PERIOD: ${period} ${year}

KPI PERFORMANCE:
${kpiText}

Return ONLY valid JSON:
{
  "overallRating": <1.0-5.0>,
  "weightedScore": <0-100>,
  "review": "<4-5 sentence professional narrative review>",
  "strengths": ["<specific strength 1>", "<specific strength 2>", "<specific strength 3>"],
  "improvements": ["<actionable improvement 1>", "<actionable improvement 2>"],
  "goals": ["<SMART goal for next period 1>", "<SMART goal 2>"],
  "promotionReadiness": "<not_ready|developing|ready|highly_ready>",
  "recommendations": "<2-3 sentences on next steps>"
}`;

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }]
  });
  const text = msg.content[0].text.trim().replace(/```json|```/g, '').trim();
  return JSON.parse(text);
};

// ─── AI FEATURE 4: Leave Risk Predictor ─────────────────────────────────────
export const predictLeaveRisk = async (employee, attendanceHistory) => {
  const summary = {
    total: attendanceHistory.length,
    present: attendanceHistory.filter(a => a.status === 'present').length,
    absent: attendanceHistory.filter(a => a.status === 'absent').length,
    late: attendanceHistory.filter(a => a.status === 'late').length,
    wfh: attendanceHistory.filter(a => a.status === 'wfh').length,
    avgHours: attendanceHistory.length > 0
      ? (attendanceHistory.reduce((s, a) => s + (a.workHours || 0), 0) / attendanceHistory.length).toFixed(1)
      : 0
  };

  const prompt = `Analyze this employee's attendance and predict absenteeism risk.

EMPLOYEE: ${employee.firstName} ${employee.lastName} | DEPT: ${employee.department}
3-MONTH SUMMARY: ${JSON.stringify(summary)}

Return ONLY valid JSON:
{
  "riskLevel": "<low|medium|high|critical>",
  "riskScore": <0-100>,
  "pattern": "<observed attendance pattern in 1-2 sentences>",
  "prediction": "<likely next-month behaviour>",
  "rootCauses": ["<possible cause 1>", "<possible cause 2>"],
  "recommendations": ["<HR action 1>", "<HR action 2>"],
  "burnoutRisk": "<low|medium|high>"
}`;

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 800,
    messages: [{ role: 'user', content: prompt }]
  });
  const text = msg.content[0].text.trim().replace(/```json|```/g, '').trim();
  return JSON.parse(text);
};

// ─── AI FEATURE 5: Interview Analyzer ───────────────────────────────────────
export const analyzeInterview = async (interview) => {
  const prompt = `You are an expert HR interview analyst. Analyze this interview and return ONLY valid JSON.

CANDIDATE: ${interview.candidate?.name || 'Unknown'}
ROLE: ${interview.job?.title || 'Unknown'} | ${interview.job?.department || ''}
INTERVIEW TYPE: ${interview.type}
DURATION: ${interview.duration} minutes
FEEDBACK RATING: ${interview.feedback?.rating || 'N/A'}/5
FEEDBACK NOTES: ${interview.feedback?.notes || 'No notes provided'}
RECOMMENDATION: ${interview.feedback?.recommendation || 'pending'}

Return ONLY this JSON:
{
  "overallScore": <0-100>,
  "communicationScore": <0-100>,
  "technicalScore": <0-100>,
  "confidenceScore": <0-100>,
  "cultureFitScore": <0-100>,
  "summary": "<3-4 sentence professional assessment>",
  "keyStrengths": ["<strength1>", "<strength2>", "<strength3>"],
  "redFlags": ["<concern1>", "<concern2>"],
  "recommendation": "<hire|hold|reject>",
  "nextSteps": "<recommended next action>",
  "fitAnalysis": "<2 sentences on role fit>"
}`;

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1200,
    messages: [{ role: 'user', content: prompt }]
  });
  const text = msg.content[0].text.trim().replace(/```json|```/g, '').trim();
  return JSON.parse(text);
};

// ─── AI FEATURE 6: Interview Question Generator ──────────────────────────────
export const generateInterviewQuestions = async (jobTitle, department, type) => {
  const prompt = `You are a senior technical interviewer. Generate an interview script and return ONLY valid JSON.

ROLE: ${jobTitle} | DEPARTMENT: ${department} | TYPE: ${type}

Return ONLY this JSON:
{
  "opening": "<warm professional opening statement>",
  "questions": [
    {
      "category": "<technical|behavioral|situational>",
      "question": "<interview question>",
      "followUp": "<follow-up question>",
      "goodAnswer": "<what a strong answer looks like>",
      "redFlag": "<warning signs in weak answer>"
    }
  ],
  "closing": "<professional closing statement>",
  "evaluationCriteria": ["<criterion1>", "<criterion2>", "<criterion3>"]
}

Generate exactly 6 questions covering technical skills, problem solving, and culture fit.`;

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }]
  });
  const text = msg.content[0].text.trim().replace(/```json|```/g, '').trim();
  return JSON.parse(text);
};

// ─── AI FEATURE 7: Candidate Screen for Interview ────────────────────────────
export const screenCandidateForInterview = async (candidate, job) => {
  const prompt = `You are a senior recruiter. Pre-screen this candidate for interview and return ONLY valid JSON.

CANDIDATE: ${candidate.name}
EMAIL: ${candidate.email}
APPLIED STAGE: ${candidate.stage}
JOB: ${job?.title || 'Unknown'} | ${job?.department || ''}
JOB REQUIREMENTS: ${(job?.requirements || []).join(', ')}
RESUME SUMMARY: ${candidate.resumeText ? candidate.resumeText.substring(0, 500) : 'Not provided'}
AI SCORE: ${candidate.aiScore || 'N/A'}

Return ONLY this JSON:
{
  "screeningScore": <0-100>,
  "verdict": "<proceed|hold|reject>",
  "summary": "<2-3 sentence pre-screen summary>",
  "positives": ["<positive1>", "<positive2>"],
  "concerns": ["<concern1>"],
  "recommendedInterviewType": "<screening|technical|hr|final>",
  "estimatedSalaryRange": "<range in LPA>",
  "notesForInterviewer": "<key points to explore in interview>"
}`;

  const msg = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }]
  });
  const text = msg.content[0].text.trim().replace(/```json|```/g, '').trim();
  return JSON.parse(text);
};
