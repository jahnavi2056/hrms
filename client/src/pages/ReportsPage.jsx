import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import api from '../services/api.js';
import { PageLoader } from '../components/ui/index.jsx';
import { useState } from 'react';

const COLORS = ['#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b', '#f43f5e', '#06b6d4', '#ec4899'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-xl text-xs" style={{ background: 'var(--surface-4)', border: '1px solid var(--border)', color: 'var(--text-1)' }}>
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' && p.value > 1000 ? `₹${(p.value / 100000).toFixed(1)}L` : p.value}</p>)}
    </div>
  );
};

export default function ReportsPage() {
  const [year, setYear] = useState(new Date().getFullYear());

  const { data: headcount, isLoading: hcLoading } = useQuery({ queryKey: ['hc'], queryFn: () => api.get('/reports/headcount').then(r => r.data) });
  const { data: leaveSummary, isLoading: lvLoading } = useQuery({ queryKey: ['leaveSummary', year], queryFn: () => api.get('/reports/leave-summary', { params: { year } }).then(r => r.data) });
  const { data: payrollSummary, isLoading: prLoading } = useQuery({ queryKey: ['payrollReport', year], queryFn: () => api.get('/reports/payroll-summary', { params: { year } }).then(r => r.data) });

  const payrollChartData = (payrollSummary || []).map(p => ({
    month: MONTHS_SHORT[p._id - 1],
    'Net Payout': Math.round(p.total / 1000),
    'Headcount': p.count,
  }));

  const leaveByMonth = {};
  (leaveSummary || []).forEach(l => {
    const m = MONTHS_SHORT[(l._id.month || 1) - 1];
    if (!leaveByMonth[m]) leaveByMonth[m] = { month: m };
    leaveByMonth[m][l._id.type || 'other'] = (leaveByMonth[m][l._id.type] || 0) + l.total;
  });
  const leaveChartData = Object.values(leaveByMonth);

  return (
    <div className="space-y-6 stagger">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Analytics & Reports</h1>
        <select value={year} onChange={e => setYear(+e.target.value)} className="select w-24">
          {[2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
        </select>
      </div>

      {/* Headcount overview */}
      {hcLoading ? <PageLoader /> : headcount && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-5">
            <p className="text-3xl font-black text-white">{headcount.total}</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>Total Active Employees</p>
          </div>

          <div className="card p-5">
            <h3 className="section-title mb-3">By Department</h3>
            <div className="space-y-2">
              {headcount.byDept?.slice(0, 5).map((d, i) => (
                <div key={d._id} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-xs flex-1 truncate" style={{ color: 'var(--text-2)' }}>{d._id || 'General'}</span>
                  <span className="text-xs font-bold text-white">{d.count}</span>
                  <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full" style={{ width: `${(d.count / headcount.total) * 100}%`, background: COLORS[i % COLORS.length] }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="section-title mb-3">By Role</h3>
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie data={headcount.byRole || []} dataKey="count" nameKey="_id" cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={3}>
                  {(headcount.byRole || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n?.replace('_', ' ')]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Payroll trend */}
      <div className="card p-5">
        <h3 className="section-title mb-4">Monthly Payroll — {year}</h3>
        {prLoading ? <PageLoader /> : payrollChartData.length === 0
          ? <p className="text-sm text-center py-8" style={{ color: 'var(--text-3)' }}>No payroll data for {year}</p>
          : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={payrollChartData} barSize={20}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}k`} />
                <Tooltip content={<Tip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Net Payout" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
      </div>

      {/* Leave trends */}
      <div className="card p-5">
        <h3 className="section-title mb-4">Leave Trends — {year}</h3>
        {lvLoading ? <PageLoader /> : leaveChartData.length === 0
          ? <p className="text-sm text-center py-8" style={{ color: 'var(--text-3)' }}>No approved leave data for {year}</p>
          : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={leaveChartData}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-3)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<Tip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {['sick', 'casual', 'annual'].map((t, i) => (
                  <Line key={t} type="monotone" dataKey={t} stroke={COLORS[i]} strokeWidth={2} dot={{ r: 3, fill: COLORS[i] }} name={t.charAt(0).toUpperCase() + t.slice(1)} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
      </div>

      {/* Export section */}
      <div className="card p-5">
        <h3 className="section-title mb-3">Export Reports</h3>
        <p className="text-sm mb-4" style={{ color: 'var(--text-3)' }}>Download reports for compliance and audits</p>
        <div className="flex flex-wrap gap-3">
          {[
            ['Headcount Report', 'CSV'],
            ['Payroll Summary', 'CSV'],
            ['Leave Report', 'CSV'],
            ['Attendance Report', 'CSV'],
          ].map(([name, fmt]) => (
            <button key={name} onClick={() => alert('Export feature: Connect to backend /reports/export endpoint for production')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5"
              style={{ background: 'var(--surface-3)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              {name} ({fmt})
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
