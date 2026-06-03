import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const PERIODS = ['Q1', 'Q2', 'Q3', 'Q4', 'H1', 'H2', 'Annual'];

const DEFAULT_KPIS = [
  { name: 'Task Completion Rate', description: 'Tasks completed on time', target: 100, actual: 0, score: 0, weight: 30 },
  { name: 'Work Quality', description: 'Quality score based on feedback', target: 10, actual: 0, score: 0, weight: 25 },
  { name: 'Team Collaboration', description: 'Peer feedback score', target: 10, actual: 0, score: 0, weight: 25 },
  { name: 'Punctuality', description: 'Attendance and time management', target: 10, actual: 0, score: 0, weight: 20 },
];

const PageLoader = () => <div className="page-loader">Loading...</div>;

const Empty = ({ message }) => (
  <div className="card p-6 text-center text-gray-500">{message}</div>
);

const Badge = ({ status }) => (
  <span className="badge-blue">{status || 'pending'}</span>
);

const Avatar = ({ name = 'User' }) => (
  <div className="avatar-md bg-green-100 text-green-700">
    {name.charAt(0).toUpperCase()}
  </div>
);

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-4xl p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="btn-secondary">Close</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const FormField = ({ label, children }) => (
  <div>
    <label className="form-label">{label}</label>
    {children}
  </div>
);

const ratingMeta = (rating) => {
  if (rating >= 4.5) return { label: 'Outstanding', color: '#16a34a' };
  if (rating >= 3.5) return { label: 'Exceeds Expectations', color: '#2563eb' };
  if (rating >= 2.5) return { label: 'Meets Expectations', color: '#d97706' };
  return { label: 'Needs Improvement', color: '#dc2626' };
};

