import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const DEMO = [
  { role:'Admin',          email:'admin@fwc.co.in',    pass:'admin123', color:'#16a34a', bg:'#f0fdf4' },
  { role:'Senior Manager', email:'yogavati@fwc.co.in', pass:'mgr123',   color:'#2563eb', bg:'#eff6ff' },
  { role:'HR Recruiter',   email:'shivani@fwc.co.in',  pass:'hr123',    color:'#d97706', bg:'#fffbeb' },
  { role:'Employee',       email:'rahul@fwc.co.in',    pass:'emp123',   color:'#7c3aed', bg:'#f5f3ff' },
];

export default function LoginPage() {
  const [form, setForm] = useState({ email:'', password:'' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Enter email and password');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.firstName}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex overflow-hidden bg-white">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-14 relative overflow-hidden"
        style={{ background:'linear-gradient(145deg,#0f172a 0%,#1e293b 60%,#0f172a 100%)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage:'radial-gradient(circle at 20% 20%,rgba(22,163,74,0.12) 0%,transparent 50%),radial-gradient(circle at 80% 80%,rgba(37,99,235,0.08) 0%,transparent 50%)' }}/>
        <div className="absolute inset-0" style={{ backgroundImage:'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize:'48px 48px' }}/>

        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-white" style={{ background:'linear-gradient(135deg,#16a34a,#15803d)' }}>FW</div>
          <span className="text-lg font-bold text-white">FWC IT Services</span>
        </div>

        <div className="relative space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background:'rgba(22,163,74,0.15)', border:'1px solid rgba(22,163,74,0.3)', color:'#4ade80' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
            AI-Powered HRMS Platform
          </div>
          <h1 className="text-5xl font-black text-white leading-tight">
            The smartest<br/>
            <span style={{ background:'linear-gradient(135deg,#4ade80,#22d3ee)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>HR platform</span><br/>
            you'll ever use.
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm">
            Built for FWC's hackathon — 4 AI features, real-time analytics, 4-role access, and 5,000+ employee support.
          </p>
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            {[['4','AI Features'],['4','Role Levels'],['5000+','Capacity'],['100%','Real-time']].map(([n,l]) => (
              <div key={l} className="p-4 rounded-xl" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-2xl font-black text-white">{n}</p>
                <p className="text-xs text-slate-400 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-slate-600">© 2026 FWC IT Services Pvt. Ltd. · Bangalore, India</p>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-[460px] flex flex-col justify-center px-8 lg:px-12 bg-white border-l border-gray-100">
        <div className="max-w-sm w-full mx-auto">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs text-white" style={{ background:'linear-gradient(135deg,#16a34a,#15803d)' }}>FW</div>
            <span className="font-bold text-gray-900">FWC HRMS</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-black text-gray-900">Sign in</h2>
            <p className="text-sm text-gray-500 mt-1">Access your workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
              <input type="email" autoComplete="email" placeholder="you@fwc.co.in"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 bg-gray-50 transition-all"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}/>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400 bg-gray-50 transition-all"
                  value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}/>
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-semibold">
                  {showPass ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background:'linear-gradient(135deg,#16a34a,#15803d)', boxShadow:'0 4px 14px rgba(22,163,74,0.3)' }}>
              {loading ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Signing in...</> : 'Sign in →'}
            </button>
          </form>

          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-200"/>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Demo Accounts</span>
              <div className="flex-1 h-px bg-gray-200"/>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO.map(d => (
                <button key={d.role} onClick={() => setForm({ email: d.email, password: d.pass })}
                  className="p-3 rounded-xl border text-left transition-all hover:shadow-sm hover:-translate-y-0.5"
                  style={{ background: d.bg, borderColor: d.color + '30' }}>
                  <p className="text-xs font-bold" style={{ color: d.color }}>{d.role}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{d.email}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
