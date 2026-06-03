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

  const { data: todayRec, isLoading: loadingToday } = useQuery({
    queryKey: ['todayAtt'],
    queryFn: () => api.get('/attendance/today').then(r => r.data),
    refetchInterval: 30000,
  });
  const { data: myRecords, isLoading } = useQuery({
    queryKey: ['myAtt', month, year],
    queryFn: () => api.get('/attendance/my', { params: { month, year } }).then(r => r.data),
  });
  const { data: teamData } = useQuery({
    queryKey: ['teamAtt'],
    queryFn: () => api.get('/attendance/team').then(r => r.data),
    enabled: isAdmin,
  });

  const checkIn = useMutation({
    mutationFn: () => api.post('/attendance/checkin'),
    onSuccess: () => { qc.invalidateQueries(['todayAtt']); qc.invalidateQueries(['myAtt']); toast.success('Checked in successfully! ✅'); },
    onError: e => toast.error(e.response?.data?.error || 'Already checked in today'),
  });
  const checkOut = useMutation({
    mutationFn: () => api.post('/attendance/checkout'),
    onSuccess: () => { qc.invalidateQueries(['todayAtt']); qc.invalidateQueries(['myAtt']); toast.success('Checked out! Have a great evening 👋'); },
    onError: e => toast.error(e.response?.data?.error || 'Error checking out'),
  });

  const isCheckedIn = !!todayRec?.checkIn;
  const isCheckedOut = !!todayRec?.checkOut;
  const hoursWorked = todayRec?.workHours
    ? todayRec.workHours
    : isCheckedIn && !isCheckedOut
    ? ((Date.now() - new Date(todayRec.checkIn)) / 3600000).toFixed(1)
    : 0;

  const summary = myRecords ? {
    present: myRecords.filter(r => r.status === 'present').length,
    late:    myRecords.filter(r => r.status === 'late').length,
    absent:  myRecords.filter(r => r.status === 'absent').length,
    wfh:     myRecords.filter(r => r.status === 'wfh').length,
    hours:   myRecords.reduce((s, r) => s + (r.workHours || 0), 0).toFixed(1),
  } : null;

  const statusInfo = isCheckedOut
    ? { label: 'Completed', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' }
    : isCheckedIn
    ? { label: 'Working', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' }
    : { label: 'Not Checked In', color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' };

  return (
    <div className="space-y-5 stagger">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="text-sm text-gray-500 mt-0.5">{now.toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold"
          style={{ background: statusInfo.bg, borderColor: statusInfo.border, color: statusInfo.color }}>
          <span className="w-2 h-2 rounded-full" style={{ background: statusInfo.color }}/>
          {statusInfo.label}
        </div>
      </div>

      {/* Check-in card */}
      <div className="card p-6" style={{ background: 'linear-gradient(135deg,#f0fdf4,#eff6ff)', borderColor: '#bbf7d0' }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-6">
            {/* Time display */}
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Check-in</p>
              <p className="text-2xl font-black text-gray-900">
                {todayRec?.checkIn ? new Date(todayRec.checkIn).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }) : '—'}
              </p>
            </div>
            <div className="w-8 h-px bg-gray-300"/>
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Check-out</p>
              <p className="text-2xl font-black text-gray-900">
                {todayRec?.checkOut ? new Date(todayRec.checkOut).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }) : '—'}
              </p>
            </div>
            <div className="w-8 h-px bg-gray-300"/>
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Hours</p>
              <p className="text-2xl font-black text-green-600">{hoursWorked}h</p>
            </div>
            {todayRec && (
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                <Badge status={todayRec.status}/>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => checkIn.mutate()}
              disabled={isCheckedIn || checkIn.isPending || loadingToday}
              className="btn-primary px-6 py-3 disabled:opacity-40 disabled:cursor-not-allowed">
              {checkIn.isPending ? (
                <span className="flex items-center gap-2"><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Checking in...</span>
              ) : isCheckedIn ? '✓ Checked In' : '🟢 Check In'}
            </button>
            <button
              onClick={() => checkOut.mutate()}
              disabled={!isCheckedIn || isCheckedOut || checkOut.isPending}
              className="btn-secondary px-6 py-3 disabled:opacity-40 disabled:cursor-not-allowed">
              {checkOut.isPending ? (
                <span className="flex items-center gap-2"><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Checking out...</span>
              ) : isCheckedOut ? '✓ Checked Out' : '🔴 Check Out'}
            </button>
          </div>
        </div>
      </div>

      {/* Monthly summary */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            ['Present', summary.present, '#16a34a', '#f0fdf4', '#bbf7d0'],
            ['Late', summary.late, '#d97706', '#fffbeb', '#fde68a'],
            ['Absent', summary.absent, '#dc2626', '#fef2f2', '#fecaca'],
            ['WFH', summary.wfh, '#2563eb', '#eff6ff', '#bfdbfe'],
            ['Total Hours', summary.hours + 'h', '#7c3aed', '#f5f3ff', '#ddd6fe'],
          ].map(([label, value, color, bg, border]) => (
            <div key={label} className="card p-4 text-center" style={{ background: bg, borderColor: border }}>
              <p className="text-2xl font-black" style={{ color }}>{value}</p>
              <p className="text-xs font-semibold mt-1 text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tab switcher */}
      {isAdmin && (
        <div className="tab-list w-fit">
          <button onClick={() => setTab('my')} className={`tab-btn ${tab === 'my' ? 'active' : ''}`}>My Attendance</button>
          <button onClick={() => setTab('team')} className={`tab-btn ${tab === 'team' ? 'active' : ''}`}>Team Today</button>
        </div>
      )}

      {/* Month/year filter */}
      <div className="flex gap-3 items-center">
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
        </svg>
        <select value={month} onChange={e => setMonth(+e.target.value)} className="input w-32">
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select value={year} onChange={e => setYear(+e.target.value)} className="input w-24">
          {[2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
        </select>
        <span className="text-sm text-gray-400">{myRecords?.length || 0} records</span>
      </div>

      {/* My attendance table */}
      {(tab === 'my' || !isAdmin) && (
        <div className="table-wrap">
          {isLoading ? <PageLoader /> : (
            <table className="data-table">
              <thead>
                <tr>{['Date', 'Day', 'Check-in', 'Check-out', 'Hours', 'Status'].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {myRecords?.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-10 text-gray-400">No records for this month</td></tr>
                )}
                {myRecords?.map(r => (
                  <tr key={r._id}>
                    <td className="font-semibold text-gray-900">{new Date(r.date).toLocaleDateString('en-IN')}</td>
                    <td className="text-gray-500">{new Date(r.date).toLocaleDateString('en', { weekday: 'short' })}</td>
                    <td className="font-mono text-sm text-gray-700">
                      {r.checkIn ? new Date(r.checkIn).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="font-mono text-sm text-gray-700">
                      {r.checkOut ? new Date(r.checkOut).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="font-semibold text-gray-800">{r.workHours ? `${r.workHours}h` : <span className="text-gray-300">—</span>}</td>
                    <td><Badge status={r.status} /></td>
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
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Today's Team Attendance</h3>
            <span className="text-sm text-gray-400">{teamData?.length || 0} records</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>{['Employee', 'Department', 'Check-in', 'Check-out', 'Hours', 'Status'].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {teamData?.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-gray-400">No attendance records for today</td></tr>
              )}
              {teamData?.map(r => (
                <tr key={r._id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={`${r.employee?.firstName} ${r.employee?.lastName}`} size="sm"/>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{r.employee?.firstName} {r.employee?.lastName}</p>
                        <p className="text-xs text-gray-400">{r.employee?.employeeId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-gray-500">{r.employee?.department}</td>
                  <td className="font-mono text-sm text-gray-700">
                    {r.checkIn ? new Date(r.checkIn).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="font-mono text-sm text-gray-700">
                    {r.checkOut ? new Date(r.checkOut).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' }) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="font-semibold text-gray-800">{r.workHours ? `${r.workHours}h` : <span className="text-gray-300">—</span>}</td>
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
