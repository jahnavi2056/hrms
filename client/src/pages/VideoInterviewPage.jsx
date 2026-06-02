import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api.js';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { PageLoader, Modal, Empty } from '../components/ui/index.jsx';

const typeColor = { screening:'text-blue-400 bg-blue-400/10', technical:'text-purple-400 bg-purple-400/10', hr:'text-green-400 bg-green-400/10', final:'text-yellow-400 bg-yellow-400/10' };
const statusColor = { scheduled:'text-blue-400 bg-blue-400/10', completed:'text-green-400 bg-green-400/10', cancelled:'text-red-400 bg-red-400/10', no_show:'text-gray-400 bg-gray-400/10' };

export default function VideoInterviewPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const isHR = ['admin','hr_recruiter','senior_manager'].includes(user.role);
  const [showSchedule, setShowSchedule] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState(null);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ candidateId:'', jobId:'', scheduledAt:'', duration:60, type:'screening', notes:'' });
  const [feedback, setFeedback] = useState({ rating:4, notes:'', recommendation:'hire' });

  const { data: interviews = [], isLoading } = useQuery({
    queryKey: ['interviews', filter],
    queryFn: () => api.get('/interviews', { params: filter !== 'all' ? { status: filter } : {} }).then(r => r.data),
  });

  const { data: candidates = [] } = useQuery({
    queryKey: ['all-candidates'],
    queryFn: async () => {
      const jobs = await api.get('/recruitment/jobs').then(r => r.data);
      const all = [];
      for (const j of jobs.slice(0, 5)) {
        const cands = await api.get(`/recruitment/jobs/${j._id}/candidates`).then(r => r.data).catch(() => []);
        all.push(...cands.map(c => ({ ...c, jobTitle: j.title, jobId: j._id })));
      }
      return all;
    },
    enabled: isHR,
  });

  const scheduleMut = useMutation({
    mutationFn: d => api.post('/interviews', d),
    onSuccess: () => { qc.invalidateQueries(['interviews']); setShowSchedule(false); toast.success('Interview scheduled! Meet link generated.'); },
    onError: e => toast.error(e.response?.data?.error || 'Error'),
  });

  const feedbackMut = useMutation({
    mutationFn: ({ id, data }) => api.put(`/interviews/${id}/feedback`, data),
    onSuccess: () => { qc.invalidateQueries(['interviews']); setFeedbackModal(null); toast.success('Feedback submitted!'); },
    onError: e => toast.error(e.response?.data?.error || 'Error'),
  });

  const cancelMut = useMutation({
    mutationFn: id => api.put(`/interviews/${id}/cancel`),
    onSuccess: () => { qc.invalidateQueries(['interviews']); toast.success('Interview cancelled'); },
  });

  const upcoming = interviews.filter(i => i.status === 'scheduled' && new Date(i.scheduledAt) > new Date());
  const today = interviews.filter(i => {
    const d = new Date(i.scheduledAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  return (
    <div className="space-y-5 stagger">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Video Interviews</h1>
          <p className="text-sm mt-0.5" style={{ color:'var(--text-3)' }}>{upcoming.length} upcoming · {today.length} today</p>
        </div>
        {isHR && <button onClick={() => setShowSchedule(true)} className="btn-primary">+ Schedule Interview</button>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          ['Scheduled', interviews.filter(i=>i.status==='scheduled').length, '📅', 'text-blue-400'],
          ["Today's", today.length, '🎯', 'text-yellow-400'],
          ['Completed', interviews.filter(i=>i.status==='completed').length, '✅', 'text-green-400'],
          ['Cancelled', interviews.filter(i=>i.status==='cancelled').length, '❌', 'text-red-400'],
        ].map(([label, val, icon, color]) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest font-semibold" style={{ color:'var(--text-3)' }}>{label}</p>
                <p className={`text-3xl font-black mt-1 ${color}`}>{val}</p>
              </div>
              <span className="text-3xl">{icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all','scheduled','completed','cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${filter === s ? 'bg-brand-500 text-white' : 'text-gray-400 hover:text-white'}`}
            style={{ background: filter === s ? undefined : 'var(--surface-2)' }}>
            {s}
          </button>
        ))}
      </div>

      {/* Interview cards */}
      {isLoading && <PageLoader />}
      {!isLoading && interviews.length === 0 && <Empty message="No interviews found" />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {interviews.map(iv => (
          <div key={iv._id} className="card p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-white">{iv.candidate?.name}</p>
                <p className="text-sm" style={{ color:'var(--text-3)' }}>{iv.job?.title} · {iv.job?.department}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <span className={`text-xs px-2 py-1 rounded-lg font-semibold capitalize ${typeColor[iv.type]}`}>{iv.type}</span>
                <span className={`text-xs px-2 py-1 rounded-lg font-semibold capitalize ${statusColor[iv.status]}`}>{iv.status}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-xl" style={{ background:'var(--surface-3)' }}>
                <p className="text-xs mb-1" style={{ color:'var(--text-3)' }}>Date & Time</p>
                <p className="font-semibold text-white">{new Date(iv.scheduledAt).toLocaleDateString()}</p>
                <p className="text-xs text-brand-400">{new Date(iv.scheduledAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</p>
              </div>
              <div className="p-3 rounded-xl" style={{ background:'var(--surface-3)' }}>
                <p className="text-xs mb-1" style={{ color:'var(--text-3)' }}>Duration</p>
                <p className="font-semibold text-white">{iv.duration} minutes</p>
                <p className="text-xs text-brand-400">{iv.interviewers?.length || 0} interviewer(s)</p>
              </div>
            </div>

            {iv.meetingLink && iv.status === 'scheduled' && (
              <a href={iv.meetingLink} target="_blank" rel="noreferrer"
                className="flex items-center gap-2 p-3 rounded-xl border border-brand-500/30 bg-brand-500/5 hover:bg-brand-500/10 transition-all group">
                <span className="text-xl">🎥</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-brand-400">Join Video Call</p>
                  <p className="text-xs truncate" style={{ color:'var(--text-3)' }}>{iv.meetingLink}</p>
                </div>
                <svg className="w-4 h-4 text-brand-400 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
            )}

            {iv.status === 'completed' && iv.feedback && (
              <div className="p-3 rounded-xl" style={{ background:'var(--surface-3)' }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold" style={{ color:'var(--text-3)' }}>Feedback</p>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => <span key={s} className={`text-sm ${s <= iv.feedback.rating ? 'text-yellow-400' : 'text-gray-600'}`}>★</span>)}
                  </div>
                </div>
                <p className="text-xs text-white">{iv.feedback.notes}</p>
                <span className={`text-xs px-2 py-0.5 rounded font-semibold mt-2 inline-block ${iv.feedback.recommendation === 'hire' ? 'text-green-400 bg-green-400/10' : iv.feedback.recommendation === 'reject' ? 'text-red-400 bg-red-400/10' : 'text-yellow-400 bg-yellow-400/10'}`}>
                  {iv.feedback.recommendation}
                </span>
              </div>
            )}

            {isHR && iv.status === 'scheduled' && (
              <div className="flex gap-2 pt-1">
                <button onClick={() => { setFeedbackModal(iv); setFeedback({ rating:4, notes:'', recommendation:'hire' }); }}
                  className="btn-primary flex-1 text-sm py-2">Submit Feedback</button>
                <button onClick={() => cancelMut.mutate(iv._id)}
                  className="btn-ghost text-sm py-2 px-4 text-red-400 hover:bg-red-400/10">Cancel</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Schedule Modal */}
      <Modal open={showSchedule} onClose={() => setShowSchedule(false)} title="Schedule Video Interview">
        <div className="space-y-4">
          <div>
            <label className="form-label">Candidate</label>
            <select className="input" value={form.candidateId} onChange={e => {
              const c = candidates.find(c => c._id === e.target.value);
              setForm(f => ({ ...f, candidateId: e.target.value, jobId: c?.jobId || '' }));
            }}>
              <option value="">Select candidate...</option>
              {candidates.map(c => <option key={c._id} value={c._id}>{c.name} — {c.jobTitle}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Date & Time</label>
              <input type="datetime-local" className="input" value={form.scheduledAt} onChange={e => setForm(f=>({...f, scheduledAt:e.target.value}))} />
            </div>
            <div>
              <label className="form-label">Duration (mins)</label>
              <select className="input" value={form.duration} onChange={e => setForm(f=>({...f, duration:+e.target.value}))}>
                {[30,45,60,90,120].map(d => <option key={d} value={d}>{d} min</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="form-label">Interview Type</label>
            <select className="input" value={form.type} onChange={e => setForm(f=>({...f, type:e.target.value}))}>
              {['screening','technical','hr','final'].map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
            </select>
          </div>
          <div className="p-3 rounded-xl border border-brand-500/20 bg-brand-500/5 text-sm text-brand-300">
            🔗 A Google Meet link will be auto-generated and shared with the candidate.
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowSchedule(false)} className="btn-ghost flex-1">Cancel</button>
            <button onClick={() => scheduleMut.mutate(form)} disabled={!form.candidateId || !form.scheduledAt || scheduleMut.isPending} className="btn-primary flex-1">
              {scheduleMut.isPending ? 'Scheduling...' : 'Schedule Interview'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Feedback Modal */}
      <Modal open={!!feedbackModal} onClose={() => setFeedbackModal(null)} title="Submit Interview Feedback">
        <div className="space-y-4">
          <div>
            <label className="form-label">Rating</label>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(s => (
                <button key={s} onClick={() => setFeedback(f=>({...f, rating:s}))}
                  className={`text-3xl transition-all ${s <= feedback.rating ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-300'}`}>★</button>
              ))}
            </div>
          </div>
          <div>
            <label className="form-label">Recommendation</label>
            <div className="grid grid-cols-3 gap-2">
              {[['hire','✅','text-green-400 border-green-400/40'],['maybe','🤔','text-yellow-400 border-yellow-400/40'],['reject','❌','text-red-400 border-red-400/40']].map(([val,icon,cls]) => (
                <button key={val} onClick={() => setFeedback(f=>({...f, recommendation:val}))}
                  className={`p-3 rounded-xl border capitalize font-semibold text-sm transition-all ${feedback.recommendation===val ? cls+' bg-opacity-10' : 'border-white/10 text-gray-400'}`}
                  style={{ background: feedback.recommendation===val ? 'rgba(255,255,255,0.05)' : undefined }}>
                  {icon} {val}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="form-label">Notes</label>
            <textarea className="input" rows={4} placeholder="Interview notes and observations..."
              value={feedback.notes} onChange={e => setFeedback(f=>({...f, notes:e.target.value}))} />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setFeedbackModal(null)} className="btn-ghost flex-1">Cancel</button>
            <button onClick={() => feedbackMut.mutate({ id: feedbackModal._id, data: feedback })} disabled={feedbackMut.isPending} className="btn-primary flex-1">
              {feedbackMut.isPending ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
