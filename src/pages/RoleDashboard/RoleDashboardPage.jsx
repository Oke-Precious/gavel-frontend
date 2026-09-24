import React from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import DashboardPage from '../Dashboard/DashboardPage.jsx';
import RecordsDashboardPage from '../RecordsDashboard/RecordsDashboardPage.jsx';
import SuperAdminPage from '../SuperAdmin/SuperAdminPage.jsx';

export default function RoleDashboardPage() {
  const { user } = useAuth();

  if (user?.role === 'clerk') {
    return <RecordsDashboardPage />;
  }

  if (user?.role === 'super_admin') {
    return <SuperAdminPage />;
  }

  return <DashboardPage />;
}
