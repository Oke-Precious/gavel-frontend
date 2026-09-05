import React from 'react';
import EmptyState from '../../components/EmptyState.jsx';

export default function ProBonoPage() {
  return (
    <div style={{ padding: '2rem 0' }}>
      <EmptyState icon="inbox" message="Pro-Bono Matching" subtext="Coming soon." />
    </div>
  );
}
