import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { StatCard, PageLoader, Avatar, Badge } from '../components/ui/index.jsx';

const COLORS = ['#22c55e','#3b82f6','#8b5cf6','#f59e0b','#f43f5e','#06b6d4'];
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return <div className="px-3 py-2 rounded-xl text-xs" style={{background:'#f1f5f9',border:'1px solid var(--border)',color:'var(--text-1)'}}><p className="font-semibold mb-1">{label}</p>{payload.map((p,i)=><p key={i} style={{color:p.color}}>{p.name}: {typeof p.value==='number'&&p.value>1000?`₹${(p.value/1000).toFixed(0)}k`:p.value}</p>)}</div>;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = ['admin','senior_manager'].includes(user?.role);

  const { data: stats, isLoading } = useQuery({ queryKey:['dashStats'], queryFn:()=>api.get('/dashboard/stats').then(r=>r.data), refetchInterval:60000 });
  const { data: analytics } = useQuery({ queryKey:['analytics'], queryFn:()=>api.get('/dashboard/analytics').then(r=>r.data), enabled:isAdmin });

  const greet = () => { const h=new Date().getHours(); return h<12?'Good morning':h<17?'Good afternoon':'Good evening'; };

  if (isLoading) return <PageLoader/>;

  return (
    <div className="space-y-6 stagger">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">{greet()}, {user?.firstName} 👋</h1>
          <p className="text-sm mt-1" style={{color:'var(--text-3)'}}>{new Date().toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{background:'#f0fdf4',border:'1px solid #bbf7d0'}}>
          <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse-green"/>
          <span className="text-xs font-semibold text-green-700">System Live</span>
        </div>
      </div>

      {isAdmin && stats && (
        <>
          {/* Admin stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Employees" value={stats.totalEmp} sub={`+${stats.newJoinees} this month`} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>} color="#22c55e"/>
            <StatCard label="Present Today" value={stats.todayPresent} sub={`${stats.attendanceRate}% attendance rate`} icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>} color="#3b82f6"/>
            <StatCard label="Pending Leaves" value={stats.pendingLeaves} sub="Awaiting approval" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>} color="#f59e0b"/>
            <StatCard label="Open Positions" value={stats.openJobs} sub="Active job postings" icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>} color="#8b5cf6"/>
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Attendance bar chart */}
            <div className="lg:col-span-2 card p-5">
              <h3 className="section-title mb-4">Attendance — Last 7 Days</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.weekAttendance} barSize={28}>
                  <XAxis dataKey="day" tick={{fontSize:11,fill:'var(--text-3)'}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:11,fill:'var(--text-3)'}} axisLine={false} tickLine={false}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Bar dataKey="count" fill="#22c55e" radius={[6,6,0,0]} name="Present"/>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Dept pie chart */}
            <div className="card p-5">
              <h3 className="section-title mb-4">By Department</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={stats.deptBreakdown} dataKey="count" nameKey="_id" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3}>
                    {stats.deptBreakdown?.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                  </Pie>
                  <Tooltip formatter={(v,n) => [v, n]}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {stats.deptBreakdown?.slice(0,4).map((d,i) => (
                  <div key={d._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:COLORS[i%COLORS.length]}}/>
                      <span className="text-xs" style={{color:'var(--text-2)'}}>{d._id||'General'}</span>
                    </div>
                    <span className="text-xs font-semibold text-white">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Analytics trend */}
          {analytics && (
            <div className="card p-5">
              <h3 className="section-title mb-4">Payroll Trend — Last 6 Months</h3>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={analytics.months}>
                  <defs>
                    <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{fontSize:11,fill:'var(--text-3)'}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:11,fill:'var(--text-3)'}} axisLine={false} tickLine={false} tickFormatter={v=>`₹${(v/100000).toFixed(0)}L`}/>
                  <Tooltip content={<CustomTooltip/>}/>
                  <Area type="monotone" dataKey="payroll" stroke="#22c55e" strokeWidth={2} fill="url(#pg)" name="Payroll (₹)"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {/* Employee dashboard */}
      {!isAdmin && stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Today's attendance */}
          <div className="card p-5">
            <h3 className="section-title mb-4">Today's Attendance</h3>
            {stats.todayAtt ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b" style={{borderColor:'var(--border)'}}>
                  <span className="text-sm" style={{color:'var(--text-3)'}}>Check-in</span>
                  <span className="text-sm font-semibold text-white">{stats.todayAtt.checkIn ? new Date(stats.todayAtt.checkIn).toLocaleTimeString() : '—'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b" style={{borderColor:'var(--border)'}}>
                  <span className="text-sm" style={{color:'var(--text-3)'}}>Check-out</span>
                  <span className="text-sm font-semibold text-white">{stats.todayAtt.checkOut ? new Date(stats.todayAtt.checkOut).toLocaleTimeString() : '—'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm" style={{color:'var(--text-3)'}}>Status</span>
                  <Badge status={stats.todayAtt.status}/>
                </div>
              </div>
            ) : <p className="text-sm" style={{color:'var(--text-3)'}}>Not checked in today</p>}
          </div>

          {/* Leaves */}
          <div className="card p-5">
            <h3 className="section-title mb-4">Recent Leaves</h3>
            {stats.myLeaves?.length ? stats.myLeaves.map(l => (
              <div key={l._id} className="flex justify-between items-center py-2 border-b" style={{borderColor:'var(--border)'}}>
                <div>
                  <p className="text-sm font-medium text-white capitalize">{l.type}</p>
                  <p className="text-xs" style={{color:'var(--text-3)'}}>{l.days} day{l.days>1?'s':''}</p>
                </div>
                <Badge status={l.status}/>
              </div>
            )) : <p className="text-sm" style={{color:'var(--text-3)'}}>No recent leaves</p>}
          </div>

          {/* Payslip */}
          <div className="card p-5">
            <h3 className="section-title mb-4">This Month's Salary</h3>
            {stats.myPayslip ? (
              <div className="space-y-2">
                {[['Basic',stats.myPayslip.basicSalary],['HRA',stats.myPayslip.hra],['Tax (deducted)',-(stats.myPayslip.tax||0)]].map(([k,v])=>(
                  <div key={k} className="flex justify-between py-1.5 border-b" style={{borderColor:'var(--border)'}}>
                    <span className="text-xs" style={{color:'var(--text-3)'}}>{k}</span>
                    <span className={`text-xs font-semibold ${v<0?'text-red-400':'text-white'}`}>₹{Math.abs(v).toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2">
                  <span className="text-sm font-bold text-white">Net Salary</span>
                  <span className="text-sm font-black text-brand-400">₹{stats.myPayslip.netSalary?.toLocaleString()}</span>
                </div>
              </div>
            ) : <p className="text-sm" style={{color:'var(--text-3)'}}>No payslip yet this month</p>}
          </div>
        </div>
      )}
    </div>
  );
}
