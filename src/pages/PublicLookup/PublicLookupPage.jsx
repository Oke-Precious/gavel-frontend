import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSearch, Hash, Search, Copy } from 'lucide-react';
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
      const caseData = await publicApi.getCaseByHashId(cleanId);
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
    <div className="lookup-page">
      <div className="lookup-container">
        <div className="lookup-card">
          <div className="lookup-card__icon" aria-hidden="true">
            <FileSearch size={48} strokeWidth={1.5} />
          </div>

          <h1 className="lookup-card__title">Check a Case Status</h1>

          <form onSubmit={handleSearch} className="lookup-card__form" noValidate>
            <div className="lookup-card__field">
              <label htmlFor="case-hash-id-input" className="lookup-card__label">
                Enter Case Hash ID
              </label>
              <div className="lookup-card__input-wrapper">
                <Hash size={18} className="lookup-card__input-icon" />
                <input
                  id="case-hash-id-input"
                  type="text"
                  className="lookup-card__input"
                  placeholder="e.g. LA-2026-0483"
                  value={caseHashId}
                  onChange={(e) => setCaseHashId(e.target.value)}
                  disabled={isLoading}
                  autoComplete="off"
                  required
                />
              </div>
              <p className="lookup-card__helper">
                We never show names. Only the case number is needed to protect the privacy of everyone involved.
              </p>
            </div>

            <button
              type="submit"
              className="lookup-card__submit-btn"
              disabled={isLoading || !caseHashId.trim()}
            >
              <span>Search</span>
              <Search size={18} />
            </button>
          </form>
        </div>

        <div className="lookup-sample-row">
          <span>Try a sample case:</span>
          <button
            type="button"
            className="lookup-sample-chip"
            onClick={handleSampleClick}
          >
            <span>{SAMPLE_CASE_ID}</span>
            <Copy size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
