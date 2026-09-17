import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

/** Prevents authenticated users from opening pages outside their role. */
export default function RequireRole({ roles, children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace state={{ deniedFrom: location.pathname }} />;
  }

  return children;
}
