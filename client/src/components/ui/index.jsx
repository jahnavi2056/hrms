// Shared UI primitives

export const Spinner = ({ size = 'md' }) => {
  const s = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }[size];
  return (
    <svg className={`animate-spin ${s}`} style={{color:'var(--text-3)'}} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  );
};

export const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center py-20">
    <Spinner size="lg" />
  </div>
);

export const Empty = ({ message = 'No data found' }) => (
  <div className="py-16 text-center">
    <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{background:'var(--surface-3)'}}>
      <svg className="w-6 h-6" style={{color:'var(--text-4)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
    </div>
    <p className="text-sm" style={{color:'var(--text-3)'}}>{message}</p>
  </div>
);

export const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  if (!open) return null;
  const w = { sm:'max-w-md', md:'max-w-lg', lg:'max-w-2xl', xl:'max-w-3xl' }[size];
  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`modal-content ${w} w-full`}>
        <div className="flex items-center justify-between p-5 border-b" style={{borderColor:'var(--border)'}}>
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="btn-icon btn-ghost">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

export const StatCard = ({ label, value, sub, icon, color = '#22c55e', trend }) => (
  <div className="stat-card">
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:`${color}18`,border:`1px solid ${color}30`}}>
        <span style={{color}}>{icon}</span>
      </div>
      {trend !== undefined && (
        <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${trend >= 0 ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-white mb-1">{value}</p>
    <p className="text-sm font-medium" style={{color:'var(--text-2)'}}>{label}</p>
    {sub && <p className="text-xs mt-0.5" style={{color:'var(--text-3)'}}>{sub}</p>}
  </div>
);

export const Badge = ({ status }) => {
  const map = {
    present:'badge-green', active:'badge-green', approved:'badge-green', hired:'badge-green', paid:'badge-green', reviewed:'badge-green', open:'badge-green',
    absent:'badge-red', rejected:'badge-red', terminated:'badge-red', closed:'badge-red',
    late:'badge-yellow', pending:'badge-yellow', processing:'badge-yellow', half_day:'badge-yellow', on_hold:'badge-yellow', draft:'badge-yellow',
    wfh:'badge-blue', interview:'badge-blue', submitted:'badge-blue',
    cancelled:'badge-gray', inactive:'badge-gray', weekend:'badge-gray',
    screening:'badge-purple', applied:'badge-purple',
  };
  const cls = map[status] || 'badge-gray';
  return <span className={cls}>{status?.replace(/_/g,' ')}</span>;
};

export const Avatar = ({ name, size = 'md', color }) => {
  const initials = name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || '??';
  const colors = ['rgba(34,197,94,0.2)','rgba(59,130,246,0.2)','rgba(139,92,246,0.2)','rgba(245,158,11,0.2)','rgba(244,63,94,0.2)','rgba(6,182,212,0.2)'];
  const textColors = ['#22c55e','#3b82f6','#8b5cf6','#f59e0b','#f43f5e','#06b6d4'];
  const idx = (initials.charCodeAt(0) || 0) % colors.length;
  const s = { sm:'avatar-sm', md:'avatar-md', lg:'avatar-lg' }[size];
  return <div className={s} style={{background: color || colors[idx], color: textColors[idx]}}>{initials}</div>;
};

export const FormField = ({ label, children, required }) => (
  <div>
    <label className="label">{label}{required && <span className="text-red-400 ml-1">*</span>}</label>
    {children}
  </div>
);

export const SectionHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-5">
    <div>
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="text-sm mt-0.5" style={{color:'var(--text-3)'}}>{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const AIBadge = ({ label = 'AI Generated' }) => (
  <span className="ai-badge">
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
    {label}
  </span>
);
