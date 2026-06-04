import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

// FIX: Updated context and hook imports matching Solution 1's new paths
import { AuthProvider } from './context/AuthProvider'; 
import { useAuth } from './hooks/useAuth';

import  Layout  from './components/layout/layout';
import  LoginPage  from './pages/LoginPage';
import  RegisterPage  from './pages/RegisterPage';
import  DashboardPage  from './pages/DashboardPage';
import  ProjectsPage  from './pages/ProjectsPage';
import  TasksPage  from './pages/TasksPage';
import LandingPage from './pages/LandingPage'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-base)' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading...</p>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" /> : children;
};


const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
    <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/tasks" element={<TasksPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);


export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              fontFamily: 'var(--font-ui)',
              fontSize: 13,
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

