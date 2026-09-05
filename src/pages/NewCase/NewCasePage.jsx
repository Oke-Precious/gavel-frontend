import React from 'react';
import EmptyState from '../../components/EmptyState.jsx';

export default function NewCasePage() {
  return (
    <div style={{ padding: '2rem 0' }}>
      <EmptyState icon="inbox" message="New Case" subtext="Coming soon." />
    </div>
  );
}
