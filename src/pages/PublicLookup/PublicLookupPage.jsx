import React from 'react';
import EmptyState from '../../components/EmptyState.jsx';

export default function PublicLookupPage() {
  return (
    <div style={{ padding: '4rem 2rem' }}>
      <EmptyState icon="search" message="Case Lookup" subtext="This page is coming soon." />
    </div>
  );
}
