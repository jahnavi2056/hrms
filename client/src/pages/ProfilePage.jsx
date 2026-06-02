import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { Avatar, FormField, Badge } from '../components/ui/index.jsx';

const ROLE_LABELS = { admin:'Admin', senior_manager:'Senior Manager', hr_recruiter:'HR Recruiter', employee:'Employee' };

export default function ProfilePage() {
  const { user, setUser, refreshUser } = useAuth();
  const [tab, setTab] = useState('info');
  const [profileForm, setProfileForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '', address: user?.address || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState(user?.skills || []);

  const profileMut = useMutation({
    mutationFn: d => api.put('/auth/profile', d),
    onSuccess: async () => { await refreshUser(); toast.success('Profile updated!'); },
    onError: e => toast.error(e.response?.data?.error || 'Error'),
  });

  const pwMut = useMutation({
    mutationFn: d => api.put('/auth/password', d),
    onSuccess: () => { setPwForm({ currentPassword: '', newPassword: '', confirm: '' }); toast.success('Password changed successfully!'); },
    onError: e => toast.error(e.response?.data?.error || 'Error'),
  });

  const handlePw = () => {
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match');
    if (pwForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    pwMut.mutate({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
  };

  const addSkill = () => {
    if (!skillInput.trim() || skills.includes(skillInput.trim())) return;
    const updated = [...skills, skillInput.trim()];
    setSkills(updated);
    setSkillInput('');
    profileMut.mutate({ skills: updated });
  };

  const removeSkill = (s) => {
    const updated = skills.filter(x => x !== s);
    setSkills(updated);
    profileMut.mutate({ skills: updated });
  };

  const INFO = [
    ['Employee ID', user?.employeeId],
    ['Department', user?.department],
    ['Designation', user?.designation],
    ['Role', ROLE_LABELS[user?.role]],
    ['Joining Date', user?.joiningDate ? new Date(user.joiningDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'],
    ['Last Login', user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : '—'],
  ];

  return (
    <div className="max-w-3xl space-y-5 stagger">
      {/* Profile header */}
      <div className="card p-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar name={`${user?.firstName} ${user?.lastName}`} size="lg" />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 bg-brand-400" style={{ borderColor: 'var(--surface-2)' }} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.firstName} {user?.lastName}</h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-3)' }}>{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge status={user?.role} />
              <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'var(--surface-3)', color: 'var(--text-3)' }}>{user?.department}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-5 border-t" style={{ borderColor: 'var(--border)' }}>
          {INFO.map(([k, v]) => (
            <div key={k}>
              <p className="text-xs" style={{ color: 'var(--text-4)' }}>{k}</p>
              <p className="text-sm font-semibold text-white mt-0.5">{v || '—'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-list w-fit">
        {['info', 'security', 'skills'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`tab-btn capitalize ${tab === t ? 'active' : ''}`}>{t}</button>
        ))}
      </div>

      {/* Edit Info */}
      {tab === 'info' && (
        <div className="card p-5">
          <h3 className="section-title mb-4">Edit Profile</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name"><input value={profileForm.firstName} onChange={e => setProfileForm(f => ({ ...f, firstName: e.target.value }))} className="input" /></FormField>
            <FormField label="Last Name"><input value={profileForm.lastName} onChange={e => setProfileForm(f => ({ ...f, lastName: e.target.value }))} className="input" /></FormField>
            <FormField label="Phone"><input value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} className="input" /></FormField>
            <FormField label="Address"><input value={profileForm.address} onChange={e => setProfileForm(f => ({ ...f, address: e.target.value }))} className="input" /></FormField>
          </div>
          <button onClick={() => profileMut.mutate(profileForm)} disabled={profileMut.isPending} className="btn-primary mt-4">
            {profileMut.isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      )}

      {/* Security */}
      {tab === 'security' && (
        <div className="card p-5">
          <h3 className="section-title mb-4">Change Password</h3>
          <div className="space-y-4 max-w-sm">
            <FormField label="Current Password"><input type="password" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} className="input" /></FormField>
            <FormField label="New Password"><input type="password" value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} className="input" /></FormField>
            <FormField label="Confirm New Password"><input type="password" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} className="input" /></FormField>
            {pwForm.newPassword && pwForm.confirm && pwForm.newPassword !== pwForm.confirm && (
              <p className="text-xs text-red-400">Passwords do not match</p>
            )}
            <button onClick={handlePw} disabled={pwMut.isPending} className="btn-primary">
              {pwMut.isPending ? 'Changing…' : 'Update Password'}
            </button>
          </div>
        </div>
      )}

      {/* Skills */}
      {tab === 'skills' && (
        <div className="card p-5">
          <h3 className="section-title mb-4">Skills & Expertise</h3>
          <div className="flex gap-2 mb-4">
            <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill()} className="input flex-1" placeholder="Add a skill (e.g. React, Python)" />
            <button onClick={addSkill} className="btn-primary">Add</button>
          </div>
          {skills.length === 0
            ? <p className="text-sm" style={{ color: 'var(--text-3)' }}>No skills added yet</p>
            : (
              <div className="flex flex-wrap gap-2">
                {skills.map(s => (
                  <div key={s} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm" style={{ background: 'var(--surface-3)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
                    {s}
                    <button onClick={() => removeSkill(s)} className="text-xs text-red-400 hover:text-red-300 ml-1">✕</button>
                  </div>
                ))}
              </div>
            )}
        </div>
      )}
    </div>
  );
}
