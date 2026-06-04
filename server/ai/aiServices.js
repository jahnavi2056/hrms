// MOCK AI SERVICES FOR DEMO VIDEO
// No Claude / Gemini / OpenAI API key required

const wait = (ms = 1200) => new Promise((resolve) => setTimeout(resolve, ms));

// AI FEATURE 1: Resume Screener
export const screenResume = async (resumeText, job = {}) => {
  await wait();

  return {
    score: 91,
    analysis:
      "Candidate demonstrates strong expertise in React, Node.js, MongoDB, and AI-powered application development. The profile closely matches the Senior AI Developer role and shows strong project-based experience.",
    strengths: [
      "Strong Full Stack Development skills",
      "Good AI/ML project exposure",
      "Excellent problem-solving ability",
      "Relevant HRMS and recruitment domain understanding"
    ],
    weaknesses: [
      "Limited cloud architecture exposure",
      "Can improve advanced system design knowledge"
    ],
    recommendation: "hire",
    fitScore: {
      technical: 94,
      experience: 86,
      cultural: 90
    },
    suggestedRole: job?.title || "Senior AI Developer"
  };
};

// AI FEATURE 2: HR Chatbot
export const chatWithHR = async (messages = []) => {
  await wait();

  const lastMessage =
    messages[messages.length - 1]?.content?.toLowerCase() || "";

  if (lastMessage.includes("leave")) {
    return `✅ **Leave Policy**

FWC provides the following leave benefits:

• Annual Leave: 18 days per year  
• Sick Leave: 12 days per year  
• Casual Leave: 6 days per year  

You can apply for leave from the Leave Management section. Your manager will review and approve the request.`;
  }

  if (lastMessage.includes("salary") || lastMessage.includes("payroll")) {
    return `💰 **Payroll Information**

• Salary is credited on the last working day of every month  
• Payslips are available in the Payroll module  
• Tax and deduction details can be downloaded from the employee portal`;
  }

  if (lastMessage.includes("notice")) {
    return `📌 **Notice Period Policy**

The standard notice period at FWC IT Services is **90 days** for all employees.`;
  }

  if (lastMessage.includes("work from home") || lastMessage.includes("wfh")) {
    return `🏠 **Work From Home Policy**

Work from home can be requested based on project requirements and manager approval. Employees must maintain availability during official working hours.`;
  }

  if (lastMessage.includes("performance")) {
    return `📊 **Performance Review Process**

Performance reviews are based on:

• Task completion rate  
• Work quality  
• Team collaboration  
• Punctuality  
• Goal achievement  

AI-generated insights help managers identify strengths, improvement areas, and promotion readiness.`;
  }

  if (lastMessage.includes("benefits")) {
    return `🎁 **Employee Benefits**

FWC offers:

• Health insurance  
• Paid leaves  
• Performance-based hikes  
• Career growth opportunities  
• Training and upskilling programs`;
  }

  if (lastMessage.includes("esop")) {
    return `📈 **ESOP Program**

Eligible employees may receive ESOP benefits based on performance, tenure, and company policy. HR will share eligibility details during review cycles.`;
  }

  return `Hello! I'm **ARIA**, your AI HR Assistant. 👋

I can help you with:

• Leave policies  
• Attendance rules  
• Payroll queries  
• Performance reviews  
• Recruitment process  
• Company policies`;
};

// AI FEATURE 3: Performance Analyser
export const analysePerformance = async (
  employee = {},
  kpis = [],
  period = "Annual",
  year = new Date().getFullYear()
) => {
  await wait();

  const avgScore =
    kpis.length > 0
      ? Math.round(
          (kpis.reduce((sum, kpi) => sum + Number(kpi.score || 0), 0) /
            kpis.length) *
            10
        )
      : 92;

  return {
    overallRating: 4.7,
    weightedScore: avgScore || 92,
    review:
      `${employee?.firstName || "The employee"} has shown excellent performance during ${period} ${year}. The employee demonstrates strong task ownership, good work quality, and consistent collaboration with the team. Overall performance indicates strong growth potential and readiness for higher responsibilities.`,
    strengths: [
      "Excellent task completion rate",
      "Strong team collaboration",
      "Consistent punctuality and reliability",
      "Good ownership of assigned work"
    ],
    improvements: [
      "Can take more leadership initiatives",
      "Should improve technical documentation"
    ],
    goals: [
      "Lead at least one major project in the next review cycle",
      "Mentor junior team members",
      "Complete one advanced technical certification"
    ],
    promotionReadiness: "highly_ready",
    recommendations:
      "The employee is recommended for recognition, bonus consideration, and future leadership responsibilities."
  };
};

