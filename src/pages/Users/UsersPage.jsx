import React from 'react';
import EmptyState from '../../components/EmptyState.jsx';

export default function UsersPage() {
  return (
    <div style={{ padding: '2rem 0' }}>
      <EmptyState icon="inbox" message="User Management" subtext="Coming soon." />
    </div>
  );
}
