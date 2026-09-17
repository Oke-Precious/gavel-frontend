import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import './WatchConfirmationPage.css';

export default function WatchConfirmationPage() {
  const { caseHashId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const decodedCaseHashId = caseHashId ?? '';
  const subscriptionConfirmed = location.state?.subscriptionConfirmed === true;

  const returnToCase = () => {
    navigate(`/lookup/${encodeURIComponent(decodedCaseHashId)}`, { replace: true });
  };

  if (!subscriptionConfirmed) {
    return (
      <div className="watch-confirmation-page">
        <Card padding="lg" className="watch-confirmation-card">
          <EmptyState
            icon="error"
            message="Confirmation Unavailable"
            subtext="Complete the Watch This Case form before opening this confirmation page."
            actionLabel="Back to Case"
            onAction={returnToCase}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="watch-confirmation-page">
      <Card
        padding="lg"
        className="watch-confirmation-card"
        role="status"
        aria-live="polite"
      >
        <CheckCircle2
          className="watch-confirmation-card__icon"
          size={48}
          strokeWidth={1.75}
          aria-hidden="true"
        />
        <h3>You're Watching This Case</h3>
        <p>
          We'll email you if Case {decodedCaseHashId} changes status. We store nothing else.
        </p>
        <Button variant="primary" size="md" onClick={returnToCase} autoFocus>
          Done
        </Button>
      </Card>
    </div>
  );
}
