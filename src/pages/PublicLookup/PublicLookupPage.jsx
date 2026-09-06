import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileSearch, Hash, Copy } from 'lucide-react';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import { publicApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import './PublicLookupPage.css';

const SAMPLE_CASE_ID = 'LA-2026-0483';

export default function PublicLookupPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [caseHashId, setCaseHashId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const cleanId = caseHashId.trim();

    if (!cleanId) {
      toast.warning('Please enter a valid Case Hash ID.');
      return;
    }

    setIsLoading(true);
    try {
      // Call public API endpoint: GET /public/cases/:caseHashId
      const caseData = await publicApi.getCaseByHashId(cleanId);
      // Navigate to detailed view on success
      const finalHash = caseData?.caseHashId || cleanId;
      navigate(`/lookup/${encodeURIComponent(finalHash)}`);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        `No case record found matching "${cleanId}". Please check the ID and try again.`;
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSampleClick = () => {
    setCaseHashId(SAMPLE_CASE_ID);
  };

  return (
    <div className="public-lookup-page">
      <div className="container public-lookup-container">
        <Card className="lookup-card" padding="lg">
          <div className="lookup-card__header">
            <div className="lookup-card__icon-box" aria-hidden="true">
              <FileSearch size={32} className="lookup-card__icon" />
            </div>
            <h1 className="lookup-card__title">Check a Case Status</h1>
          </div>

          <form onSubmit={handleSearch} className="lookup-card__form" noValidate>
            <div className="lookup-card__field">
              <label htmlFor="case-hash-id-input" className="lookup-card__label">
                Enter Case Hash ID
              </label>
              <div className="lookup-card__input-wrapper">
                <Hash size={18} className="lookup-card__input-icon" aria-hidden="true" />
                <input
                  id="case-hash-id-input"
                  type="text"
                  className="lookup-card__input"
                  placeholder="e.g. LA-2026-0483"
                  value={caseHashId}
                  onChange={(e) => setCaseHashId(e.target.value)}
                  disabled={isLoading}
                  autoComplete="off"
                  aria-describedby="privacy-helper-text"
                  required
                />
              </div>
              <p id="privacy-helper-text" className="lookup-card__helper">
                We never show names. Only the case number is needed to protect the privacy of everyone involved.
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              disabled={!caseHashId.trim()}
              iconRight={Search}
              className="lookup-card__submit-btn"
            >
              Search
            </Button>
          </form>
        </Card>

        <div className="lookup-card__demo-hint">
          <span className="demo-hint__text">Try a sample case:</span>
          <button
            type="button"
            className="demo-hint__chip"
            onClick={handleSampleClick}
            aria-label={`Use sample case ID ${SAMPLE_CASE_ID}`}
          >
            <span>{SAMPLE_CASE_ID}</span>
            <Copy size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

