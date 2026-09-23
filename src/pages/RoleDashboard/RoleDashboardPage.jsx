import React from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import DashboardPage from '../Dashboard/DashboardPage.jsx';
import RecordsDashboardPage from '../RecordsDashboard/RecordsDashboardPage.jsx';

export default function RoleDashboardPage() {
  const { user } = useAuth();

  if (user?.role === 'clerk') {
    return <RecordsDashboardPage />;
  }

  return <DashboardPage />;
}
