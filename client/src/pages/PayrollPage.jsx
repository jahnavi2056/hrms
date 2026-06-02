import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { PageLoader, Badge, Avatar, Empty } from '../components/ui/index.jsx';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function PayrollPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const isAdmin = ['admin','senior_manager'].includes(user?.role);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth()+1);
  const [year, setYear] = useState(now.getFullYear());
  const [tab, setTab] = useState(isAdmin?'summary':'payslips');

  const { data: myPayslips, isLoading: loadingMy } = useQuery({ queryKey:['myPayslips'], queryFn:()=>api.get('/payroll/my').then(r=>r.data) });
  const { data: summary, isLoading: loadingSummary } = useQuery({ queryKey:['payrollSummary',month,year], queryFn:()=>api.get('/payroll/summary',{params:{month,year}}).then(r=>r.data), enabled:isAdmin });

  const bulkMut = useMutation({
    mutationFn: () => api.post('/payroll/bulk', { month, year }),
    onSuccess: r => { qc.invalidateQueries(['payrollSummary']); toast.success(`Payroll generated for ${r.data.processed} employees`); },
    onError: e => toast.error(e.response?.data?.error||'Error'),
  });
  const paidMut = useMutation({
    mutationFn: id => api.put(`/payroll/${id}/paid`),
    onSuccess: () => { qc.invalidateQueries(['payrollSummary']); toast.success('Marked as paid'); },
  });

  const f = v => `₹${(v||0).toLocaleString('en-IN')}`;

  return (
    <div className="space-y-5 stagger">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="page-title">Payroll</h1>
        {isAdmin && (
          <div className="flex items-center gap-3">
            <select value={month} onChange={e=>setMonth(+e.target.value)} className="select w-28">{MONTHS.map((m,i)=><option key={i} value={i+1}>{m} {year}</option>)}</select>
            <select value={year} onChange={e=>setYear(+e.target.value)} className="select w-24">{[2024,2025,2026].map(y=><option key={y}>{y}</option>)}</select>
            <button onClick={()=>bulkMut.mutate()} disabled={bulkMut.isPending} className="btn-primary">
              {bulkMut.isPending ? 'Generating…' : '⚡ Generate Payroll'}
            </button>
          </div>
        )}
      </div>

      {isAdmin && summary && (
        <div className="grid grid-cols-3 gap-4">
          {[['Total Payout',f(summary.total),'#22c55e'],['Gross Salaries',f(summary.gross),'#3b82f6'],['Employees Processed',summary.count,'#8b5cf6']].map(([l,v,c])=>(
            <div key={l} className="stat-card">
              <p className="text-2xl font-black" style={{color:c}}>{v}</p>
              <p className="text-sm mt-1" style={{color:'var(--text-3)'}}>{l}</p>
            </div>
          ))}
        </div>
      )}

      {isAdmin && (
        <div className="tab-list w-fit">
          <button onClick={()=>setTab('summary')} className={`tab-btn ${tab==='summary'?'active':''}`}>Team Payroll</button>
          <button onClick={()=>setTab('payslips')} className={`tab-btn ${tab==='payslips'?'active':''}`}>My Payslips</button>
        </div>
      )}

      {tab==='summary' && isAdmin && (
        <div className="table-wrap">
          {loadingSummary ? <PageLoader/> : (
            <table className="data-table">
              <thead><tr>{['Employee','Dept','Basic','HRA','Gross','PF','Tax','Net','Status',''].map(h=><th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {!summary?.payrolls?.length && <tr><td colSpan={10}><Empty message="No payroll data. Click Generate Payroll."/></td></tr>}
                {summary?.payrolls?.map(p=>(
                  <tr key={p._id}>
                    <td><div className="flex items-center gap-2"><Avatar name={`${p.employee?.firstName} ${p.employee?.lastName}`} size="sm"/><div><p className="text-sm font-semibold text-white">{p.employee?.firstName} {p.employee?.lastName}</p><p className="text-xs" style={{color:'var(--text-3)'}}>{p.employee?.employeeId}</p></div></div></td>
                    <td>{p.employee?.department}</td>
                    <td>{f(p.basicSalary)}</td>
                    <td>{f(p.hra)}</td>
                    <td>{f(p.grossSalary)}</td>
                    <td className="text-red-400/80">{f(p.pf)}</td>
                    <td className="text-red-400/80">{f(p.tax)}</td>
                    <td className="font-bold text-white">{f(p.netSalary)}</td>
                    <td><Badge status={p.status}/></td>
                    <td>{p.status!=='paid' && <button onClick={()=>paidMut.mutate(p._id)} className="text-xs text-brand-400 hover:underline">Mark Paid</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab==='payslips' && (
        <div className="table-wrap">
          {loadingMy ? <PageLoader/> : (
            <table className="data-table">
              <thead><tr>{['Period','Basic','HRA','DA','Gross','Deductions','Net Salary','Status'].map(h=><th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {!myPayslips?.length && <tr><td colSpan={8}><Empty message="No payslips yet"/></td></tr>}
                {myPayslips?.map(p=>(
                  <tr key={p._id}>
                    <td className="font-semibold text-white">{MONTHS[p.month-1]} {p.year}</td>
                    <td>{f(p.basicSalary)}</td>
                    <td>{f(p.hra)}</td>
                    <td>{f(p.da)}</td>
                    <td>{f(p.grossSalary)}</td>
                    <td className="text-red-400/80">{f((p.pf||0)+(p.tax||0))}</td>
                    <td className="font-black text-brand-400">{f(p.netSalary)}</td>
                    <td><Badge status={p.status}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
