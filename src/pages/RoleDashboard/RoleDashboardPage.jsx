import React from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import DashboardPage from '../Dashboard/DashboardPage.jsx';
import RecordsDashboardPage from '../RecordsDashboard/RecordsDashboardPage.jsx';
import AdminOverviewPage from '../AdminOverview/AdminOverviewPage.jsx';

export default function RoleDashboardPage() {
  const { user } = useAuth();

  if (user?.role === 'clerk') {
    return <RecordsDashboardPage />;
  }

  if (user?.role === 'super_admin' || user?.role === 'admin') {
    return <AdminOverviewPage />;
  }

  return <DashboardPage />;
}

