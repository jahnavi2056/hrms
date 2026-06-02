// LeavePage.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { PageLoader, Modal, Badge, FormField, Empty, Avatar } from '../components/ui/index.jsx';

const TYPES = ['sick','casual','annual','maternity','paternity','unpaid','compensatory'];

export default function LeavePage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const isAdmin = ['admin','hr_recruiter','senior_manager'].includes(user?.role);
  const [showApply, setShowApply] = useState(false);
  const [tab, setTab] = useState('my');
  const [form, setForm] = useState({ type:'casual', startDate:'', endDate:'', reason:'' });

  const { data: myData, isLoading } = useQuery({ queryKey:['myLeaves'], queryFn:()=>api.get('/leave/my').then(r=>r.data) });
  const { data: allLeaves } = useQuery({ queryKey:['allLeaves'], queryFn:()=>api.get('/leave').then(r=>r.data), enabled:isAdmin });

  const applyMut = useMutation({
    mutationFn: d => api.post('/leave', d),
    onSuccess: () => { qc.invalidateQueries(['myLeaves']); setShowApply(false); setForm({type:'casual',startDate:'',endDate:'',reason:''}); toast.success('Leave applied!'); },
    onError: e => toast.error(e.response?.data?.error||'Error'),
  });
  const statusMut = useMutation({
    mutationFn: ({ id, status, comments }) => api.put(`/leave/${id}/status`, { status, comments }),
    onSuccess: () => { qc.invalidateQueries(['allLeaves']); toast.success('Status updated'); },
    onError: e => toast.error(e.response?.data?.error||'Error'),
  });
  const cancelMut = useMutation({
    mutationFn: id => api.put(`/leave/${id}/cancel`),
    onSuccess: () => { qc.invalidateQueries(['myLeaves']); toast.success('Leave cancelled'); },
  });

  const bal = myData?.remaining || {};

  return (
    <div className="space-y-5 stagger">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Leave Management</h1>
        <button onClick={()=>setShowApply(true)} className="btn-primary">+ Apply Leave</button>
      </div>

      {/* Balance cards */}
      {myData && (
        <div className="grid grid-cols-3 gap-3">
          {[['Casual',bal.casual??6,'#22c55e'],['Sick',bal.sick??12,'#3b82f6'],['Annual',bal.annual??18,'#f59e0b']].map(([t,v,c])=>(
            <div key={t} className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold" style={{color:'var(--text-2)'}}>{t} Leave</span>
                <span className="text-xl font-black" style={{color:c}}>{v}</span>
              </div>
              <div className="progress h-1.5">
                <div className="progress-bar" style={{width:`${Math.min(100,(v/({ Casual:6,Sick:12,Annual:18 }[t]))*100)}%`,background:c}}/>
              </div>
              <p className="text-xs mt-1.5" style={{color:'var(--text-4)'}}>days remaining</p>
            </div>
          ))}
        </div>
      )}

      {isAdmin && (
        <div className="tab-list w-fit">
          <button onClick={()=>setTab('my')} className={`tab-btn ${tab==='my'?'active':''}`}>My Leaves</button>
          <button onClick={()=>setTab('all')} className={`tab-btn ${tab==='all'?'active':''}`}>All Requests {allLeaves?.filter(l=>l.status==='pending').length > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-400/20 text-amber-400">{allLeaves.filter(l=>l.status==='pending').length}</span>}</button>
        </div>
      )}

      {/* My leaves table */}
      {(tab==='my'||!isAdmin) && (
        <div className="table-wrap">
          {isLoading ? <PageLoader/> : (
            <table className="data-table">
              <thead><tr>{['Type','From','To','Days','Reason','Status','Action'].map(h=><th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {!myData?.leaves?.length && <tr><td colSpan={7}><Empty message="No leave requests"/></td></tr>}
                {myData?.leaves?.map(l=>(
                  <tr key={l._id}>
                    <td><span className="font-semibold text-white capitalize">{l.type}</span></td>
                    <td>{new Date(l.startDate).toLocaleDateString()}</td>
                    <td>{new Date(l.endDate).toLocaleDateString()}</td>
                    <td className="font-semibold text-white">{l.days}</td>
                    <td className="max-w-xs truncate">{l.reason}</td>
                    <td><Badge status={l.status}/></td>
                    <td>{l.status==='pending' && <button onClick={()=>cancelMut.mutate(l._id)} className="text-xs text-red-400 hover:underline">Cancel</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* All leaves */}
      {isAdmin && tab==='all' && (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr>{['Employee','Type','Dates','Days','Status','Actions'].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {!allLeaves?.length && <tr><td colSpan={6}><Empty/></td></tr>}
              {allLeaves?.map(l=>(
                <tr key={l._id}>
                  <td><div className="flex items-center gap-2.5"><Avatar name={`${l.employee?.firstName} ${l.employee?.lastName}`} size="sm"/><div><p className="text-sm font-semibold text-white">{l.employee?.firstName} {l.employee?.lastName}</p><p className="text-xs" style={{color:'var(--text-3)'}}>{l.employee?.department}</p></div></div></td>
                  <td className="capitalize">{l.type}</td>
                  <td>{new Date(l.startDate).toLocaleDateString()} – {new Date(l.endDate).toLocaleDateString()}</td>
                  <td>{l.days}</td>
                  <td><Badge status={l.status}/></td>
                  <td>
                    {l.status==='pending' && (
                      <div className="flex gap-1.5">
                        <button onClick={()=>statusMut.mutate({id:l._id,status:'approved'})} className="btn-sm px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20">Approve</button>
                        <button onClick={()=>statusMut.mutate({id:l._id,status:'rejected'})} className="btn-sm px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-400/10 text-red-400 hover:bg-red-400/20">Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showApply} onClose={()=>setShowApply(false)} title="Apply for Leave">
        <div className="space-y-4">
          <FormField label="Leave Type"><select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} className="select">{TYPES.map(t=><option key={t} value={t} className="capitalize">{t}</option>)}</select></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="From Date" required><input type="date" value={form.startDate} onChange={e=>setForm(f=>({...f,startDate:e.target.value}))} className="input"/></FormField>
            <FormField label="To Date" required><input type="date" value={form.endDate} onChange={e=>setForm(f=>({...f,endDate:e.target.value}))} className="input"/></FormField>
          </div>
          <FormField label="Reason" required><textarea value={form.reason} onChange={e=>setForm(f=>({...f,reason:e.target.value}))} className="input h-24 resize-none" placeholder="Briefly describe your reason…"/></FormField>
          <div className="flex gap-3 pt-2">
            <button onClick={()=>applyMut.mutate(form)} disabled={applyMut.isPending} className="btn-primary flex-1">{applyMut.isPending?'Submitting…':'Submit Request'}</button>
            <button onClick={()=>setShowApply(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
