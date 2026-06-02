import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { PageLoader, Badge, Avatar } from '../components/ui/index.jsx';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AttendancePage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const isAdmin = ['admin','senior_manager','hr_recruiter'].includes(user?.role);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [tab, setTab] = useState('my');

  const { data: todayRec } = useQuery({ queryKey:['todayAtt'], queryFn:()=>api.get('/attendance/today').then(r=>r.data), refetchInterval:30000 });
  const { data: myRecords, isLoading } = useQuery({ queryKey:['myAtt',month,year], queryFn:()=>api.get('/attendance/my',{params:{month,year}}).then(r=>r.data) });
  const { data: teamData } = useQuery({ queryKey:['teamAtt'], queryFn:()=>api.get('/attendance/team').then(r=>r.data), enabled:isAdmin });

  const checkIn = useMutation({
    mutationFn: () => api.post('/attendance/checkin'),
    onSuccess: () => { qc.invalidateQueries(['todayAtt']); qc.invalidateQueries(['myAtt']); toast.success('Checked in! ✅'); },
    onError: e => toast.error(e.response?.data?.error||'Error'),
  });
  const checkOut = useMutation({
    mutationFn: () => api.post('/attendance/checkout'),
    onSuccess: () => { qc.invalidateQueries(['todayAtt']); qc.invalidateQueries(['myAtt']); toast.success('Checked out! Have a great evening!'); },
    onError: e => toast.error(e.response?.data?.error||'Error'),
  });

  const isCheckedIn = !!todayRec?.checkIn;
  const isCheckedOut = !!todayRec?.checkOut;
  const hoursWorked = todayRec?.workHours || (isCheckedIn ? ((Date.now() - new Date(todayRec.checkIn)) / 3600000).toFixed(1) : 0);

  const summary = myRecords ? {
    present: myRecords.filter(r=>r.status==='present').length,
    late:    myRecords.filter(r=>r.status==='late').length,
    absent:  myRecords.filter(r=>r.status==='absent').length,
    wfh:     myRecords.filter(r=>r.status==='wfh').length,
    hours:   myRecords.reduce((s,r)=>s+(r.workHours||0),0).toFixed(1),
  } : null;

  return (
    <div className="space-y-5 stagger">
      <h1 className="page-title">Attendance</h1>

      {/* Check-in card */}
      <div className="card p-5" style={{background:'linear-gradient(135deg,var(--surface-2),var(--surface-3))'}}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium" style={{color:'var(--text-3)'}}>Today — {new Date().toLocaleDateString('en-IN',{weekday:'long',month:'long',day:'numeric'})}</p>
            <div className="flex items-center gap-4 mt-2">
              <div><p className="text-xs" style={{color:'var(--text-4)'}}>Check-in</p><p className="text-lg font-bold text-white">{todayRec?.checkIn ? new Date(todayRec.checkIn).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}) : '—'}</p></div>
              <div className="w-8 h-px" style={{background:'var(--border)'}}/>
              <div><p className="text-xs" style={{color:'var(--text-4)'}}>Check-out</p><p className="text-lg font-bold text-white">{todayRec?.checkOut ? new Date(todayRec.checkOut).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}) : '—'}</p></div>
              <div className="w-8 h-px" style={{background:'var(--border)'}}/>
              <div><p className="text-xs" style={{color:'var(--text-4)'}}>Hours</p><p className="text-lg font-bold text-white">{hoursWorked}h</p></div>
              {todayRec && <Badge status={todayRec.status}/>}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={()=>checkIn.mutate()} disabled={isCheckedIn||checkIn.isPending} className="btn-primary disabled:opacity-40">
              {checkIn.isPending ? 'Checking in…' : isCheckedIn ? '✓ Checked In' : 'Check In'}
            </button>
            <button onClick={()=>checkOut.mutate()} disabled={!isCheckedIn||isCheckedOut||checkOut.isPending} className="btn-secondary disabled:opacity-40">
              {checkOut.isPending ? 'Checking out…' : isCheckedOut ? '✓ Checked Out' : 'Check Out'}
            </button>
          </div>
        </div>
      </div>

      {/* Summary chips */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[['Present',summary.present,'#22c55e'],['Late',summary.late,'#f59e0b'],['Absent',summary.absent,'#f43f5e'],['WFH',summary.wfh,'#3b82f6'],['Total Hours',summary.hours+'h','#8b5cf6']].map(([l,v,c])=>(
            <div key={l} className="card p-4 text-center">
              <p className="text-2xl font-black" style={{color:c}}>{v}</p>
              <p className="text-xs mt-1" style={{color:'var(--text-3)'}}>{l}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab switcher */}
      {isAdmin && (
        <div className="tab-list w-fit">
          <button onClick={()=>setTab('my')} className={`tab-btn ${tab==='my'?'active':''}`}>My Attendance</button>
          <button onClick={()=>setTab('team')} className={`tab-btn ${tab==='team'?'active':''}`}>Team Today</button>
        </div>
      )}

      {/* Month filter */}
      <div className="flex gap-3">
        <select value={month} onChange={e=>setMonth(+e.target.value)} className="select w-32">
          {MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
        </select>
        <select value={year} onChange={e=>setYear(+e.target.value)} className="select w-24">
          {[2024,2025,2026].map(y=><option key={y}>{y}</option>)}
        </select>
      </div>

      {/* My attendance table */}
      {(tab === 'my' || !isAdmin) && (
        <div className="table-wrap">
          {isLoading ? <PageLoader/> : (
            <table className="data-table">
              <thead><tr>{['Date','Day','Check-in','Check-out','Hours','Status'].map(h=><th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {myRecords?.map(r=>(
                  <tr key={r._id}>
                    <td className="font-medium text-white">{new Date(r.date).toLocaleDateString()}</td>
                    <td>{new Date(r.date).toLocaleDateString('en',{weekday:'short'})}</td>
                    <td>{r.checkIn ? new Date(r.checkIn).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}) : '—'}</td>
                    <td>{r.checkOut ? new Date(r.checkOut).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}) : '—'}</td>
                    <td>{r.workHours ? `${r.workHours}h` : '—'}</td>
                    <td><Badge status={r.status}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Team attendance */}
      {isAdmin && tab === 'team' && (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr>{['Employee','Department','Check-in','Hours','Status'].map(h=><th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {teamData?.map(r=>(
                <tr key={r._id}>
                  <td><div className="flex items-center gap-2.5"><Avatar name={`${r.employee?.firstName} ${r.employee?.lastName}`} size="sm"/><div><p className="text-sm font-semibold text-white">{r.employee?.firstName} {r.employee?.lastName}</p><p className="text-xs" style={{color:'var(--text-3)'}}>{r.employee?.employeeId}</p></div></div></td>
                  <td>{r.employee?.department}</td>
                  <td>{r.checkIn ? new Date(r.checkIn).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}) : '—'}</td>
                  <td>{r.workHours ? `${r.workHours}h` : '—'}</td>
                  <td><Badge status={r.status}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
