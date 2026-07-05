import './App.css'
import ResidentDashboard from './pages/ResidentDashboard';
import SecurityDashboard from './pages/SecurityDashboard';
import LandingPage from './pages/LandingPage';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { auth } = useContext(AuthContext);

  if (!auth.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(auth.user?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {

  return (
    <>
      <Router>
      <Routes>
        <Route path="/" element={<LandingPage/>} />
        <Route
          path="/resident-dashboard"
          element={
            <ProtectedRoute allowedRoles={['USER']}>
              <ResidentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/security-dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <SecurityDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
    </>
  )
}

export default App
