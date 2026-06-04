import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../services/api.js';
import toast from 'react-hot-toast';

/* ── Micro components ─────────────────────────────────────────────────────── */
const ScoreRing = ({ score, size = 80, color = '#2563eb' }) => {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f0f4ff" strokeWidth={8}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={8}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s ease' }}/>
    </svg>
  );
};

const ScoreCard = ({ label, score, color }) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col items-center gap-2 shadow-sm">
    <div className="relative">
      <ScoreRing score={score} size={72} color={color}/>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-black" style={{ color }}>{score}</span>
      </div>
    </div>
    <p className="text-xs font-semibold text-gray-500 text-center">{label}</p>
  </div>
);

const Pill = ({ children, color = 'blue' }) => {
  const map = { blue:'bg-blue-50 text-blue-700 border-blue-100', green:'bg-emerald-50 text-emerald-700 border-emerald-100', red:'bg-red-50 text-red-700 border-red-100', amber:'bg-amber-50 text-amber-700 border-amber-100', purple:'bg-purple-50 text-purple-700 border-purple-100' };
  return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${map[color]}`}>{children}</span>;
};

const SectionCard = ({ title, icon, children, accent = 'blue' }) => {
  const accents = { blue:'border-l-blue-500', green:'border-l-emerald-500', amber:'border-l-amber-500', red:'border-l-red-500', purple:'border-l-purple-500' };
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden`}>
      <div className={`px-5 py-4 border-l-4 ${accents[accent]} bg-gray-50/50 flex items-center gap-2`}>
        <span className="text-lg">{icon}</span>
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
};

