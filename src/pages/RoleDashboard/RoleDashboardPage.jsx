import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import DashboardPage from '../Dashboard/DashboardPage.jsx';
import RecordsDashboardPage from '../RecordsDashboard/RecordsDashboardPage.jsx';

export default function RoleDashboardPage() {
  const { user } = useAuth();

  if (user?.role === 'clerk') {
    return <RecordsDashboardPage />;
  }

  if (user?.role === 'super_admin') {
    return <Navigate to="/super-admin" replace />;
  }

  if (user?.role === 'admin') {
    return <Navigate to="/users" replace />;
  }

  return <DashboardPage />;
}
