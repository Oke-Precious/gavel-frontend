import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--color-bg)',
      fontFamily: 'Inter, sans-serif',
      padding: '2rem',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 440 }}>
        <Scale size={48} strokeWidth={1.25} style={{ color: 'var(--color-border)', margin: '0 auto 1.5rem' }} />
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '0.5rem' }}>
          Page not found
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
          The page you're looking for doesn't exist or may have moved.
        </p>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--color-indigo)',
            color: '#ffffff',
            padding: '0.625rem 1.25rem',
            borderRadius: '8px',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} strokeWidth={2} />
          Back to home
        </Link>
      </div>
    </div>
  );
}
