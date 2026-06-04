import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api.js';
import toast from 'react-hot-toast';
import { AIBadge, PageLoader } from '../components/ui/index.jsx';

export default function AIInterviewPage() {
  const qc = useQueryClient();
  const [activeInterview, setActiveInterview] = useState(null);
  const [activeTab, setActiveTab] = useState('analyze');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: interviews = [], isLoading } = useQuery({
    queryKey: ['interviews-ai'],
    queryFn: () => api.get('/interviews').then(r => r.data),
  });

  const completed = interviews.filter(i => i.status === 'completed');
  const scheduled = interviews.filter(i => i.status === 'scheduled');

  const runAI = async (action) => {
    if (!activeInterview) return toast.error('Select an interview first');
    setLoading(true);
    setResult(null);
    try {
      const method = action === 'generate' ? 'get' : 'post';
      const { data } = await api[method](`/ai/interview/${activeInterview._id}/${action}`);
      setResult({ type: action, data });
      toast.success('🤖 AI analysis complete!');
    } catch (e) {
      toast.error(e.response?.data?.error || 'AI error, try again');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-5 stagger">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="page-title">AI Interview</h1>
            <AIBadge label="Powered by Claude" />
          </div>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-3)' }}>
            Analyze interviews, generate questions & screen candidates with AI
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          ['Total Interviews', interviews.length, '🎯', 'text-blue-400'],
          ['Completed', completed.length, '✅', 'text-green-400'],
          ['Scheduled', scheduled.length, '📅', 'text-yellow-400'],
        ].map(([label, val, icon, color]) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: 'var(--text-3)' }}>{label}</p>
                <p className={`text-3xl font-black mt-1 ${color}`}>{val}</p>
              </div>
              <span className="text-3xl">{icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-5">
        {/* Interview List */}
        <div className="col-span-2 card p-4">
          <h3 className="font-semibold mb-3" style={{ color: 'var(--text-1)' }}>Select Interview</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {interviews.length === 0 && (
              <p className="text-sm text-center py-8" style={{ color: 'var(--text-4)' }}>No interviews yet.<br/>Schedule one from the Interviews page.</p>
            )}
            {interviews.map(iv => (
              <div
                key={iv._id}
                onClick={() => { setActiveInterview(iv); setResult(null); }}
                className={`p-3 rounded-xl cursor-pointer transition-all ${activeInterview?._id === iv._id ? 'border-brand-500 bg-brand-500/10' : 'hover:bg-white/5'}`}
                style={{ border: `1px solid ${activeInterview?._id === iv._id ? 'rgb(34,197,94)' : 'var(--border)'}` }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>
                    {iv.candidate?.name || 'Unknown'}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${iv.status === 'completed' ? 'text-green-400 bg-green-400/10' : 'text-blue-400 bg-blue-400/10'}`}>
                    {iv.status}
                  </span>
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>
                  {iv.job?.title} · {iv.type}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Panel */}
        <div className="col-span-3 card p-5">
          {!activeInterview ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <span className="text-5xl">🤖</span>
              <p className="text-sm" style={{ color: 'var(--text-3)' }}>Select an interview to use AI features</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <div>
                  <p className="font-semibold" style={{ color: 'var(--text-1)' }}>{activeInterview.candidate?.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-3)' }}>{activeInterview.job?.title} · {activeInterview.type}</p>
                </div>
              </div>

              {/* Action Tabs */}
              <div className="flex gap-2 mb-4">
                {[
                  { key: 'analyze', label: '📊 Analyze', disabled: activeInterview.status !== 'completed' },
                  { key: 'generate', label: '❓ Questions', disabled: false },
                  { key: 'screen', label: '🔍 Screen', disabled: false },
                ].map(({ key, label, disabled }) => (
                  <button
                    key={key}
                    onClick={() => { setActiveTab(key); setResult(null); }}
                    disabled={disabled}
                    title={disabled ? 'Only available for completed interviews' : ''}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${activeTab === key ? 'bg-brand-500 text-white' : ''}`}
                    style={{ background: activeTab === key ? undefined : 'var(--surface-2)', color: activeTab === key ? undefined : 'var(--text-2)' }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: 'var(--surface-2)', color: 'var(--text-3)' }}>
                {activeTab === 'analyze' && '📊 Analyze completed interview feedback with Claude AI to get scores, strengths, and hiring recommendation.'}
                {activeTab === 'generate' && '❓ Generate tailored interview questions for this role and interview type using Claude AI.'}
                {activeTab === 'screen' && '🔍 Pre-screen the candidate against the job requirements before the interview begins.'}
              </div>

              <button
                onClick={() => runAI(activeTab)}
                disabled={loading || (activeTab === 'analyze' && activeInterview.status !== 'completed')}
                className="btn-primary w-full mb-4 disabled:opacity-40"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Claude is thinking…
                  </span>
                ) : `🤖 Run AI ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
              </button>

              {/* Results */}
              {result && (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {result.type === 'analyze' && result.data.analysis && (
                    <>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          ['Overall', result.data.analysis.overallScore],
                          ['Technical', result.data.analysis.technicalScore],
                          ['Communication', result.data.analysis.communicationScore],
                        ].map(([label, score]) => (
                          <div key={label} className="p-3 rounded-xl text-center" style={{ background: 'var(--surface-2)' }}>
                            <p className="text-2xl font-black text-brand-400">{score}</p>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>{label}</p>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                        <p className="text-xs font-semibold mb-1 text-brand-400">SUMMARY</p>
                        <p className="text-sm" style={{ color: 'var(--text-2)' }}>{result.data.analysis.summary}</p>
                      </div>
                      <div className="p-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                        <p className="text-xs font-semibold mb-1 text-green-400">RECOMMENDATION: {result.data.analysis.recommendation?.toUpperCase()}</p>
                        <p className="text-sm" style={{ color: 'var(--text-2)' }}>{result.data.analysis.nextSteps}</p>
                      </div>
                    </>
                  )}

                  {result.type === 'generate' && result.data.questions && (
                    <>
                      <p className="text-xs font-semibold text-brand-400">OPENING</p>
                      <p className="text-sm mb-3" style={{ color: 'var(--text-2)' }}>{result.data.questions.opening}</p>
                      {result.data.questions.questions?.map((q, i) => (
                        <div key={i} className="p-3 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                          <p className="text-xs font-semibold text-brand-400 mb-1">Q{i+1} · {q.category?.toUpperCase()}</p>
                          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-1)' }}>{q.question}</p>
                          <p className="text-xs" style={{ color: 'var(--text-3)' }}>↳ {q.followUp}</p>
                        </div>
                      ))}
                    </>
                  )}

                  {result.type === 'screen' && result.data.screening && (
                    <>
                      <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                        <p className="text-3xl font-black text-brand-400">{result.data.screening.screeningScore}</p>
                        <div>
                          <p className="text-xs font-semibold" style={{ color: 'var(--text-3)' }}>SCREENING SCORE</p>
                          <p className={`text-sm font-bold ${result.data.screening.verdict === 'proceed' ? 'text-green-400' : result.data.screening.verdict === 'hold' ? 'text-yellow-400' : 'text-red-400'}`}>
                            {result.data.screening.verdict?.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="p-3 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                        <p className="text-xs font-semibold mb-1 text-brand-400">SUMMARY</p>
                        <p className="text-sm" style={{ color: 'var(--text-2)' }}>{result.data.screening.summary}</p>
                      </div>
                      <div className="p-3 rounded-xl" style={{ background: 'var(--surface-2)' }}>
                        <p className="text-xs font-semibold mb-1 text-brand-400">NOTES FOR INTERVIEWER</p>
                        <p className="text-sm" style={{ color: 'var(--text-2)' }}>{result.data.screening.notesForInterviewer}</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
