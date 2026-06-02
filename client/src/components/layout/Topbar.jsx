import { useState, useEffect, useRef } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

const TITLES = {'/dashboard':'Dashboard','/employees':'People Directory','/attendance':'Attendance','/leave':'Leave Management','/payroll':'Payroll','/performance':'Performance Reviews','/recruitment':'Recruitment Pipeline','/chatbot':'AI HR Assistant','/reports':'Analytics & Reports','/profile':'My Profile'};

const notifIcon = {success:'✓',error:'✕',info:'ℹ',leave:'📋',payroll:'💰',performance:'📊',recruitment:'🎯'};

export default function Topbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const qc = useQueryClient();
  const [showNotifs, setShowNotifs] = useState(false);
  const [now, setNow] = useState(new Date());
  const ref = useRef(null);
  const title = TITLES[location.pathname] || 'Dashboard';

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setShowNotifs(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const { data: notifs = [] } = useQuery({
    queryKey: ['notifs'],
    queryFn: () => api.get('/notifications').then(r => r.data),
    refetchInterval: 30000,
  });
  const unread = notifs.filter(n => !n.isRead).length;

  const markAll = useMutation({
    mutationFn: () => api.put('/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries(['notifs']),
  });

  return (
    <header className="flex-shrink-0 flex items-center gap-4 px-6 h-14 border-b" style={{background:'var(--surface-2)',borderColor:'var(--border)'}}>
      <h1 className="flex-1 text-base font-bold text-white/90 truncate">{title}</h1>

      {/* Clock */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{background:'var(--surface-3)'}}>
        <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse-green"/>
        <span className="text-xs font-mono" style={{color:'var(--text-3)'}}>{now.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false})}</span>
      </div>

      {/* Notifications */}
      <div className="relative" ref={ref}>
        <button onClick={() => setShowNotifs(v=>!v)} className="btn-icon btn-ghost relative">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
          {unread > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{background:'#f43f5e'}}>{unread > 9 ? '9+' : unread}</span>}
        </button>

        {showNotifs && (
          <div className="absolute right-0 top-full mt-2 w-80 card z-50 overflow-hidden" style={{animation:'scaleIn 0.15s ease'}}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{borderColor:'var(--border)'}}>
              <span className="text-sm font-semibold text-white">Notifications</span>
              {unread > 0 && <button onClick={() => markAll.mutate()} className="text-xs text-brand-400 hover:text-brand-300">Mark all read</button>}
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifs.length === 0
                ? <div className="py-8 text-center text-sm" style={{color:'var(--text-3)'}}>All caught up! 🎉</div>
                : notifs.slice(0,15).map(n => (
                  <div key={n._id} className="px-4 py-3 border-b transition-colors hover:bg-white/[0.02]" style={{borderColor:'var(--border)',background:n.isRead?'transparent':'rgba(34,197,94,0.03)'}}>
                    <div className="flex gap-3">
                      <span className="text-base flex-shrink-0">{notifIcon[n.type] || 'ℹ'}</span>
                      <div>
                        <p className="text-xs font-semibold text-white/80">{n.title}</p>
                        <p className="text-xs mt-0.5" style={{color:'var(--text-3)'}}>{n.message}</p>
                        <p className="text-[10px] mt-1" style={{color:'var(--text-4)'}}>{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Logout */}
      <button onClick={() => { logout(); toast.success('Signed out'); }} className="btn-ghost btn-sm flex items-center gap-1.5" style={{color:'var(--text-3)'}}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
        <span className="hidden sm:inline">Sign out</span>
      </button>
    </header>
  );
}
