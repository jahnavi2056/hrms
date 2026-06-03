export const Spinner = ({ size = 'md' }) => {
  const s = { sm:'w-4 h-4', md:'w-6 h-6', lg:'w-8 h-8' }[size];
  return (
    <svg className={`animate-spin ${s} text-green-500`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  );
};

export const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center py-20">
    <Spinner size="lg"/>
  </div>
);

export const Empty = ({ message = 'No data found' }) => (
  <div className="py-16 text-center">
    <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-gray-100">
      <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
      </svg>
    </div>
    <p className="text-sm text-gray-400">{message}</p>
  </div>
);

export const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  if (!open) return null;
  const w = { sm:'max-w-md', md:'max-w-lg', lg:'max-w-2xl', xl:'max-w-3xl' }[size];
  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`modal-content ${w} w-full`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

export const StatCard = ({ label, value, sub, icon, color = '#16a34a', trend }) => (
  <div className="card p-5">
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background:`${color}15`, border:`1px solid ${color}25` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      {trend !== undefined && (
        <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${trend >= 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
    <p className="text-sm font-semibold text-gray-600">{label}</p>
    {sub && <p className="text-xs mt-0.5 text-gray-400">{sub}</p>}
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
  return <span className={map[status] || 'badge-gray'}>{status?.replace(/_/g,' ')}</span>;
};

export const Avatar = ({ name, size = 'md' }) => {
  const initials = name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || '??';
  const bgs = ['#dcfce7','#dbeafe','#ede9fe','#fef9c3','#fee2e2','#cffafe'];
  const fgs = ['#16a34a','#2563eb','#7c3aed','#ca8a04','#dc2626','#0891b2'];
  const i = (initials.charCodeAt(0) || 0) % bgs.length;
  const s = { sm:'avatar-sm', md:'avatar-md', lg:'avatar-lg' }[size];
  return <div className={s} style={{ background:bgs[i], color:fgs[i] }}>{initials}</div>;
};

export const FormField = ({ label, children, required }) => (
  <div>
    <label className="form-label">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
    {children}
  </div>
);

export const SectionHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-5">
    <div>
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="text-sm mt-0.5 text-gray-500">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const AIBadge = ({ label = 'AI Powered' }) => (
  <span className="ai-badge">✦ {label}</span>
);
