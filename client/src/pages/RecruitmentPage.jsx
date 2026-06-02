import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api.js';
import toast from 'react-hot-toast';
import { PageLoader, Modal, Badge, FormField, Empty, AIBadge } from '../components/ui/index.jsx';

const STAGES = ['applied','screening','interview','offer','hired','rejected'];
const stageColor = { applied:'badge-purple', screening:'badge-yellow', interview:'badge-blue', offer:'badge-brand', hired:'badge-green', rejected:'badge-red' };

export default function RecruitmentPage() {
  const qc = useQueryClient();
  const [activeJob, setActiveJob] = useState(null);
  const [showJob, setShowJob] = useState(false);
  const [showCand, setShowCand] = useState(false);
  const [screeningId, setScreeningId] = useState(null);
  const [stageFilter, setStageFilter] = useState('all');
  const [jobForm, setJobForm] = useState({ title:'', department:'Engineering', description:'', requirements:[''], skills:[''], type:'full_time', location:'Bangalore, India', openings:1 });
  const [candForm, setCandForm] = useState({ name:'', email:'', phone:'', resumeText:'', experience:0, expectedCtc:0, noticePeriod:30 });

  const { data: jobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => api.get('/recruitment/jobs').then(r => r.data),
  });

  const { data: candidates = [], isLoading: candsLoading } = useQuery({
    queryKey: ['candidates', activeJob?._id, stageFilter],
    queryFn: () => api.get(`/recruitment/jobs/${activeJob._id}/candidates`, { params: { stage: stageFilter !== 'all' ? stageFilter : undefined } }).then(r => r.data),
    enabled: !!activeJob,
  });

  const createJob = useMutation({
    mutationFn: d => api.post('/recruitment/jobs', d),
    onSuccess: () => { qc.invalidateQueries(['jobs']); setShowJob(false); toast.success('Job posted!'); },
    onError: e => toast.error(e.response?.data?.error || 'Error'),
  });

  const addCandidate = useMutation({
    mutationFn: d => api.post(`/recruitment/jobs/${activeJob._id}/candidates`, d),
    onSuccess: () => { qc.invalidateQueries(['candidates']); setShowCand(false); setCandForm({ name:'', email:'', phone:'', resumeText:'', experience:0, expectedCtc:0, noticePeriod:30 }); toast.success('Candidate added!'); },
    onError: e => toast.error(e.response?.data?.error || 'Error'),
  });

  const screenMut = useMutation({
    mutationFn: id => api.post(`/recruitment/candidates/${id}/screen`),
    onSuccess: (_, id) => { qc.invalidateQueries(['candidates']); setScreeningId(null); toast.success('🤖 AI screening complete!'); },
    onError: (e) => { setScreeningId(null); toast.error(e.response?.data?.error || 'Screening failed'); },
  });

  const stageMut = useMutation({
    mutationFn: ({ id, stage }) => api.put(`/recruitment/candidates/${id}/stage`, { stage }),
    onSuccess: () => { qc.invalidateQueries(['candidates']); toast.success('Stage updated'); },
  });

  const handleScreen = async (id) => {
    setScreeningId(id);
    screenMut.mutate(id);
  };

  const addItem = (field) => setJobForm(f => ({ ...f, [field]: [...f[field], ''] }));
  const updateItem = (field, idx, val) => setJobForm(f => { const arr = [...f[field]]; arr[idx] = val; return { ...f, [field]: arr }; });
  const removeItem = (field, idx) => setJobForm(f => ({ ...f, [field]: f[field].filter((_, i) => i !== idx) }));

  const openCounts = jobs.filter(j => j.status === 'open').length;

  return (
    <div className="space-y-5 stagger">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Recruitment Pipeline</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-3)' }}>{jobs.length} jobs · {openCounts} open</p>
        </div>
        <button onClick={() => setShowJob(true)} className="btn-primary">+ Post Job</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5" style={{ minHeight: '60vh' }}>
        {/* Jobs list */}
        <div className="lg:col-span-2 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-3)' }}>Open Positions</p>
          {jobsLoading && <PageLoader />}
          {!jobsLoading && jobs.length === 0 && <Empty message="No jobs posted yet" />}
          {jobs.map(j => (
            <div key={j._id}
              onClick={() => { setActiveJob(j); setStageFilter('all'); }}
              className={`p-4 rounded-xl cursor-pointer transition-all border ${activeJob?._id === j._id ? 'border-brand-500/40 bg-brand-500/5' : 'border-transparent hover:border-white/10'}`}
              style={{ background: activeJob?._id === j._id ? undefined : 'var(--surface-2)' }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{j.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{j.department} · {j.location}</p>
                </div>
                <Badge status={j.status} />
              </div>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-xs px-2 py-0.5 rounded-md capitalize" style={{ background: 'var(--surface-3)', color: 'var(--text-3)' }}>{j.type.replace('_', ' ')}</span>
                <span className="text-xs" style={{ color: 'var(--text-3)' }}>{j.applicants || 0} applicants</span>
                <span className="text-xs" style={{ color: 'var(--text-3)' }}>{j.openings} openings</span>
              </div>
            </div>
          ))}
        </div>

        {/* Candidates panel */}
        <div className="lg:col-span-3">
          {!activeJob ? (
            <div className="h-full flex flex-col items-center justify-center py-20" style={{ background: 'var(--surface-2)', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--surface-3)' }}>
                <svg className="w-7 h-7" style={{ color: 'var(--text-4)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-3)' }}>Select a job to view candidates</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="text-sm font-semibold text-white">{activeJob.title} — Candidates ({candidates.length})</p>
                <div className="flex items-center gap-2">
                  <select value={stageFilter} onChange={e => setStageFilter(e.target.value)} className="select w-36 text-xs">
                    <option value="all">All Stages</option>
                    {STAGES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                  </select>
                  <button onClick={() => setShowCand(true)} className="btn-secondary btn-sm">+ Add Candidate</button>
                </div>
              </div>

              {candsLoading && <PageLoader />}
              {!candsLoading && candidates.length === 0 && <Empty message="No candidates yet" />}

              <div className="space-y-3">
                {candidates.map(c => (
                  <div key={c._id} className="card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-white">{c.name}</p>
                          {c.aiScore != null && (
                            <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${c.aiScore >= 70 ? 'text-emerald-400 bg-emerald-400/10' : c.aiScore >= 45 ? 'text-amber-400 bg-amber-400/10' : 'text-red-400 bg-red-400/10'}`}>
                              AI Score: {c.aiScore}%
                            </span>
                          )}
                          {c.aiScore != null && <AIBadge />}
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>{c.email} {c.phone && `· ${c.phone}`}</p>
                        {(c.experience > 0 || c.expectedCtc > 0) && (
                          <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>
                            {c.experience > 0 && `${c.experience} yrs exp`}
                            {c.experience > 0 && c.expectedCtc > 0 && ' · '}
                            {c.expectedCtc > 0 && `₹${(c.expectedCtc / 100000).toFixed(1)}L CTC`}
                            {c.noticePeriod > 0 && ` · ${c.noticePeriod}d notice`}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={stageColor[c.stage] || 'badge-gray'}>{c.stage}</span>
                      </div>
                    </div>

                    {c.aiAnalysis && (
                      <div className="mt-3 p-3 rounded-xl text-xs leading-relaxed" style={{ background: 'var(--surface-3)', color: 'var(--text-2)' }}>
                        {c.aiAnalysis}
                      </div>
                    )}

                    {c.strengths?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {c.strengths.map((s, i) => <span key={i} className="badge-green text-[11px] px-2 py-0.5">{s}</span>)}
                      </div>
                    )}

                    {c.recommendation && (
                      <div className="mt-2">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${c.recommendation === 'hire' ? 'bg-emerald-400/10 text-emerald-400' : c.recommendation === 'maybe' ? 'bg-amber-400/10 text-amber-400' : 'bg-red-400/10 text-red-400'}`}>
                          AI Recommendation: {c.recommendation.toUpperCase()}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                      {!c.aiScore && c.resumeText && (
                        <button onClick={() => handleScreen(c._id)} disabled={screeningId === c._id} className="btn-primary btn-sm">
                          {screeningId === c._id ? <><svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>AI Screening…</> : '🤖 AI Screen Resume'}
                        </button>
                      )}
                      <select value={c.stage} onChange={e => stageMut.mutate({ id: c._id, stage: e.target.value })} className="select text-xs w-36">
                        {STAGES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Post Job Modal */}
      <Modal open={showJob} onClose={() => setShowJob(false)} title="Post New Job" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Job Title" required><input value={jobForm.title} onChange={e => setJobForm(f => ({ ...f, title: e.target.value }))} className="input" placeholder="e.g. Senior React Developer" /></FormField>
            <FormField label="Department"><select value={jobForm.department} onChange={e => setJobForm(f => ({ ...f, department: e.target.value }))} className="select">{['Engineering','HR','Finance','Marketing','Sales','Operations','Design'].map(d => <option key={d}>{d}</option>)}</select></FormField>
            <FormField label="Type"><select value={jobForm.type} onChange={e => setJobForm(f => ({ ...f, type: e.target.value }))} className="select">{['full_time','part_time','contract','intern'].map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}</select></FormField>
            <FormField label="Location"><input value={jobForm.location} onChange={e => setJobForm(f => ({ ...f, location: e.target.value }))} className="input" /></FormField>
            <FormField label="Openings"><input type="number" min="1" value={jobForm.openings} onChange={e => setJobForm(f => ({ ...f, openings: +e.target.value }))} className="input" /></FormField>
          </div>
          <FormField label="Description"><textarea value={jobForm.description} onChange={e => setJobForm(f => ({ ...f, description: e.target.value }))} className="input h-24 resize-none" /></FormField>
          <div>
            <div className="flex items-center justify-between mb-2"><label className="label mb-0">Requirements</label><button type="button" onClick={() => addItem('requirements')} className="text-xs text-brand-400">+ Add</button></div>
            {jobForm.requirements.map((r, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input value={r} onChange={e => updateItem('requirements', i, e.target.value)} className="input" placeholder={`Requirement ${i + 1}`} />
                {jobForm.requirements.length > 1 && <button onClick={() => removeItem('requirements', i)} className="text-red-400 px-2">✕</button>}
              </div>
            ))}
          </div>
          <div>
            <div className="flex items-center justify-between mb-2"><label className="label mb-0">Required Skills</label><button type="button" onClick={() => addItem('skills')} className="text-xs text-brand-400">+ Add</button></div>
            {jobForm.skills.map((s, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input value={s} onChange={e => updateItem('skills', i, e.target.value)} className="input" placeholder={`Skill ${i + 1}`} />
                {jobForm.skills.length > 1 && <button onClick={() => removeItem('skills', i)} className="text-red-400 px-2">✕</button>}
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => createJob.mutate({ ...jobForm, requirements: jobForm.requirements.filter(Boolean), skills: jobForm.skills.filter(Boolean) })} disabled={!jobForm.title || createJob.isPending} className="btn-primary flex-1">{createJob.isPending ? 'Posting…' : 'Post Job'}</button>
            <button onClick={() => setShowJob(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Add Candidate Modal */}
      <Modal open={showCand} onClose={() => setShowCand(false)} title="Add Candidate" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Full Name" required><input value={candForm.name} onChange={e => setCandForm(f => ({ ...f, name: e.target.value }))} className="input" /></FormField>
            <FormField label="Email" required><input type="email" value={candForm.email} onChange={e => setCandForm(f => ({ ...f, email: e.target.value }))} className="input" /></FormField>
            <FormField label="Phone"><input value={candForm.phone} onChange={e => setCandForm(f => ({ ...f, phone: e.target.value }))} className="input" /></FormField>
            <FormField label="Experience (years)"><input type="number" min="0" value={candForm.experience} onChange={e => setCandForm(f => ({ ...f, experience: +e.target.value }))} className="input" /></FormField>
            <FormField label="Expected CTC (₹)"><input type="number" value={candForm.expectedCtc} onChange={e => setCandForm(f => ({ ...f, expectedCtc: +e.target.value }))} className="input" /></FormField>
            <FormField label="Notice Period (days)"><input type="number" value={candForm.noticePeriod} onChange={e => setCandForm(f => ({ ...f, noticePeriod: +e.target.value }))} className="input" /></FormField>
          </div>
          <FormField label="Resume Text (paste CV for AI screening)">
            <textarea value={candForm.resumeText} onChange={e => setCandForm(f => ({ ...f, resumeText: e.target.value }))} className="input h-36 resize-none" placeholder="Paste the candidate's resume text here. This will be used for AI-powered screening to generate a match score and analysis…" />
          </FormField>
          <div className="flex gap-3 pt-2">
            <button onClick={() => addCandidate.mutate(candForm)} disabled={!candForm.name || !candForm.email || addCandidate.isPending} className="btn-primary flex-1">{addCandidate.isPending ? 'Adding…' : 'Add Candidate'}</button>
            <button onClick={() => setShowCand(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
