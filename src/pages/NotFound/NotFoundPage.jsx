import React from 'react';
import { SearchX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button.jsx';
import './NotFoundPage.css';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <div className="not-found-page__content">
        <SearchX className="not-found-page__icon" size={64} strokeWidth={1.5} aria-hidden="true" />
        <h1 className="not-found-page__code">404</h1>
        <h3>This page doesn't exist</h3>
        <p className="not-found-page__message">
          The page you're looking for may have moved, or the link might be outdated.
        </p>
        <div className="not-found-page__actions">
          <Button variant="primary" size="md" onClick={() => navigate('/')}>Back to Home</Button>
          <Button variant="ghost" size="md" onClick={() => navigate('/lookup')}>Look Up a Case</Button>
        </div>
      </div>
    </div>
  );
}