/* ── Tab 1: AI Interview Transcript Analyzer ─────────────────────────────── */
function TranscriptAnalyzer() {
  const [selectedInterview, setSelectedInterview] = useState('');
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: interviews = [] } = useQuery({
    queryKey: ['interviews-for-analysis'],
    queryFn: () => api.get('/interviews', { params: { status: 'scheduled' } }).then(r => r.data),
  });

  const analyze = async () => {
    if (!transcript.trim()) return toast.error('Paste the interview transcript first');
    if (!selectedInterview) return toast.error('Select an interview');

    setLoading(true);
    setResult(null);

    setTimeout(() => {
      const mockAnalysis = {
        overallScore: 95,
        communicationScore: 94,
        technicalScore: 97,
        confidenceScore: 93,
        cultureFitScore: 92,
        recommendation: 'hire',
        summary:
          'The candidate demonstrated exceptional AI expertise, strong system design knowledge, and excellent communication skills. Responses reflected deep understanding of LLMs, RAG, AI architecture, and enterprise-scale AI deployment. The candidate is highly suitable for the Senior AI Developer role.',
        keyStrengths: [
          'Advanced AI/ML knowledge',
          'Strong full-stack development skills',
          'Excellent understanding of LLM and RAG systems',
          'Good system design and cloud deployment awareness',
          'Leadership and mentoring potential'
        ],
        redFlags: [
          'Can explain MLOps monitoring and model observability in more depth'
        ],
        sentimentAnalysis: {
          positive: 82,
          neutral: 15,
          negative: 3
        },
        nextSteps: 'Proceed directly to final management or HR round.',
        fitAnalysis:
          'Candidate is a strong fit for the Senior AI Developer role with both technical depth and leadership readiness.'
      };

      setResult(mockAnalysis);
      setLoading(false);
      toast.success('Analysis complete!');
    }, 1800);
  };

  const recColor = { hire:'green', maybe:'amber', reject:'red' };
  const verdictLabel = { hire:'✅ Recommend Hire', maybe:'🤔 Consider Further', reject:'❌ Do Not Proceed' };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input panel */}
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-1">AI Transcript Analyzer</h2>
            <p className="text-sm text-gray-500">Paste or type an interview transcript to get instant AI-powered insights.</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Select Interview</label>
            <select className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-gray-50"
              value={selectedInterview} onChange={e => setSelectedInterview(e.target.value)}>
              <option value="">Choose interview...</option>
              {interviews.map(iv => (
                <option key={iv._id} value={iv._id}>{iv.candidate?.name} — {iv.job?.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Interview Transcript</label>
            <textarea
              className="w-full border border-gray-200 rounded-xl px-3.5 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-gray-50 resize-none leading-relaxed"
              rows={12} placeholder={`Paste transcript here...\n\nExample:\nInterviewer: Tell me about yourself.\nCandidate: I have 4 years of experience in React...\n\nInterviewer: What's your approach to state management?\nCandidate: I prefer using Zustand for...`}
              value={transcript} onChange={e => setTranscript(e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">{transcript.length} characters</p>
          </div>
          <button onClick={analyze} disabled={loading || !transcript.trim() || !selectedInterview}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)', color: 'white' }}>
            {loading ? (
              <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Analyzing with AI...</>
            ) : <><span>🧠</span> Analyze Interview</>}
          </button>
        </div>
      </div>

      {/* Result panel */}
      <div className="space-y-4">
        {!result && !loading && (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100 p-8 text-center h-full flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white border border-blue-100 shadow-sm flex items-center justify-center text-3xl">🧠</div>
            <div>
              <p className="font-bold text-gray-800 mb-1">AI Analysis Ready</p>
              <p className="text-sm text-gray-500 max-w-xs">Paste a transcript and click Analyze to get detailed candidate insights, scores, and recommendations.</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {['Communication Score','Technical Depth','Confidence Level','Culture Fit','Hire Recommendation'].map(f => (
                <span key={f} className="text-xs bg-white border border-blue-100 text-blue-600 px-3 py-1 rounded-full">{f}</span>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin"/>
            </div>
            <p className="font-semibold text-gray-700">Analyzing interview...</p>
            <p className="text-sm text-gray-400">Demo AI is evaluating communication, technical depth, and culture fit</p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {/* Verdict banner */}
            <div className={`rounded-2xl p-5 border-2 ${result.recommendation === 'hire' ? 'bg-emerald-50 border-emerald-200' : result.recommendation === 'reject' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">AI Verdict</p>
                  <p className={`text-xl font-black ${result.recommendation === 'hire' ? 'text-emerald-700' : result.recommendation === 'reject' ? 'text-red-700' : 'text-amber-700'}`}>
                    {verdictLabel[result.recommendation]}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Overall Score</p>
                  <p className={`text-4xl font-black ${result.recommendation === 'hire' ? 'text-emerald-600' : result.recommendation === 'reject' ? 'text-red-600' : 'text-amber-600'}`}>
                    {result.overallScore}
                  </p>
                </div>
              </div>
            </div>

            {/* Score breakdown */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Score Breakdown</p>
              <div className="grid grid-cols-4 gap-3">
                <ScoreCard label="Communication" score={result.communicationScore} color="#2563eb"/>
                <ScoreCard label="Technical" score={result.technicalScore} color="#7c3aed"/>
                <ScoreCard label="Confidence" score={result.confidenceScore} color="#059669"/>
                <ScoreCard label="Culture Fit" score={result.cultureFitScore} color="#d97706"/>
              </div>
            </div>

            {/* Summary */}
            <SectionCard title="Summary" icon="📋" accent="blue">
              <p className="text-sm text-gray-700 leading-relaxed">{result.summary}</p>
            </SectionCard>

            <div className="grid grid-cols-2 gap-4">
              <SectionCard title="Key Strengths" icon="💪" accent="green">
                <ul className="space-y-2">
                  {result.keyStrengths?.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span>{s}
                    </li>
                  ))}
                </ul>
              </SectionCard>
              <SectionCard title="Red Flags" icon="⚠️" accent="red">
                <ul className="space-y-2">
                  {result.redFlags?.length ? result.redFlags.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-red-500 mt-0.5 flex-shrink-0">!</span>{f}
                    </li>
                  )) : <p className="text-sm text-gray-400 italic">No significant red flags</p>}
                </ul>
              </SectionCard>
            </div>

            {/* Sentiment */}
            <SectionCard title="Sentiment Analysis" icon="📊" accent="purple">
              <div className="space-y-3">
                {[['Positive', result.sentimentAnalysis?.positive, '#059669'], ['Neutral', result.sentimentAnalysis?.neutral, '#6b7280'], ['Negative', result.sentimentAnalysis?.negative, '#dc2626']].map(([label, val, color]) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-gray-600">{label}</span>
                      <span className="font-bold" style={{ color }}>{val}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${val}%`, background: color }}/>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Next Steps</p>
              <p className="text-sm text-blue-800">{result.nextSteps}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Tab 2: AI Voice Screening ───────────────────────────────────────────── */
const SCREENING_QUESTIONS = [
  'Tell me briefly about yourself and your background.',
  'Why are you interested in this particular role?',
  'What are your strongest technical skills?',
  'Where do you see yourself in 3 years?',
  'What is your current notice period and expected salary?',
];

function VoiceScreening() {
  const [candidateId, setCandidateId] = useState('');
  const [step, setStep] = useState('setup');
  const [currentQ, setCurrentQ] = useState(0);
  const [responses, setResponses] = useState([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const recognitionRef = useRef(null);

  const { data: candidates = [] } = useQuery({
    queryKey: ['candidates-for-screening'],
    queryFn: async () => {
      const jobs = await api.get('/recruitment/jobs').then(r => r.data);
      const all = [];
      for (const j of (jobs || []).slice(0, 10)) {
        const c = await api.get(`/recruitment/jobs/${j._id}/candidates`).then(r => r.data).catch(() => []);
        all.push(...c.map(x => ({ ...x, jobTitle: j.title })));
      }
      return all;
    },
  });

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const r = new SR(); r.lang = 'en-IN'; r.continuous = false; r.interimResults = false;
    r.onresult = e => { setCurrentAnswer(prev => prev + ' ' + e.results[0][0].transcript); setIsListening(false); };
    r.onerror = () => setIsListening(false);
    r.onend = () => setIsListening(false);
    recognitionRef.current = r;
  }, []);

  const speak = (text, onEnd) => {
    if (!('speechSynthesis' in window)) { onEnd?.(); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-IN'; u.rate = 0.95; u.pitch = 1;
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => { setIsSpeaking(false); onEnd?.(); };
    window.speechSynthesis.speak(u);
  };

  const startScreening = () => {
    if (!candidateId) return toast.error('Select a candidate');
    setStep('screening'); setCurrentQ(0); setResponses([]); setCurrentAnswer('');
    speak(`Starting AI voice screening. ${SCREENING_QUESTIONS[0]}`);
  };

  const nextQuestion = () => {
    if (!currentAnswer.trim()) return toast.error('Please provide an answer');
    const updated = [...responses, { question: SCREENING_QUESTIONS[currentQ], answer: currentAnswer.trim() }];
    setResponses(updated);
    setCurrentAnswer('');
    if (currentQ < SCREENING_QUESTIONS.length - 1) {
      const next = currentQ + 1;
      setCurrentQ(next);
      speak(SCREENING_QUESTIONS[next]);
    } else {
      setStep('processing');
      submitScreening(updated);
    }
  };

  const submitScreening = async (resp) => {
    setLoading(true);

    setTimeout(() => {
      const mockResult = {
        verdict: 'proceed',
        screeningScore: 92,
        summary:
          'Candidate gave confident and relevant answers. Communication, technical clarity, and role understanding are strong for the Senior AI Developer position.',
        positives: [
          'Strong AI and full-stack knowledge',
          'Clear communication',
          'Good confidence level',
          'Relevant project experience'
        ],
        concerns: [
          'Can explain MLOps monitoring in more depth'
        ],
        recommendedInterviewType: 'final_hr_round',
        notesForHR:
          'Candidate is suitable for the next interview round. Discuss salary expectation, notice period, and leadership experience.'
      };

      setResult(mockResult);
      setStep('result');
      setLoading(false);
      toast.success('Voice screening completed!');
      speak('Screening complete. This candidate has been recommended to proceed.');
    }, 1800);
  };

  const toggleListen = () => {
    if (!recognitionRef.current) return toast.error('Voice not supported');
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); }
    else { recognitionRef.current.start(); setIsListening(true); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {step === 'setup' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-4xl" style={{ background: 'linear-gradient(135deg,#eff6ff,#f5f3ff)' }}>🎙️</div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">AI Voice Screening</h2>
            <p className="text-sm text-gray-500 max-w-md mx-auto">Conduct an AI-powered voice screening session. The AI will ask questions, listen to responses, and provide an instant evaluation report.</p>
          </div>
          <div className="max-w-sm mx-auto">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 text-left">Select Candidate</label>
            <select className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-gray-50"
              value={candidateId} onChange={e => setCandidateId(e.target.value)}>
              <option value="">Choose candidate...</option>
              {candidates.map(c => <option key={c._id} value={c._id}>{c.name} — {c.jobTitle}</option>)}
            </select>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {SCREENING_QUESTIONS.map((q, i) => (
              <span key={i} className="text-xs bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1.5 rounded-lg">Q{i+1}: {q.substring(0,40)}...</span>
            ))}
          </div>
          <button onClick={startScreening} disabled={!candidateId}
            className="px-8 py-3.5 rounded-xl font-semibold text-white disabled:opacity-40 transition-all hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)' }}>
            Start AI Voice Screening
          </button>
        </div>
      )}

      {step === 'screening' && (
        <div className="space-y-5">
          {/* Progress */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">Screening Progress</span>
              <span className="text-sm font-bold text-blue-600">{currentQ + 1} / {SCREENING_QUESTIONS.length}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${((currentQ) / SCREENING_QUESTIONS.length) * 100}%` }}/>
            </div>
          </div>

          {/* Question */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100 p-6">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-all ${isSpeaking ? 'animate-pulse' : ''}`}
                style={{ background: 'white', border: '2px solid #bfdbfe', boxShadow: isSpeaking ? '0 0 20px rgba(37,99,235,0.3)' : 'none' }}>
                {isSpeaking ? '🔊' : '🤖'}
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-2">Question {currentQ + 1}</p>
                <p className="text-base font-semibold text-gray-900 leading-relaxed">{SCREENING_QUESTIONS[currentQ]}</p>
                <button onClick={() => speak(SCREENING_QUESTIONS[currentQ])} className="mt-2 text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1">
                  🔊 Repeat question
                </button>
              </div>
            </div>
          </div>

          {/* Answer input */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Candidate Response</label>
              <button onClick={toggleListen}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${isListening ? 'bg-red-50 text-red-600 border-2 border-red-200 animate-pulse' : 'bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100'}`}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
                </svg>
                {isListening ? 'Listening...' : 'Voice Input'}
              </button>
            </div>
            <textarea
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-gray-50 resize-none"
              rows={5} placeholder="Type or use voice input for candidate response..."
              value={currentAnswer} onChange={e => setCurrentAnswer(e.target.value)}
            />
            <button onClick={nextQuestion} disabled={!currentAnswer.trim()}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white disabled:opacity-40 transition-all"
              style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)' }}>
              {currentQ < SCREENING_QUESTIONS.length - 1 ? `Next Question →` : '✓ Complete Screening'}
            </button>
          </div>

          {/* Past answers */}
          {responses.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Previous Responses</p>
              <div className="space-y-3">
                {responses.map((r, i) => (
                  <div key={i} className="text-sm">
                    <p className="font-semibold text-gray-700 mb-1">Q{i+1}: {r.question}</p>
                    <p className="text-gray-500 bg-gray-50 rounded-lg p-2 text-xs leading-relaxed">{r.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {step === 'processing' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center space-y-5">
          <div className="relative w-20 h-20 mx-auto">
            <div className="w-20 h-20 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin"/>
            <div className="absolute inset-0 flex items-center justify-center text-2xl">🧠</div>
          </div>
          <p className="text-lg font-bold text-gray-900">AI Evaluating Responses...</p>
          <p className="text-sm text-gray-400">Demo AI is analyzing communication quality, relevance, and cultural fit</p>
        </div>
      )}

      {step === 'result' && result && (
        <div className="space-y-5">
          {/* Verdict */}
          <div className={`rounded-2xl p-6 border-2 ${result.verdict === 'proceed' ? 'bg-emerald-50 border-emerald-200' : result.verdict === 'reject' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Screening Verdict</p>
                <p className={`text-2xl font-black ${result.verdict === 'proceed' ? 'text-emerald-700' : result.verdict === 'reject' ? 'text-red-700' : 'text-amber-700'}`}>
                  {result.verdict === 'proceed' ? '✅ Proceed to Interview' : result.verdict === 'reject' ? '❌ Do Not Proceed' : '⏸ On Hold'}
                </p>
                <p className="text-sm text-gray-600 mt-1">{result.summary}</p>
              </div>
              <div className="text-center pl-6 border-l border-current border-opacity-20">
                <p className={`text-5xl font-black ${result.verdict === 'proceed' ? 'text-emerald-600' : result.verdict === 'reject' ? 'text-red-600' : 'text-amber-600'}`}>{result.screeningScore}</p>
                <p className="text-xs text-gray-500 font-semibold">Score</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SectionCard title="Positives" icon="✅" accent="green">
              <ul className="space-y-2">
                {result.positives?.map((p, i) => <li key={i} className="flex gap-2 text-sm text-gray-700"><span className="text-emerald-500 flex-shrink-0">+</span>{p}</li>)}
              </ul>
            </SectionCard>
            <SectionCard title="Concerns" icon="⚠️" accent="amber">
              <ul className="space-y-2">
                {result.concerns?.length ? result.concerns.map((c, i) => <li key={i} className="flex gap-2 text-sm text-gray-700"><span className="text-amber-500 flex-shrink-0">!</span>{c}</li>)
                  : <p className="text-sm text-gray-400 italic">No major concerns</p>}
              </ul>
            </SectionCard>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Recommended Next Step</p>
              <p className="text-sm font-bold text-blue-900 capitalize">{result.recommendedInterviewType?.replace(/_/g, ' ')}</p>
            </div>
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Notes for HR</p>
              <p className="text-sm text-gray-700">{result.notesForHR}</p>
            </div>
          </div>

          <button onClick={() => { setStep('setup'); setResult(null); setCandidateId(''); }}
            className="w-full py-3 rounded-xl font-semibold text-sm border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
            ← Start New Screening
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Tab 3: AI Question Generator ────────────────────────────────────────── */
function QuestionGenerator() {
  const [jobId, setJobId] = useState('');
  const [level, setLevel] = useState('mid');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeQ, setActiveQ] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const { data: jobs = [] } = useQuery({
    queryKey: ['jobs-for-questions'],
    queryFn: () => api.get('/recruitment/jobs').then(r => r.data),
  });

  const generate = async () => {
    if (!jobId) return toast.error('Select a job');

    setLoading(true);
    setResult(null);

    setTimeout(() => {
      const mockScript = {
        opening:
          'Welcome to the Senior AI Developer interview. We will discuss your AI experience, full-stack skills, system design knowledge, and leadership readiness.',
        questions: [
          {
            category: 'technical',
            question: 'Explain the difference between LLM and RAG.',
            followUp: 'How would you implement RAG in an HRMS platform?',
            goodAnswer:
              'Candidate explains that an LLM generates responses from trained knowledge, while RAG retrieves external documents or database context before answering.',
            redFlag:
              'Candidate cannot explain retrieval, embeddings, or vector databases.'
          },
          {
            category: 'technical',
            question: 'How would you design an AI-powered resume screening system?',
            followUp: 'How would you reduce bias in AI screening?',
            goodAnswer:
              'Candidate explains resume parsing, skill extraction, semantic matching, scoring, explainability, and bias control.',
            redFlag:
              'Candidate only explains keyword matching.'
          },
          {
            category: 'situational',
            question: 'How would you scale an AI recruitment platform?',
            followUp: 'Which backend and deployment strategy would you use?',
            goodAnswer:
              'Candidate discusses APIs, queues, caching, database optimization, cloud deployment, monitoring, and auto-scaling.',
            redFlag:
              'Candidate gives only frontend-level explanation.'
          },
          {
            category: 'technical',
            question: 'What are embeddings in AI applications?',
            followUp: 'Where would you store embeddings?',
            goodAnswer:
              'Candidate explains vector representation, semantic similarity, and vector databases like FAISS, Pinecone, or Chroma.',
            redFlag:
              'Candidate does not understand semantic search.'
          },
          {
            category: 'behavioral',
            question: 'Tell me about a challenging AI project you worked on.',
            followUp: 'What was your exact contribution?',
            goodAnswer:
              'Candidate explains the problem, action, tools used, and final impact clearly.',
            redFlag:
              'Candidate gives vague answers without ownership.'
          },
          {
            category: 'culture',
            question: 'How would you mentor junior developers in an AI project?',
            followUp: 'How would you review their code and model outputs?',
            goodAnswer:
              'Candidate mentions mentoring, code reviews, documentation, testing, responsible AI, and teamwork.',
            redFlag:
              'Candidate has no leadership or review approach.'
          }
        ],
        closing:
          'Thank you for attending the interview. Our team will evaluate your responses and get back to you with the next steps.',
        evaluationCriteria: [
          'AI/ML Knowledge',
          'LLM and RAG Understanding',
          'Full Stack Development',
          'System Design',
          'Communication',
          'Leadership Readiness'
        ]
      };

      setResult(mockScript);
      setLoading(false);
      toast.success('Interview script generated!');
    }, 1800);
  };

  const speak = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-IN'; u.rate = 0.9;
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const catColor = { technical:'blue', behavioral:'purple', situational:'amber', culture:'green' };
  const catIcon = { technical:'⚙️', behavioral:'🧠', situational:'🎯', culture:'🤝' };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Generate Interview Script</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Job Position</label>
            <select className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-gray-50"
              value={jobId} onChange={e => setJobId(e.target.value)}>
              <option value="">Select job...</option>
              {jobs.map(j => <option key={j._id} value={j._id}>{j.title} — {j.department}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Experience Level</label>
            <select className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-gray-50"
              value={level} onChange={e => setLevel(e.target.value)}>
              {[['junior','Junior (0-2 yrs)'],['mid','Mid-level (2-5 yrs)'],['senior','Senior (5+ yrs)'],['lead','Lead / Manager']].map(([v,l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={generate} disabled={!jobId || loading}
              className="w-full py-2.5 rounded-xl font-semibold text-sm text-white disabled:opacity-40 flex items-center justify-center gap-2 transition-all"
              style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)' }}>
              {loading ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Generating...</> : '🤖 Generate Script'}
            </button>
          </div>
        </div>
      </div>

      {result && (
        <div className="space-y-5">
          {/* Opening */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100 p-5 flex items-start gap-4">
            <span className="text-2xl flex-shrink-0">👋</span>
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Opening Statement</p>
              <p className="text-sm text-gray-800 leading-relaxed italic">"{result.opening}"</p>
              <button onClick={() => speak(result.opening)} className="mt-2 text-xs text-blue-500 hover:text-blue-700 font-medium">🔊 Listen</button>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Interview Questions ({result.questions?.length})</p>
            {result.questions?.map((q, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <button onClick={() => setActiveQ(activeQ === i ? null : i)} className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-gray-50 transition-colors">
                  <span className={`text-lg flex-shrink-0`}>{catIcon[q.category] || '❓'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Pill color={catColor[q.category] || 'blue'}>{q.category}</Pill>
                      <span className="text-xs text-gray-400">Q{i+1}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{q.question}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={e => { e.stopPropagation(); speak(q.question); }} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors">🔊</button>
                    <svg className={`w-4 h-4 text-gray-400 transition-transform ${activeQ === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                  </div>
                </button>
                {activeQ === i && (
                  <div className="px-5 pb-5 pt-2 border-t border-gray-50 space-y-3">
                    <div className="bg-blue-50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-blue-600 mb-1">↪ Follow-up</p>
                      <p className="text-sm text-blue-800">{q.followUp}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-emerald-50 rounded-xl p-3">
                        <p className="text-xs font-semibold text-emerald-600 mb-1">✓ Good Answer</p>
                        <p className="text-xs text-emerald-800 leading-relaxed">{q.goodAnswer}</p>
                      </div>
                      <div className="bg-red-50 rounded-xl p-3">
                        <p className="text-xs font-semibold text-red-600 mb-1">⚠ Red Flag</p>
                        <p className="text-xs text-red-800 leading-relaxed">{q.redFlag}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Closing + criteria */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-100 p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">🎤 Closing Statement</p>
              <p className="text-sm text-gray-700 italic">"{result.closing}"</p>
              <button onClick={() => speak(result.closing)} className="mt-2 text-xs text-blue-500 font-medium hover:text-blue-700">🔊 Listen</button>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">📋 Evaluation Criteria</p>
              <ul className="space-y-2">
                {result.evaluationCriteria?.map((c, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold flex-shrink-0">{i+1}</span>{c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {!result && !loading && (
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border border-gray-100 p-10 text-center space-y-3">
          <div className="text-5xl">📝</div>
          <p className="font-bold text-gray-800">AI Interview Script Generator</p>
          <p className="text-sm text-gray-500">Select a job and experience level to generate a complete, tailored interview script with follow-up probes and evaluation criteria.</p>
        </div>
      )}
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────────────────────────── */
const TABS = [
  { id:'analyze', label:'Transcript Analyzer', icon:'🧠' },
  { id:'voice', label:'Voice Screening', icon:'🎙️' },
  { id:'questions', label:'Question Generator', icon:'📝' },
];

export default function AIInterviewPage() {
  const [tab, setTab] = useState('analyze');

  return (
    <div className="min-h-full" style={{ background: '#f8fafc' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
            style={{ background: 'linear-gradient(135deg,#eff6ff,#f5f3ff)', border: '1.5px solid #c7d2fe' }}>🤖</div>
          <div>
            <h1 className="text-xl font-black text-gray-900 flex items-center gap-2">
              AI Interview Intelligence
              <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background:'linear-gradient(135deg,rgba(37,99,235,0.1),rgba(124,58,237,0.1))', color:'#4f46e5', border:'1px solid rgba(99,102,241,0.2)' }}>Demo AI Mode</span>
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">AI-powered transcript analysis · Voice screening · Smart question generation</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-5 p-1 rounded-xl w-fit" style={{ background:'#f1f5f9' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 pb-8">
        {tab === 'analyze' && <TranscriptAnalyzer />}
        {tab === 'voice' && <VoiceScreening />}
        {tab === 'questions' && <QuestionGenerator />}
      </div>
    </div>
  );
}
