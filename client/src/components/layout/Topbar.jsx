import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api.js';

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const { data: notifs = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data).catch(() => []),
    refetchInterval: 30000,
  });

  const unread = notifs.filter(n => !n.read).length;

  return (
    <header className="h-14 flex-shrink-0 flex items-center justify-between px-6 border-b"
      style={{ background:'#ffffff', borderColor:'rgba(15,23,42,0.08)', boxShadow:'0 1px 3px rgba(15,23,42,0.04)' }}>

      {/* Left — breadcrumb / greeting */}
      <div className="flex items-center gap-3">
        <div className="h-6 w-px bg-gray-200"/>
        <p className="text-sm font-medium text-gray-500">
          Good {time.getHours() < 12 ? 'morning' : time.getHours() < 17 ? 'afternoon' : 'evening'},
          <span className="font-semibold text-gray-800 ml-1">{user?.firstName}</span>
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Clock */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold text-gray-500"
          style={{ background:'#f8fafc', border:'1px solid rgba(15,23,42,0.08)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-500"/>
          {time.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', second:'2-digit' })}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button onClick={() => setShowNotif(!showNotif)}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                style={{ background:'#dc2626' }}>{unread > 9 ? '9+' : unread}</span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-11 w-80 rounded-2xl shadow-xl z-50 overflow-hidden"
              style={{ background:'#fff', border:'1px solid rgba(15,23,42,0.1)' }}>
              <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor:'rgba(15,23,42,0.08)' }}>
                <p className="text-sm font-bold text-gray-900">Notifications</p>
                {unread > 0 && <span className="text-xs font-semibold text-green-600">{unread} new</span>}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifs.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No notifications</p>
                ) : notifs.slice(0, 8).map(n => (
                  <div key={n._id} className={`px-4 py-3 border-b last:border-0 text-sm transition-colors hover:bg-gray-50 ${!n.read ? 'bg-green-50/50' : ''}`}
                    style={{ borderColor:'rgba(15,23,42,0.05)' }}>
                    <p className="font-medium text-gray-800">{n.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sign out */}
        <button onClick={() => { logout(); navigate('/login'); }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          Sign out
        </button>
      </div>
    </header>
  );
}
