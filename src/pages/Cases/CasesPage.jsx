import React from 'react';
import EmptyState from '../../components/EmptyState.jsx';

export default function CasesPage() {
  return (
    <div style={{ padding: '2rem 0' }}>
      <EmptyState icon="inbox" message="Cases" subtext="Coming soon." />
    </div>
  );
}
