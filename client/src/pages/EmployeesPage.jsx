import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api.js';
import toast from 'react-hot-toast';
import { PageLoader, Modal, Avatar, Badge, FormField, Empty } from '../components/ui/index.jsx';

const DEPTS = ['Engineering','HR','Finance','Marketing','Sales','Operations','Design','Management'];
const ROLES = ['employee','hr_recruiter','senior_manager','admin'];

const EMP_FORM = { firstName:'',lastName:'',email:'',password:'',role:'employee',department:'Engineering',designation:'',phone:'',salary:1000000 };

export default function EmployeesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [form, setForm] = useState(EMP_FORM);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['employees', search, dept, page],
    queryFn: () => api.get('/employees', { params: { search, department: dept, page, limit: 15 } }).then(r => r.data),
    keepPreviousData: true,
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const createMut = useMutation({
    mutationFn: d => api.post('/employees', d),
    onSuccess: () => { qc.invalidateQueries(['employees']); setShowAdd(false); setForm(EMP_FORM); toast.success('Employee created'); },
    onError: e => toast.error(e.response?.data?.error || 'Error'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => api.put(`/employees/${id}`, data),
    onSuccess: () => { qc.invalidateQueries(['employees']); setShowEdit(null); toast.success('Updated'); },
    onError: e => toast.error(e.response?.data?.error || 'Error'),
  });

  const toggleMut = useMutation({
    mutationFn: id => api.patch(`/employees/${id}/toggle`),
    onSuccess: () => { qc.invalidateQueries(['employees']); toast.success('Status changed'); },
  });

  const EmpForm = ({ onSave, saving, editData }) => {
    const [f, setF] = useState(editData || form);
    const s = (k, v) => setF(p => ({ ...p, [k]: v }));
    return (
      <div className="grid grid-cols-2 gap-4">
        <FormField label="First Name" required><input value={f.firstName} onChange={e=>s('firstName',e.target.value)} className="input"/></FormField>
        <FormField label="Last Name" required><input value={f.lastName} onChange={e=>s('lastName',e.target.value)} className="input"/></FormField>
        <FormField label="Email" required><input type="email" value={f.email} onChange={e=>s('email',e.target.value)} className="input"/></FormField>
        {!editData && <FormField label="Password" required><input type="password" value={f.password} onChange={e=>s('password',e.target.value)} className="input"/></FormField>}
        <FormField label="Department"><select value={f.department} onChange={e=>s('department',e.target.value)} className="select">{DEPTS.map(d=><option key={d}>{d}</option>)}</select></FormField>
        <FormField label="Role"><select value={f.role} onChange={e=>s('role',e.target.value)} className="select">{ROLES.map(r=><option key={r} value={r}>{r.replace('_',' ')}</option>)}</select></FormField>
        <FormField label="Designation"><input value={f.designation} onChange={e=>s('designation',e.target.value)} className="input"/></FormField>
        <FormField label="Phone"><input value={f.phone} onChange={e=>s('phone',e.target.value)} className="input"/></FormField>
        <FormField label="Annual Salary (₹)" required><input type="number" value={f.salary} onChange={e=>s('salary',Number(e.target.value))} className="input"/></FormField>
        <div className="col-span-2 flex gap-3 pt-2">
          <button disabled={saving} onClick={() => onSave(f)} className="btn-primary flex-1">
            {saving ? 'Saving…' : editData ? 'Update' : 'Create Employee'}
          </button>
          <button onClick={() => editData ? setShowEdit(null) : setShowAdd(false)} className="btn-secondary">Cancel</button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 stagger">
      <div className="flex items-center justify-between">
        <div><h1 className="page-title">People Directory</h1><p className="text-sm mt-0.5" style={{color:'var(--text-3)'}}>{data?.total || 0} employees</p></div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
          Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{color:'var(--text-4)'}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder="Search name, email, ID…" className="input pl-9"/>
        </div>
        <select value={dept} onChange={e=>{setDept(e.target.value);setPage(1)}} className="select w-44">
          <option value="">All Departments</option>
          {DEPTS.map(d=><option key={d}>{d}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="table-wrap">
        {isLoading ? <PageLoader/> : (
          <table className="data-table">
            <thead>
              <tr>
                {['Employee','Department','Designation','Role','Status','Actions'].map(h=><th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {data?.employees?.length === 0 && <tr><td colSpan={6}><Empty message="No employees found"/></td></tr>}
              {data?.employees?.map(emp => (
                <tr key={emp._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar name={`${emp.firstName} ${emp.lastName}`} size="sm"/>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs" style={{color:'var(--text-3)'}}>{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>{emp.department}</td>
                  <td>{emp.designation || '—'}</td>
                  <td><Badge status={emp.role}/></td>
                  <td><Badge status={emp.isActive ? 'active' : 'inactive'}/></td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setShowEdit(emp)} className="btn-ghost btn-sm btn-icon">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                      </button>
                      <button onClick={() => toggleMut.mutate(emp._id)} className={`btn-sm px-2.5 py-1.5 rounded-lg text-xs font-semibold ${emp.isActive ? 'text-red-400 bg-red-400/10' : 'text-emerald-400 bg-emerald-400/10'}`}>
                        {emp.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {data?.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t" style={{borderColor:'#e2e8f0'}}>
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="btn-secondary btn-sm disabled:opacity-40">← Prev</button>
            <span className="text-xs" style={{color:'var(--text-3)'}}>Page {page} of {data.pages}</span>
            <button onClick={() => setPage(p => Math.min(data.pages, p+1))} disabled={page===data.pages} className="btn-secondary btn-sm disabled:opacity-40">Next →</button>
          </div>
        )}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New Employee" size="lg">
        <EmpForm onSave={d => createMut.mutate(d)} saving={createMut.isPending}/>
      </Modal>

      <Modal open={!!showEdit} onClose={() => setShowEdit(null)} title="Edit Employee" size="lg">
        {showEdit && <EmpForm editData={showEdit} onSave={d => updateMut.mutate({ id: showEdit._id, data: d })} saving={updateMut.isPending}/>}
      </Modal>
    </div>
  );
}
