import React from 'react';
import EmptyState from '../../components/EmptyState.jsx';

export default function DashboardPage() {
  return (
    <div style={{ padding: '2rem 0' }}>
      <EmptyState icon="inbox" message="Dashboard" subtext="Coming soon." />
    </div>
  );
}
