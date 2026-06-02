import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const DEMO = [
  { role:'Admin',          email:'admin@fwc.co.in',    pass:'admin123', color:'#22c55e' },
  { role:'Senior Manager', email:'yogavati@fwc.co.in', pass:'mgr123',   color:'#3b82f6' },
  { role:'HR Recruiter',   email:'shivani@fwc.co.in',  pass:'hr123',    color:'#f59e0b' },
  { role:'Employee',       email:'rahul@fwc.co.in',    pass:'emp123',   color:'#8b5cf6' },
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
      toast.error(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex overflow-hidden" style={{background:'var(--surface)'}}>
      {/* Left — branding */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-14 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{background:'radial-gradient(circle,rgba(34,197,94,0.08) 0%,transparent 70%)'}}/>
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{background:'radial-gradient(circle,rgba(59,130,246,0.06) 0%,transparent 70%)'}}/>
        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none" style={{backgroundImage:'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)',backgroundSize:'48px 48px'}}/>

        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm text-white" style={{background:'linear-gradient(135deg,#22c55e,#16a34a)'}}>FW</div>
          <span className="text-lg font-bold text-white">FWC IT Services</span>
        </div>

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg mb-6" style={{background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.2)'}}>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse"/>
            <span className="text-xs font-semibold text-brand-400">AI-Powered HRMS Platform</span>
          </div>
          <h1 className="text-5xl font-black text-white leading-tight mb-5">
            The smartest<br/>
            <span style={{background:'linear-gradient(135deg,#22c55e,#06b6d4)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>HR platform</span><br/>
            you'll ever use.
          </h1>
          <p className="text-base leading-relaxed max-w-sm" style={{color:'var(--text-2)'}}>
            Built for FWC's hackathon — with 4 AI features, real-time analytics, 4-role access control, and support for 5,000+ employees.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-8 max-w-sm">
            {[['4','AI Features'],['4','Role Levels'],['5000+','Employee Capacity'],['100%','Real-time']].map(([n,l]) => (
              <div key={l} className="p-4 rounded-xl" style={{background:'var(--surface-2)',border:'1px solid var(--border)'}}>
                <p className="text-2xl font-black text-white">{n}</p>
                <p className="text-xs mt-0.5" style={{color:'var(--text-3)'}}>{l}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs" style={{color:'var(--text-4)'}}>© 2026 FWC IT Services Pvt. Ltd. · Bangalore, India</p>
      </div>

      {/* Right — login form */}
      <div className="w-full lg:w-[440px] flex flex-col justify-center px-8 lg:px-12 border-l" style={{background:'var(--surface-2)',borderColor:'var(--border)'}}>
        <div className="max-w-sm w-full mx-auto">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs text-white" style={{background:'linear-gradient(135deg,#22c55e,#16a34a)'}}>FW</div>
            <span className="font-bold text-white">FWC HRMS</span>
          </div>

          <h2 className="text-2xl font-black text-white mb-1">Sign in</h2>
          <p className="text-sm mb-8" style={{color:'var(--text-3)'}}>Access your workspace</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} className="input" placeholder="you@fwc.co.in" autoFocus required/>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPass?'text':'password'} value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} className="input pr-12" placeholder="••••••••" required/>
                <button type="button" onClick={()=>setShowPass(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold" style={{color:'var(--text-3)'}}>
                  {showPass?'HIDE':'SHOW'}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm font-bold mt-2 disabled:opacity-60">
              {loading ? <span className="flex items-center gap-2 justify-center"><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Signing in…</span> : 'Sign in →'}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px" style={{background:'var(--border)'}}/>
              <span className="text-xs font-mono" style={{color:'var(--text-4)'}}>DEMO ACCOUNTS</span>
              <div className="flex-1 h-px" style={{background:'var(--border)'}}/>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO.map((d) => (
                <button key={d.role} onClick={()=>setForm({email:d.email,password:d.pass})}
                  className="text-left p-3 rounded-xl transition-all hover:-translate-y-0.5" style={{background:'var(--surface-3)',border:'1px solid var(--border)'}}>
                  <p className="text-xs font-bold" style={{color:d.color}}>{d.role}</p>
                  <p className="text-[10px] font-mono mt-0.5 truncate" style={{color:'var(--text-3)'}}>{d.email}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
