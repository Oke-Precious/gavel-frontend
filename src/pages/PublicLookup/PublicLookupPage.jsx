import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSearch, Hash, Search, Copy } from 'lucide-react';
import { publicApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { validateCaseHashId } from '../../utils/validators.js';
import './PublicLookupPage.css';

const SAMPLE_CASE_ID = import.meta.env.VITE_SAMPLE_CASE_HASH_ID ?? '';

export default function PublicLookupPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [caseHashId, setCaseHashId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const cleanId = caseHashId.trim();
    const validationError = validateCaseHashId(cleanId);
    if (validationError) {
      toast.warning(validationError);
      return;
    }

    setIsLoading(true);
    try {
      const caseData = await publicApi.getCaseByHashId(cleanId);
      const finalHash = caseData?.hashId || cleanId;
      navigate(`/lookup/${encodeURIComponent(finalHash)}`);
    } catch (err) {
      if (err.response?.status === 404) {
        navigate(`/lookup/not-found/${encodeURIComponent(cleanId)}`);
      } else if (!err.response) {
        toast.error('Network error — check your connection and try again.');
      } else {
        toast.error(err.response?.data?.message || 'Unable to look up this case right now.');
      }
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
                  placeholder="e.g. GAV-26-8A3F9"
                  value={caseHashId}
                  onChange={(e) => setCaseHashId(e.target.value)}
                  disabled={isLoading}
                  autoComplete="off"
                  required
                />
              </div>
              <p className="lookup-card__helper">
                We never show names. Only the Case Hash ID is needed to protect the privacy of everyone involved.
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

        {SAMPLE_CASE_ID && (
          <div className="lookup-sample-row">
            <span>Try a sample case:</span>
            <button type="button" className="lookup-sample-chip" onClick={handleSampleClick}>
              <span>{SAMPLE_CASE_ID}</span>
              <Copy size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
