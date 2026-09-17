import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FileX, Search, ArrowLeft, Hash } from 'lucide-react';
import Button from '../../components/Button.jsx';
import Card from '../../components/Card.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import { publicApi } from '../../services/api.js';
import './CaseNotFoundPage.css';

export default function CaseNotFoundPage() {
  const { caseHashId } = useParams();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState(caseHashId || '');
  const [isLoading, setIsLoading] = useState(false);
  const [networkError, setNetworkError] = useState(null);

  const handleFetchCase = useCallback(async (idToFetch) => {
    const cleanId = String(idToFetch ?? '').trim();
    if (!cleanId) return;

    setIsLoading(true);
    setNetworkError(null);

    try {
      const data = await publicApi.getCaseByHashId(cleanId);
      navigate(`/lookup/${encodeURIComponent(data?.hashId || cleanId)}`);
    } catch (err) {
      setNetworkError(
        err.response?.data?.message ||
          `No public case record found matching ID "${cleanId}".`
      );
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (caseHashId && caseHashId !== 'not-found') {
      const loadTimer = window.setTimeout(() => handleFetchCase(caseHashId), 0);
      return () => window.clearTimeout(loadTimer);
    }
    return undefined;
  }, [caseHashId, handleFetchCase]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleFetchCase(searchQuery);
    }
  };

  return (
    <div className="case-not-found-page">
      <div className="container case-not-found-container">
        <div className="case-not-found-nav">
          <Link to="/lookup">
            <Button variant="ghost" size="sm" iconLeft={ArrowLeft}>
              Back to Lookup
            </Button>
          </Link>
        </div>

        {isLoading && (
          <Card padding="lg" className="case-not-found-card">
            <div className="case-not-found-skeleton" aria-busy="true" aria-label="Searching backend for case ID">
              <Skeleton variant="circle" width={56} height={56} />
              <Skeleton variant="text" width="60%" height={24} className="u-mt-3" />
              <Skeleton variant="text" width="40%" height={16} className="u-mt-2" />
            </div>
          </Card>
        )}

        {!isLoading && (
          <Card padding="lg" className="case-not-found-card">
            <div className="case-not-found-content">
              <div className="case-not-found-icon-wrap" aria-hidden="true">
                <FileX size={56} strokeWidth={1.25} />
              </div>

              <h3 className="case-not-found-title">
                No case found with that ID
              </h3>

              <p className="case-not-found-text">
                Double-check the Case Hash ID and try again.
              </p>

              <div className="case-not-found-actions">
                <Link to="/lookup">
                  <Button variant="primary" size="md" iconLeft={Search}>
                    Try Again
                  </Button>
                </Link>
              </div>

              <form onSubmit={handleSearchSubmit} className="case-not-found-form" noValidate>
                <div className="case-not-found-field">
                  <label htmlFor="retry-hash-input" className="case-not-found-label">
                    Search Case Hash ID
                  </label>
                  <div className="case-not-found-input-wrap">
                    <Hash size={18} className="case-not-found-input-icon" />
                    <input
                      id="retry-hash-input"
                      type="text"
                      className="case-not-found-input"
                      placeholder="e.g. GAV-26-8A3F9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      disabled={isLoading}
                      autoComplete="off"
                    />
                    <Button
                      type="submit"
                      variant="secondary"
                      size="sm"
                      disabled={isLoading || !searchQuery.trim()}
                    >
                      Search
                    </Button>
                  </div>
                </div>
              </form>

              {networkError && <p className="case-not-found-api-msg" role="alert">{networkError}</p>}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
