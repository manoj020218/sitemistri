import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Onboarding from './pages/Onboarding';
import TechDashboard from './pages/TechDashboard';
import SIDashboard from './pages/SIDashboard';
import SiteWorkDetail from './pages/SiteWorkDetail';
import AdminPanel from './pages/AdminPanel';
import WhatsAppTemplates from './pages/WhatsAppTemplates';

const T = { paper: '#f5f0e8', saffron: '#e8630a', ink: '#0f0e0c' };

function Spinner() {
  return (
    <div style={{
      minHeight: '100vh', background: T.paper,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: T.ink, display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontSize: 24,
      }}>📡</div>
      <div style={{
        width: 32, height: 32, border: `3px solid ${T.saffron}`,
        borderTopColor: 'transparent', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function RequireAuth({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/onboarding" replace />;
  if (!user.termsAccepted || !user.mobile || !user.roles?.length) {
    return <Navigate to="/onboarding" replace />;
  }
  if (role && !user.roles.includes(role)) return <Navigate to="/" replace />;
  return children;
}

function HomeRouter() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/onboarding" replace />;
  if (!user.termsAccepted || !user.mobile || !user.roles?.length) {
    return <Navigate to="/onboarding" replace />;
  }
  // Both roles: remember last dashboard in localStorage
  if (user.roles.includes('TECHNICIAN') && user.roles.includes('SI')) {
    const last = localStorage.getItem('sm_last_dash') || 'tech';
    return <Navigate to={`/${last}`} replace />;
  }
  if (user.roles.includes('TECHNICIAN')) return <Navigate to="/tech" replace />;
  if (user.roles.includes('SI')) return <Navigate to="/si" replace />;
  return <Navigate to="/onboarding" replace />;
}

function OnboardingRoute() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  // If fully onboarded, skip to dashboard
  if (user?.termsAccepted && user?.mobile && user?.roles?.length) {
    return <Navigate to="/" replace />;
  }
  return <Onboarding />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/"            element={<HomeRouter />} />
      <Route path="/onboarding"  element={<OnboardingRoute />} />
      <Route path="/tech"        element={<RequireAuth role="TECHNICIAN"><TechDashboard /></RequireAuth>} />
      <Route path="/si"          element={<RequireAuth role="SI"><SIDashboard /></RequireAuth>} />
      <Route path="/work/:id"    element={<RequireAuth><SiteWorkDetail /></RequireAuth>} />
      <Route path="/admin"       element={<RequireAuth><AdminPanel /></RequireAuth>} />
      <Route path="/wa"          element={<RequireAuth><WhatsAppTemplates /></RequireAuth>} />
      <Route path="*"            element={<Navigate to="/" replace />} />
    </Routes>
  );
}
