import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Layout from './components/layout/Layout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import EmployeesPage from './pages/EmployeesPage.jsx';
import AttendancePage from './pages/AttendancePage.jsx';
import LeavePage from './pages/LeavePage.jsx';
import PayrollPage from './pages/PayrollPage.jsx';
import PerformancePage from './pages/PerformancePage.jsx';
import RecruitmentPage from './pages/RecruitmentPage.jsx';
import ChatbotPage from './pages/ChatbotPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import VideoInterviewPage from './pages/VideoInterviewPage.jsx';
import AIInterviewPage from './pages/AIInterviewPage.jsx';

const Spinner = () => (
  <div className="fixed inset-0 flex items-center justify-center" style={{background:'var(--surface)'}}>
    <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
      <svg className="animate-spin w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>
  </div>
);

const Guard = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Guard><Layout /></Guard>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="employees" element={<Guard roles={['admin','senior_manager','hr_recruiter']}><EmployeesPage /></Guard>} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="leave" element={<LeavePage />} />
          <Route path="payroll" element={<PayrollPage />} />
          <Route path="performance" element={<PerformancePage />} />
          <Route path="recruitment" element={<Guard roles={['admin','hr_recruiter','senior_manager']}><RecruitmentPage /></Guard>} />
          <Route path="interviews" element={<Guard roles={['admin','hr_recruiter','senior_manager']}><VideoInterviewPage /></Guard>} />
          <Route path="ai-interview" element={<Guard roles={['admin','hr_recruiter','senior_manager']}><AIInterviewPage /></Guard>} />
          <Route path="onboarding" element={<OnboardingPage />} />
          <Route path="chatbot" element={<ChatbotPage />} />
          <Route path="reports" element={<Guard roles={['admin','senior_manager','hr_recruiter']}><ReportsPage /></Guard>} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}
