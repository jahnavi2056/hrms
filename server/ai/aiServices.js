import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-6';

const parseClaudeJSON = (msg) => {
  try {
    const text = msg.content?.[0]?.text || '{}';

    const cleaned = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Claude JSON Parse Error:', error);
    console.error('Raw Claude Response:', JSON.stringify(msg, null, 2));
    throw new Error('Invalid JSON returned from Claude');
  }
};

const askClaudeJSON = async (prompt, maxTokens = 1200) => {
  const msg = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }]
  });

  return parseClaudeJSON(msg);
};

// Resume Screener
export const screenResume = async (resumeText, job) => {
  const prompt = `You are a senior technical recruiter. Analyze this resume for the job and return ONLY valid JSON.

JOB: ${job.title} | ${job.department}
REQUIREMENTS: ${(job.requirements || []).join(', ')}
SKILLS NEEDED: ${(job.skills || []).join(', ')}
DESCRIPTION: ${job.description || ''}

RESUME:
${resumeText}

Return ONLY this JSON:
{
  "score": 80,
  "analysis": "Professional analysis here",
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["gap1", "gap2"],
  "recommendation": "hire",
  "fitScore": {
    "technical": 80,
    "experience": 75,
    "cultural": 85
  },
  "suggestedRole": "role title"
}`;

  return askClaudeJSON(prompt, 1200);
};

// HR Chatbot
const HR_SYSTEM = `You are ARIA, the intelligent HR assistant for FWC IT Services Pvt. Ltd.
Be helpful, professional, concise, and empathetic.

Company Policies:
- Annual leave: 18 days/year
- Sick leave: 12 days/year
- Casual leave: 6 days/year
- Work hours: 9:00 AM – 6:00 PM, Monday to Friday
- Salary credited: Last working day of each month
- Notice period: 90 days
- Probation: 3 months
- Starting CTC: ₹10 LPA post training
- Training bond: 3 years mandatory`;

export const chatWithHR = async (messages) => {
  const response = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1200,
    system: HR_SYSTEM,
    messages
  });

  return response.content?.[0]?.text || 'Sorry, I could not generate a response.';
};

// Performance Analyzer
export const analysePerformance = async (employee, kpis, period, year) => {
  const kpiText = kpis.map(k =>
    `• ${k.name}: Target=${k.target}, Actual=${k.actual}, Score=${k.score}/10, Weight=${k.weight || 25}%`
  ).join('\n');

  const prompt = `You are an expert HR performance consultant. Return ONLY valid JSON.

EMPLOYEE: ${employee.firstName} ${employee.lastName}
DEPARTMENT: ${employee.department}
DESIGNATION: ${employee.designation}
REVIEW PERIOD: ${period} ${year}

KPI PERFORMANCE:
${kpiText}

Return ONLY this JSON:
{
  "overallRating": 4.2,
  "weightedScore": 84,
  "review": "Professional performance review here",
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2"],
  "goals": ["goal1", "goal2"],
  "promotionReadiness": "ready",
  "recommendations": "Next steps here"
}`;

  return askClaudeJSON(prompt, 1500);
};

// Leave Risk Predictor
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

  const prompt = `Analyze this employee's attendance and return ONLY valid JSON.

EMPLOYEE: ${employee.firstName} ${employee.lastName}
DEPARTMENT: ${employee.department}
SUMMARY: ${JSON.stringify(summary)}

Return ONLY this JSON:
{
  "riskLevel": "low",
  "riskScore": 20,
  "pattern": "Observed attendance pattern",
  "prediction": "Likely next-month behaviour",
  "rootCauses": ["cause1", "cause2"],
  "recommendations": ["action1", "action2"],
  "burnoutRisk": "low"
}`;

  return askClaudeJSON(prompt, 800);
};

// Interview Conversation Analyzer
export const analyzeInterviewConversation = async (transcript, candidateName, jobTitle) => {
  const prompt = `You are an expert interview analyst. Analyze this interview transcript and return ONLY valid JSON.

CANDIDATE: ${candidateName}
ROLE: ${jobTitle}

TRANSCRIPT:
${transcript}

Return ONLY this JSON:
{
  "overallScore": 80,
  "communicationScore": 85,
  "technicalScore": 78,
  "confidenceScore": 82,
  "cultureFitScore": 80,
  "summary": "3-4 sentence professional assessment",
  "keyStrengths": ["strength1", "strength2", "strength3"],
  "redFlags": ["concern1", "concern2"],
  "standoutMoments": ["moment1", "moment2"],
  "recommendation": "hire",
  "nextSteps": "Recommended next action",
  "sentimentAnalysis": {
    "positive": 70,
    "neutral": 25,
    "negative": 5
  }
}`;

  return askClaudeJSON(prompt, 1500);
};

// Interview Question Generator
export const generateInterviewQuestions = async (jobTitle, department, skills, experienceLevel) => {
  const prompt = `You are a senior technical interviewer. Generate a structured interview script and return ONLY valid JSON.

ROLE: ${jobTitle}
DEPARTMENT: ${department}
SKILLS: ${skills.join(', ')}
LEVEL: ${experienceLevel}

Return ONLY this JSON:
{
  "opening": "Warm opening statement",
  "questions": [
    {
      "category": "technical",
      "question": "Interview question",
      "followUp": "Follow-up question",
      "goodAnswer": "Strong answer explanation",
      "redFlag": "Weak answer warning"
    }
  ],
  "closing": "Professional closing statement",
  "evaluationCriteria": ["criterion1", "criterion2", "criterion3"]
}

Generate exactly 8 questions.`;

  return askClaudeJSON(prompt, 2000);
};

// Voice Screening Evaluator
export const evaluateVoiceScreening = async (responses, candidateName, jobTitle) => {
  const formatted = responses
    .map((r, i) => `Q${i + 1}: ${r.question}\nA${i + 1}: ${r.answer}`)
    .join('\n\n');

  const prompt = `You are an AI recruiter. Evaluate these screening responses and return ONLY valid JSON.

CANDIDATE: ${candidateName}
ROLE: ${jobTitle}

RESPONSES:
${formatted}

Return ONLY this JSON:
{
  "screeningScore": 80,
  "verdict": "proceed",
  "summary": "2-3 sentence screening summary",
  "positives": ["positive1", "positive2"],
  "concerns": ["concern1"],
  "recommendedInterviewType": "technical",
  "notesForHR": "Internal notes"
}`;

  return askClaudeJSON(prompt, 1000);
};