export default function PerformancePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isAdmin = ['admin', 'senior_manager', 'hr_recruiter'].includes(user?.role);

  const [tab, setTab] = useState('my');
  const [showCreate, setShowCreate] = useState(false);
  const [aiLoading, setAiLoading] = useState(null);

  const [form, setForm] = useState({
    employee: '',
    period: 'Q2',
    year: 2026,
    kpis: DEFAULT_KPIS,
  });

  const { data: myReviews = [], isLoading: myLoading } = useQuery({
    queryKey: ['myReviews'],
    queryFn: async () => {
      const res = await api.get('/performance/my');
      return res.data;
    },
  });

  const { data: allReviews = [], isLoading: allLoading } = useQuery({
    queryKey: ['allReviews'],
    enabled: isAdmin,
    queryFn: async () => {
      const res = await api.get('/performance');
      return res.data;
    },
  });

  const { data: employees = [] } = useQuery({
    queryKey: ['employeesList'],
    enabled: isAdmin,
    queryFn: async () => {
      const res = await api.get('/employees', { params: { limit: 100 } });
      return res.data.employees || [];
    },
  });

  const createReview = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post('/performance', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myReviews'] });
      queryClient.invalidateQueries({ queryKey: ['allReviews'] });
      setShowCreate(false);
      toast.success('Review created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create review');
    },
  });

  const generateAI = async (id) => {
    try {
      setAiLoading(id);
      await api.post(`/ai/performance/${id}/generate`);
      queryClient.invalidateQueries({ queryKey: ['myReviews'] });
      queryClient.invalidateQueries({ queryKey: ['allReviews'] });
      toast.success('AI review generated');
    } catch (error) {
      toast.error(error.response?.data?.error || 'AI generation failed');
    } finally {
      setAiLoading(null);
    }
  };

  const updateKpi = (index, field, value) => {
    setForm((prev) => {
      const updatedKpis = [...prev.kpis];
      updatedKpis[index] = {
        ...updatedKpis[index],
        [field]: field === 'name' || field === 'description' ? value : Number(value),
      };
      return { ...prev, kpis: updatedKpis };
    });
  };

  const reviews = tab === 'my' ? myReviews : allReviews;
  const loading = tab === 'my' ? myLoading : allLoading;

  return (
    <div className="space-y-5 stagger">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Performance Reviews</h1>

        {isAdmin && (
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            + New Review
          </button>
        )}
      </div>

      {isAdmin && (
        <div className="tab-list w-fit">
          <button className={`tab-btn ${tab === 'my' ? 'active' : ''}`} onClick={() => setTab('my')}>
            My Reviews
          </button>
          <button className={`tab-btn ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>
            All Reviews
          </button>
        </div>
      )}

      {loading ? (
        <PageLoader />
      ) : (
        <div className="space-y-4">
          {reviews.length === 0 && <Empty message="No performance reviews found" />}

          {reviews.map((review) => {
            const meta = review.rating ? ratingMeta(review.rating) : null;

            return (
              <div key={review._id} className="card p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    {tab === 'all' && (
                      <Avatar name={`${review.employee?.firstName || ''} ${review.employee?.lastName || ''}`} />
                    )}

                    <div>
                      {tab === 'all' && (
                        <p className="font-semibold">
                          {review.employee?.firstName} {review.employee?.lastName}
                        </p>
                      )}
                      <p className="text-sm font-semibold">
                        {review.period} {review.year}
                      </p>
                      <p className="text-xs text-gray-400">
                        Reviewer: {review.reviewer?.firstName || 'N/A'} {review.reviewer?.lastName || ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {meta && (
                      <span
                        className="text-sm font-bold px-3 py-1.5 rounded-lg"
                        style={{
                          color: meta.color,
                          background: `${meta.color}15`,
                          border: `1px solid ${meta.color}30`,
                        }}
                      >
                        {meta.label} ({review.rating}/5)
                      </span>
                    )}

                    <Badge status={review.status} />

                    {review.aiReview && <span className="ai-badge">AI Powered</span>}

                    {isAdmin && !review.aiReview && (
                      <button
                        className="btn-primary btn-sm"
                        disabled={aiLoading === review._id}
                        onClick={() => generateAI(review._id)}
                      >
                        {aiLoading === review._id ? 'Generating...' : 'Generate AI Review'}
                      </button>
                    )}
                  </div>
                </div>

                {review.kpis?.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
                    {review.kpis.map((kpi, index) => (
                      <div key={index} className="p-3 rounded-xl bg-slate-50 border">
                        <p className="text-xs text-gray-500">{kpi.name}</p>
                        <p className="text-xl font-black mt-1">
                          {kpi.score}
                          <span className="text-xs font-normal text-gray-400">/10</span>
                        </p>
                        <div className="h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(Number(kpi.score || 0) * 10, 100)}%`,
                              background:
                                kpi.score >= 7 ? '#16a34a' : kpi.score >= 5 ? '#d97706' : '#dc2626',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {review.aiReview && (
                  <div className="ai-card mt-4">
                    <p className="text-sm leading-relaxed">{review.aiReview}</p>

                    {review.strengths?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-bold text-green-600">Strengths</p>
                        {review.strengths.map((item, index) => (
                          <p key={index} className="text-xs text-gray-600">• {item}</p>
                        ))}
                      </div>
                    )}

                    {review.improvements?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-bold text-amber-600">Areas to Improve</p>
                        {review.improvements.map((item, index) => (
                          <p key={index} className="text-xs text-gray-600">• {item}</p>
                        ))}
                      </div>
                    )}

                    {review.goals?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-bold text-blue-600">Goals</p>
                        {review.goals.map((item, index) => (
                          <p key={index} className="text-xs text-gray-600">• {item}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Performance Review">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <FormField label="Employee">
              <select
                className="input"
                value={form.employee}
                onChange={(e) => setForm((prev) => ({ ...prev, employee: e.target.value }))}
              >
                <option value="">Select employee</option>
                {employees.map((employee) => (
                  <option key={employee._id} value={employee._id}>
                    {employee.firstName} {employee.lastName}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Period">
              <select
                className="input"
                value={form.period}
                onChange={(e) => setForm((prev) => ({ ...prev, period: e.target.value }))}
              >
                {PERIODS.map((period) => (
                  <option key={period} value={period}>{period}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Year">
              <select
                className="input"
                value={form.year}
                onChange={(e) => setForm((prev) => ({ ...prev, year: Number(e.target.value) }))}
              >
                {[2024, 2025, 2026].map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase">KPI Scores</p>

            {form.kpis.map((kpi, index) => (
              <div key={index} className="p-3 rounded-xl bg-slate-50 border">
                <p className="text-sm font-semibold">{kpi.name}</p>
                <p className="text-xs text-gray-400">{kpi.description}</p>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    className="input"
                    value={kpi.actual}
                    onChange={(e) => updateKpi(index, 'actual', e.target.value)}
                    placeholder="Actual"
                  />

                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    className="input"
                    value={kpi.score}
                    onChange={(e) => updateKpi(index, 'score', e.target.value)}
                    placeholder="Score"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              className="btn-primary flex-1"
              disabled={!form.employee || createReview.isPending}
              onClick={() => createReview.mutate({ ...form, status: 'submitted' })}
            >
              {createReview.isPending ? 'Creating...' : 'Create Review'}
            </button>

            <button className="btn-secondary" onClick={() => setShowCreate(false)}>
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}