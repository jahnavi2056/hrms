import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const NAV = [
  { to:'/dashboard',   label:'Dashboard',   icon:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', roles:['admin','senior_manager','hr_recruiter','employee'] },
  { to:'/employees',   label:'People',      icon:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', roles:['admin','senior_manager','hr_recruiter'] },
  { to:'/attendance',  label:'Attendance',  icon:'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', roles:['admin','senior_manager','hr_recruiter','employee'] },
  { to:'/leave',       label:'Leave',       icon:'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', roles:['admin','senior_manager','hr_recruiter','employee'] },
  { to:'/payroll',     label:'Payroll',     icon:'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', roles:['admin','senior_manager','hr_recruiter','employee'] },
  { to:'/performance', label:'Performance', icon:'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', roles:['admin','senior_manager','hr_recruiter','employee'] },
  { to:'/recruitment', label:'Recruitment', icon:'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', roles:['admin','senior_manager','hr_recruiter'] },
  { to:'/interviews',  label:'Interviews',  icon:'M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', roles:['admin','senior_manager','hr_recruiter'] },
  { to:'/onboarding',  label:'Onboarding',  icon:'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z', roles:['admin','senior_manager','hr_recruiter','employee'] },
  { to:'/reports',     label:'Reports',     icon:'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', roles:['admin','senior_manager','hr_recruiter'] },
  { to:'/chatbot',     label:'AI Assistant',icon:'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', roles:['admin','senior_manager','hr_recruiter','employee'], ai:true },
];

const ROLE_META = {
  admin:           { label:'Admin',           color:'#22c55e', bg:'rgba(34,197,94,0.12)'   },
  senior_manager:  { label:'Sr. Manager',     color:'#3b82f6', bg:'rgba(59,130,246,0.12)'  },
  hr_recruiter:    { label:'HR Recruiter',    color:'#f59e0b', bg:'rgba(245,158,11,0.12)'  },
  employee:        { label:'Employee',        color:'#8b5cf6', bg:'rgba(139,92,246,0.12)'  },
};

const Icon = ({ path, active }) => (
  <svg className={`w-[18px] h-[18px] flex-shrink-0 transition-colors ${active ? 'text-brand-400' : 'text-white/30 group-hover:text-white/60'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path}/>
  </svg>
);

export default function Sidebar() {
  const { user } = useAuth();
  const visible = NAV.filter(i => i.roles.includes(user?.role));
  const role = ROLE_META[user?.role] || ROLE_META.employee;
  const initials = `${user?.firstName?.[0]||''}${user?.lastName?.[0]||''}`;

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col border-r" style={{background:'var(--surface-2)',borderColor:'var(--border)'}}>
      <div className="px-5 py-5 border-b flex items-center gap-3" style={{borderColor:'var(--border)'}}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-xs text-white" style={{background:'linear-gradient(135deg,#22c55e,#16a34a)'}}>
          FW
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-tight">FWC HRMS</p>
          <p className="text-[10px] font-mono" style={{color:'var(--text-3)'}}>AI Platform v3.0</p>
        </div>
      </div>
      <nav className="flex-1 py-3 px-2.5 overflow-y-auto space-y-0.5">
        {visible.map(item => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) =>
            `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative
             ${isActive ? 'text-white' : 'text-white/40 hover:text-white/70'}`
          } style={({ isActive }) => isActive ? {background:'rgba(34,197,94,0.1)',borderLeft:'2px solid #22c55e',paddingLeft:'10px'} : {}}>
            {({ isActive }) => <>
              <Icon path={item.icon} active={isActive}/>
              <span className="flex-1 truncate">{item.label}</span>
              {item.ai && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md" style={{background:'rgba(139,92,246,0.15)',color:'#a78bfa',border:'1px solid rgba(139,92,246,0.25)'}}>AI</span>}
            </>}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t" style={{borderColor:'var(--border)'}}>
        <NavLink to="/profile" className="flex items-center gap-2.5 p-2.5 rounded-xl transition-all group hover:bg-white/[0.03]">
          <div className="avatar avatar-sm font-bold text-xs flex-shrink-0" style={{background:role.bg,color:role.color}}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white/80 truncate group-hover:text-white">{user?.firstName} {user?.lastName}</p>
            <p className="text-[11px] truncate" style={{color:role.color}}>{role.label}</p>
          </div>
          <svg className="w-3.5 h-3.5 flex-shrink-0" style={{color:'var(--text-4)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
        </NavLink>
      </div>
    </aside>
  );
}