// AI FEATURE 4: Leave Risk Predictor
export const predictLeaveRisk = async (employee = {}, attendanceHistory = []) => {
  await wait();

  const absent = attendanceHistory.filter((a) => a.status === "absent").length;
  const late = attendanceHistory.filter((a) => a.status === "late").length;

  let riskLevel = "low";
  let riskScore = 18;

  if (absent >= 5 || late >= 8) {
    riskLevel = "high";
    riskScore = 78;
  } else if (absent >= 2 || late >= 4) {
    riskLevel = "medium";
    riskScore = 45;
  }

  return {
    riskLevel,
    riskScore,
    pattern:
      "Attendance pattern is mostly stable with no major absenteeism concerns. Minor late entries may require monitoring.",
    prediction:
      "Employee is expected to maintain regular attendance in the upcoming month.",
    rootCauses: [
      "Workload pressure during peak project timelines",
      "Possible commute or schedule-related delays"
    ],
    recommendations: [
      "Continue employee engagement activities",
      "Manager should conduct a light check-in if late marks increase",
      "Maintain healthy workload balance"
    ],
    burnoutRisk: riskLevel === "high" ? "medium" : "low"
  };
};

// AI FEATURE 5: Interview Analyzer
export const analyzeInterview = async (interview = {}) => {
  await wait();

  return {
    overallScore: 88,
    communicationScore: 91,
    technicalScore: 86,
    confidenceScore: 89,
    cultureFitScore: 90,
    summary:
      "The candidate communicated clearly and showed strong technical understanding. Answers were structured, confident, and relevant to the role. The candidate appears suitable for the next hiring stage.",
    keyStrengths: [
      "Clear communication",
      "Strong React and Node.js knowledge",
      "Good problem-solving approach",
      "Positive attitude"
    ],
    redFlags: [
      "Needs deeper system design explanation",
      "Limited cloud deployment exposure"
    ],
    recommendation: "hire",
    nextSteps:
      "Proceed to the final technical or HR discussion.",
    fitAnalysis:
      "The candidate is a strong fit for the role based on communication, technical depth, and cultural alignment."
  };
};

// AI FEATURE 6: Interview Question Generator
export const generateInterviewQuestions = async (
  jobTitle = "Senior AI Developer",
  department = "Engineering",
  type = "technical"
) => {
  await wait();

  return {
    opening:
      `Welcome to the ${jobTitle} interview for the ${department} department. We will begin with your background, then move to technical and problem-solving questions.`,
    questions: [
      {
        category: "technical",
        question: "Explain React Hooks and why they are used.",
        followUp: "How does useEffect work with dependency arrays?",
        goodAnswer:
          "Candidate explains useState, useEffect, component lifecycle replacement, and dependency handling.",
        redFlag:
          "Candidate cannot explain basic hook usage."
      },
      {
        category: "technical",
        question: "How do you secure REST APIs in Node.js?",
        followUp: "Explain JWT authentication flow.",
        goodAnswer:
          "Candidate explains authentication, authorization, token validation, middleware, and secure storage.",
        redFlag:
          "Candidate is unaware of token-based authentication."
      },
      {
        category: "technical",
        question: "How does MongoDB differ from SQL databases?",
        followUp: "When would you use indexing in MongoDB?",
        goodAnswer:
          "Candidate explains collections, documents, schema flexibility, and performance optimization.",
        redFlag:
          "Candidate cannot explain NoSQL basics."
      },
      {
        category: "situational",
        question: "How would you handle a production bug during deployment?",
        followUp: "How would you communicate the issue to your team?",
        goodAnswer:
          "Candidate explains debugging, rollback, logs, monitoring, and clear communication.",
        redFlag:
          "Candidate has no structured debugging approach."
      },
      {
        category: "behavioral",
        question: "Tell me about a challenging project you worked on.",
        followUp: "What was your exact contribution?",
        goodAnswer:
          "Candidate explains the situation, task, action, and result clearly.",
        redFlag:
          "Candidate gives vague answers without ownership."
      },
      {
        category: "technical",
        question: "How can AI be used in HRMS platforms?",
        followUp: "Give examples of AI features in recruitment and performance reviews.",
        goodAnswer:
          "Candidate explains resume screening, chatbot, interview analysis, attrition prediction, and performance insights.",
        redFlag:
          "Candidate cannot connect AI with business use cases."
      }
    ],
    closing:
      "Thank you for your time. Our team will review your responses and get back to you regarding the next steps.",
    evaluationCriteria: [
      "Technical Knowledge",
      "Problem Solving",
      "Communication",
      "Culture Fit",
      "Role Readiness"
    ]
  };
};

// AI FEATURE 7: Candidate Screen for Interview
export const screenCandidateForInterview = async (candidate = {}, job = {}) => {
  await wait();

  return {
    screeningScore: 87,
    verdict: "proceed",
    summary:
      `${candidate?.name || "The candidate"} shows strong alignment with the ${job?.title || "selected"} role. The profile includes relevant skills, good project exposure, and suitable experience for interview consideration.`,
    positives: [
      "Relevant technical skills",
      "Good project experience",
      "Strong communication potential"
    ],
    concerns: [
      "Needs deeper advanced architecture exposure"
    ],
    recommendedInterviewType: "technical",
    estimatedSalaryRange: "8-12 LPA",
    notesForInterviewer:
      "Focus on React, Node.js, MongoDB, AI project experience, and real-time problem-solving ability."
  };
};

export default {
  screenResume,
  chatWithHR,
  analysePerformance,
  predictLeaveRisk,
  analyzeInterview,
  generateInterviewQuestions,
  screenCandidateForInterview
};