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

// ─── AI FEATURE 5: Interview Conversation Analyzer ───────────────────────────
export const analyzeInterviewConversation = async (transcript, candidateName, jobTitle) => {
  const prompt = `You are an expert interview analyst. Analyze this interview transcript and return ONLY valid JSON.

CANDIDATE: ${candidateName}
ROLE: ${jobTitle}

TRANSCRIPT:
${transcript}

Return ONLY this JSON (no markdown):
{
  "overallScore": <0-100>,
  "communicationScore": <0-100>,
  "technicalScore": <0-100>,
  "confidenceScore": <0-100>,
  "cultureFitScore": <0-100>,
  "summary": "<3-4 sentence professional assessment>",
  "keyStrengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "redFlags": ["<concern 1>", "<concern 2>"],
  "standoutMoments": ["<impressive moment 1>", "<impressive moment 2>"],
  "recommendation": "<hire|maybe|reject>",
  "nextSteps": "<recommended next action>",
  "sentimentAnalysis": { "positive": <0-100>, "neutral": <0-100>, "negative": <0-100> }
}`;
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-20250514', max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }]
  });
  const text = msg.content[0].text.trim().replace(/```json|```/g, '').trim();
  return JSON.parse(text);
};

// ─── AI FEATURE 6: AI Interview Question Generator ───────────────────────────
export const generateInterviewQuestions = async (jobTitle, department, skills, experienceLevel) => {
  const prompt = `You are a senior technical interviewer. Generate a structured interview script.

ROLE: ${jobTitle} | DEPARTMENT: ${department}
SKILLS: ${skills.join(', ')} | LEVEL: ${experienceLevel}

Return ONLY valid JSON (no markdown):
{
  "opening": "<warm 2-sentence opening>",
  "questions": [
    {
      "category": "<technical|behavioral|situational|culture>",
      "question": "<interview question>",
      "followUp": "<follow-up probe>",
      "goodAnswer": "<what a strong answer looks like>",
      "redFlag": "<what a bad answer looks like>"
    }
  ],
  "closing": "<professional closing statement>",
  "evaluationCriteria": ["<criterion 1>", "<criterion 2>", "<criterion 3>"]
}
Generate exactly 8 questions: 3 technical, 2 behavioral, 2 situational, 1 culture.`;
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-20250514', max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }]
  });
  const text = msg.content[0].text.trim().replace(/```json|```/g, '').trim();
  return JSON.parse(text);
};

// ─── AI FEATURE 7: Voice Screening Evaluator ─────────────────────────────────
export const evaluateVoiceScreening = async (responses, candidateName, jobTitle) => {
  const formatted = responses.map((r, i) => `Q${i+1}: ${r.question}\nA${i+1}: ${r.answer}`).join('\n\n');
  const prompt = `You are an AI recruiter conducting initial candidate screening. Evaluate these Q&A responses.

CANDIDATE: ${candidateName}
ROLE: ${jobTitle}

SCREENING RESPONSES:
${formatted}

Return ONLY valid JSON (no markdown):
{
  "screeningScore": <0-100>,
  "verdict": "<proceed|hold|reject>",
  "summary": "<2-3 sentence screening summary>",
  "positives": ["<positive 1>", "<positive 2>"],
  "concerns": ["<concern 1>"],
  "recommendedInterviewType": "<technical|hr|panel|skip_to_offer>",
  "notesForHR": "<internal notes for HR team>"
}`;
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-20250514', max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }]
  });
  const text = msg.content[0].text.trim().replace(/```json|```/g, '').trim();
  return JSON.parse(text);
};
