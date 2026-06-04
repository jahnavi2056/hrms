import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api.js';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { PageLoader, Modal, Badge, Empty } from '../components/ui/index.jsx';

const categoryIcon = { documentation:'📄', it_setup:'💻', training:'📚', orientation:'🏢', compliance:'⚖️', introduction:'🤝' };
const categoryColor = { documentation:'text-blue-400 bg-blue-400/10', it_setup:'text-purple-400 bg-purple-400/10', training:'text-yellow-400 bg-yellow-400/10', orientation:'text-green-400 bg-green-400/10', compliance:'text-red-400 bg-red-400/10', introduction:'text-pink-400 bg-pink-400/10' };

export default function OnboardingPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const isHR = ['admin','hr_recruiter'].includes(user.role);
  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ employeeId:'', mentorId:'', startDate: new Date().toISOString().split('T')[0] });

  const { data: onboardings = [], isLoading } = useQuery({
    queryKey: ['onboardings'],
    queryFn: () => api.get('/onboarding').then(r => r.data),
  });

  const { data: myOnboarding } = useQuery({
    queryKey: ['my-onboarding'],
    queryFn: () => api.get('/onboarding/my').then(r => r.data),
    enabled: user.role === 'employee',
    retry: false,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employees-list'],
    queryFn: () => api.get('/employees').then(r => r.data.employees || r.data),
    enabled: isHR,
  });

  const createMut = useMutation({
    mutationFn: d => api.post('/onboarding', d),
    onSuccess: () => { qc.invalidateQueries(['onboardings']); setShowCreate(false); toast.success('Onboarding created!'); },
    onError: e => toast.error(e.response?.data?.error || 'Error'),
  });

  const taskMut = useMutation({
    mutationFn: ({ onboardingId, taskId, completed }) => api.put(`/onboarding/${onboardingId}/tasks/${taskId}`, { completed }),
    onSuccess: (data) => {
      qc.invalidateQueries(['onboardings']);
      qc.invalidateQueries(['my-onboarding']);
      setSelected(data.data);
    },
  });

  const displayList = user.role === 'employee' ? (myOnboarding ? [myOnboarding] : []) : onboardings;
  const activeBoard = selected || (user.role === 'employee' ? myOnboarding : null);

  const stats = {
    total: onboardings.length,
    inProgress: onboardings.filter(o => o.status === 'in_progress').length,
    completed: onboardings.filter(o => o.status === 'completed').length,
    notStarted: onboardings.filter(o => o.status === 'not_started').length,
  };

  const groupedTasks = activeBoard?.tasks?.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {}) || {};

  return (
    <div className="space-y-5 stagger">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Employee Onboarding</h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748b' }}>
            {user.role === 'employee' ? 'Your onboarding journey' : `${stats.total} employees · ${stats.inProgress} in progress`}
          </p>
        </div>
        {isHR && <button onClick={() => setShowCreate(true)} className="btn-primary">+ Start Onboarding</button>}
      </div>

      {isHR && (
        <div className="grid grid-cols-4 gap-4">
          {[['Total',stats.total,'📋','text-black'],['In Progress',stats.inProgress,'⏳','text-yellow-400'],['Completed',stats.completed,'✅','text-green-400'],['Not Started',stats.notStarted,'🔜','text-blue-400']].map(([label,val,icon,color]) => (
            <div key={label} className="card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest font-semibold" style={{ color:'var(--text-3)' }}>{label}</p>
                  <p className={`text-3xl font-black mt-1 ${color}`}>{val}</p>
                </div>
                <span className="text-3xl">{icon}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* List */}
        <div className="space-y-2">
          {isLoading && <PageLoader />}
          {!isLoading && displayList.length === 0 && <Empty message="No onboarding records" />}
          {displayList.map(o => (
            <div key={o._id}
              onClick={() => setSelected(o)}
              className={`p-4 rounded-xl cursor-pointer transition-all border ${selected?._id === o._id ? 'border-brand-500/40 bg-brand-500/5' : 'border-transparent hover:border-white/10'}`}
              style={{ background: selected?._id === o._id ? undefined : 'var(--surface-2)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-lg font-bold text-brand-400">
                  {o.employee?.firstName?.[0]}{o.employee?.lastName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-black truncate">{o.employee?.firstName} {o.employee?.lastName}</p>
                  <p className="text-xs truncate" style={{ color:'var(--text-3)' }}>{o.employee?.department}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-lg font-semibold ${o.status === 'completed' ? 'text-green-400 bg-green-400/10' : o.status === 'in_progress' ? 'text-yellow-400 bg-yellow-400/10' : 'text-blue-400 bg-blue-400/10'}`}>
                  {o.status.replace('_',' ')}
                </span>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color:'var(--text-3)' }}>Progress</span>
                  <span className="font-semibold text-black">{o.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background:'#f8fafc' }}>
                  <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width:`${o.progress}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Task board */}
        <div className="lg:col-span-2">
          {!activeBoard && <Empty message="Select an employee to view tasks" />}
          {activeBoard && (
            <div className="space-y-4">
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-black">{activeBoard.employee?.firstName} {activeBoard.employee?.lastName}</h2>
                    <p className="text-sm" style={{ color:'var(--text-3)' }}>
                      {activeBoard.employee?.department} · Started {activeBoard.startDate ? new Date(activeBoard.startDate).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black text-brand-400">{activeBoard.progress}%</div>
                    <div className="text-xs" style={{ color:'var(--text-3)' }}>Complete</div>
                  </div>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background:'#f8fafc' }}>
                  <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-500 transition-all duration-700" style={{ width:`${activeBoard.progress}%` }} />
                </div>
              </div>

              {Object.entries(groupedTasks).map(([category, tasks]) => (
                <div key={category} className="card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{categoryIcon[category] || '📌'}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg capitalize ${categoryColor[category] || 'text-gray-400 bg-gray-400/10'}`}>
                      {category.replace('_', ' ')}
                    </span>
                    <span className="text-xs ml-auto" style={{ color:'var(--text-3)' }}>
                      {tasks.filter(t=>t.completed).length}/{tasks.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {tasks.map(task => (
                      <div key={task._id} className={`flex items-start gap-3 p-3 rounded-xl transition-all ${task.completed ? 'opacity-60' : ''}`}
                        style={{ background:'#f8fafc' }}>
                        <button
                          onClick={() => taskMut.mutate({ onboardingId: activeBoard._id, taskId: task._id, completed: !task.completed })}
                          className={`w-5 h-5 mt-0.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${task.completed ? 'bg-green-500 border-green-500' : 'border-white/20 hover:border-brand-400'}`}>
                          {task.completed && <svg className="w-3 h-3 text-black\" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-900' : 'text-black'}`}>{task.title}</p>
                          {task.description && <p className="text-xs mt-0.5" style={{ color:'var(--text-3)' }}>{task.description}</p>}
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded font-semibold flex-shrink-0 ${task.priority === 'high' ? 'text-red-400 bg-red-400/10' : task.priority === 'medium' ? 'text-yellow-400 bg-yellow-400/10' : 'text-green-400 bg-green-400/10'}`}>
                          {task.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Start Employee Onboarding">
        <div className="space-y-4">
          <div>
            <label className="form-label">Select Employee</label>
            <select className="input" value={createForm.employeeId} onChange={e => setCreateForm(f=>({...f, employeeId:e.target.value}))}>
              <option value="">Select employee...</option>
              {employees.map(e => <option key={e._id} value={e._id}>{e.firstName} {e.lastName} — {e.department}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Assign Mentor (optional)</label>
            <select className="input" value={createForm.mentorId} onChange={e => setCreateForm(f=>({...f, mentorId:e.target.value}))}>
              <option value="">No mentor</option>
              {employees.filter(e=>['admin','senior_manager','hr_recruiter'].includes(e.role)).map(e => <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Start Date</label>
            <input type="date" className="input" value={createForm.startDate} onChange={e => setCreateForm(f=>({...f, startDate:e.target.value}))} />
          </div>
          <div className="pt-2 flex gap-3">
            <button onClick={() => setShowCreate(false)} className="btn-ghost flex-1">Cancel</button>
            <button onClick={() => createMut.mutate(createForm)} disabled={!createForm.employeeId || createMut.isPending} className="btn-primary flex-1">
              {createMut.isPending ? 'Creating...' : 'Start Onboarding'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
