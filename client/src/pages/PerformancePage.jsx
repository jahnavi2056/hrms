import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { PageLoader, Modal, Badge, FormField, Empty, AIBadge, Avatar } from '../components/ui/index.jsx';

const PERIODS = ['Q1','Q2','Q3','Q4','H1','H2','Annual'];
const DEFAULT_KPIS = [
  { name:'Task Completion Rate', description:'% of assigned tasks completed on time', target:100, actual:0, score:0, weight:30 },
  { name:'Code/Work Quality',    description:'Quality score based on reviews/feedback', target:10, actual:0, score:0, weight:25 },
  { name:'Team Collaboration',   description:'Peer feedback score', target:10, actual:0, score:0, weight:25 },
  { name:'Punctuality',          description:'Attendance & time management', target:10, actual:0, score:0, weight:20 },
];

const ratingMeta = r => r>=4.5?{l:'Outstanding',c:'#22c55e'}:r>=3.5?{l:'Exceeds Expectations',c:'#3b82f6'}:r>=2.5?{l:'Meets Expectations',c:'#f59e0b'}:{l:'Needs Improvement',c:'#f43f5e'};

export default function PerformancePage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const isAdmin = ['admin','senior_manager','hr_recruiter'].includes(user?.role);
  const [showCreate, setShowCreate] = useState(false);
  const [aiLoading, setAiLoading] = useState(null);
  const [tab, setTab] = useState('my');
  const [form, setForm] = useState({ employee:'', period:'Q2', year:2026, kpis:DEFAULT_KPIS });

  const { data: myReviews, isLoading } = useQuery({ queryKey:['myReviews'], queryFn:()=>api.get('/performance/my').then(r=>r.data) });
  const { data: allReviews, isLoading: loadAll } = useQuery({ queryKey:['allReviews'], queryFn:()=>api.get('/performance').then(r=>r.data), enabled:isAdmin });
  const { data: employees } = useQuery({ queryKey:['empList'], queryFn:()=>api.get('/employees',{params:{limit:100}}).then(r=>r.data.employees), enabled:isAdmin });

  const createMut = useMutation({
    mutationFn: d => api.post('/performance', d),
    onSuccess: () => { qc.invalidateQueries(['myReviews']); qc.invalidateQueries(['allReviews']); setShowCreate(false); toast.success('Review created'); },
    onError: e => toast.error(e.response?.data?.error||'Error'),
  });

  const generateAI = async (id) => {
    setAiLoading(id);
    try {
      await api.post(`/ai/performance/${id}/generate`);
      qc.invalidateQueries(['myReviews']); qc.invalidateQueries(['allReviews']);
      toast.success('🤖 AI review generated!');
    } catch (e) { toast.error(e.response?.data?.error||'AI generation failed'); }
    setAiLoading(null);
  };

  const updateKpi = (i, k, v) => setForm(f => { const kpis=[...f.kpis]; kpis[i]={...kpis[i],[k]:isNaN(+v)?v:+v}; return {...f,kpis}; });

  const reviews = tab==='my' ? myReviews : allReviews;
  const loading = tab==='my' ? isLoading : loadAll;

  return (
    <div className="space-y-5 stagger">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Performance Reviews</h1>
        {isAdmin && <button onClick={()=>setShowCreate(true)} className="btn-primary">+ New Review</button>}
      </div>

      {isAdmin && (
        <div className="tab-list w-fit">
          <button onClick={()=>setTab('my')} className={`tab-btn ${tab==='my'?'active':''}`}>My Reviews</button>
          <button onClick={()=>setTab('all')} className={`tab-btn ${tab==='all'?'active':''}`}>All Reviews</button>
        </div>
      )}

      {loading ? <PageLoader/> : (
        <div className="space-y-4">
          {!reviews?.length && <Empty message="No performance reviews yet"/>}
          {reviews?.map(r => {
            const rm = r.rating ? ratingMeta(r.rating) : null;
            return (
              <div key={r._id} className="card p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    {tab==='all' && <Avatar name={`${r.employee?.firstName} ${r.employee?.lastName}`}/>}
                    <div>
                      {tab==='all' && <p className="font-semibold text-white">{r.employee?.firstName} {r.employee?.lastName}</p>}
                      <p className="text-sm font-semibold text-gray-900">{r.period} {r.year}</p>
                      <p className="text-xs mt-0.5" style={{color:'var(--text-3)'}}>Reviewer: {r.reviewer?.firstName} {r.reviewer?.lastName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {rm && <span className="text-sm font-black px-3 py-1.5 rounded-lg" style={{color:rm.c,background:`${rm.c}18`}}>{rm.l} ({r.rating}/5)</span>}
                    <Badge status={r.status}/>
                    {r.aiReview && <AIBadge/>}
                    {isAdmin && !r.aiReview && (
                      <button onClick={()=>generateAI(r._id)} disabled={aiLoading===r._id} className="btn-primary btn-sm">
                        {aiLoading===r._id ? <><svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Generating…</> : '🤖 Generate AI Review'}
                      </button>
                    )}
                  </div>
                </div>

                {/* KPI scores */}
                {r.kpis?.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    {r.kpis.map((k,i) => (
                      <div key={i} className="p-3 rounded-xl" style={{background:'#f8fafc'}}>
                        <p className="text-xs" style={{color:'var(--text-3)'}}>{k.name}</p>
                        <p className="text-xl font-black text-white mt-1">{k.score}<span className="text-xs font-normal" style={{color:'var(--text-4)'}}>/10</span></p>
                        <div className="progress h-1 mt-2"><div className="progress-bar" style={{width:`${k.score*10}%`,background:k.score>=7?'#22c55e':k.score>=5?'#f59e0b':'#f43f5e'}}/></div>
                      </div>
                    ))}
                  </div>
                )}

                {/* AI Review */}
                {r.aiReview && (
                  <div className="ai-card mt-4">
                    <div className="flex items-center gap-2 mb-3"><AIBadge label="AI Performance Analysis"/></div>
                    <p className="text-sm leading-relaxed" style={{color:'var(--text-2)'}}>{r.aiReview}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {r.strengths?.length > 0 && <div><p className="text-xs font-semibold text-emerald-400 mb-2">✦ Strengths</p>{r.strengths.map((s,i)=><p key={i} className="text-xs py-1" style={{color:'var(--text-2)'}}>• {s}</p>)}</div>}
                      {r.improvements?.length > 0 && <div><p className="text-xs font-semibold text-amber-400 mb-2">→ Areas to Improve</p>{r.improvements.map((s,i)=><p key={i} className="text-xs py-1" style={{color:'var(--text-2)'}}>• {s}</p>)}</div>}
                    </div>
                    {r.goals?.length > 0 && <div className="mt-3"><p className="text-xs font-semibold text-blue-400 mb-2">🎯 Goals for Next Period</p>{r.goals.map((g,i)=><p key={i} className="text-xs py-1" style={{color:'var(--text-2)'}}>• {g}</p>)}</div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showCreate} onClose={()=>setShowCreate(false)} title="Create Performance Review" size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Employee" required>
              <select value={form.employee} onChange={e=>setForm(f=>({...f,employee:e.target.value}))} className="select">
                <option value="">Select employee…</option>
                {employees?.map(e=><option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}
              </select>
            </FormField>
            <FormField label="Period"><select value={form.period} onChange={e=>setForm(f=>({...f,period:e.target.value}))} className="select">{PERIODS.map(p=><option key={p}>{p}</option>)}</select></FormField>
            <FormField label="Year"><select value={form.year} onChange={e=>setForm(f=>({...f,year:+e.target.value}))} className="select">{[2024,2025,2026].map(y=><option key={y}>{y}</option>)}</select></FormField>
          </div>
          <div>
            <p className="label mb-3">KPI Scores (0–10)</p>
            <div className="space-y-3">
              {form.kpis.map((k,i)=>(
                <div key={i} className="p-3 rounded-xl" style={{background:'#f8fafc'}}>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{k.name}</p>
                      <p className="text-xs" style={{color:'var(--text-3)'}}>{k.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div><p className="text-xs" style={{color:'var(--text-4)'}}>Actual</p><input type="number" min="0" max="10" step="0.1" value={k.actual} onChange={e=>updateKpi(i,'actual',e.target.value)} className="input w-20 text-center"/></div>
                      <div><p className="text-xs" style={{color:'var(--text-4)'}}>Score /10</p><input type="number" min="0" max="10" step="0.1" value={k.score} onChange={e=>updateKpi(i,'score',e.target.value)} className="input w-20 text-center"/></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={()=>createMut.mutate({...form,status:'submitted'})} disabled={!form.employee||createMut.isPending} className="btn-primary flex-1">{createMut.isPending?'Creating…':'Create & Submit'}</button>
            <button onClick={()=>setShowCreate(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
