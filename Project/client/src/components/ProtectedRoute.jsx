import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function ProtectedRoute({ children, roles }) {
  const { authenticated, user, loading } = useAuth();
  const location = useLocation();

  // ── Loading splash ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#050505'
      }}>
        <div style={{
          width: 40, height: 40, border: '3px solid rgba(255,210,31,0.2)',
          borderTopColor: '#FFD21F', borderRadius: '50%',
          animation: 'spin 0.7s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Not authenticated → send to the right login page ───────────────────────
  if (!authenticated) {
    // If they were trying to reach an Admin-only or Driver-only route
    if (roles?.includes('Admin'))  return <Navigate to="/admin-login"  replace />;
    if (roles?.includes('Driver')) return <Navigate to="/driver-login" replace />;
    return <Navigate to="/login" replace />;
  }

  // ── Authenticated but wrong role → redirect to their own portal ─────────────
  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    if (user?.role === 'Admin')  return <Navigate to="/admin"  replace />;
    if (user?.role === 'Driver') return <Navigate to="/driver" replace />;
    return <Navigate to="/" replace />;
  }

  // ── Correct role but navigated to wrong portal (e.g. Admin hits "/") ────────
  if (!roles || roles.length === 0) {
    // Admin trying to use passenger area → redirect to admin
    if (user?.role === 'Admin')  return <Navigate to="/admin"  replace />;
    // Driver trying to use passenger area → redirect to driver
    if (user?.role === 'Driver') return <Navigate to="/driver" replace />;
  }

  return children;
}

export default ProtectedRoute;
