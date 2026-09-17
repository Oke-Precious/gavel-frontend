import React, { useState, useEffect } from 'react';
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

  const handleFetchCase = async (idToFetch) => {
    const cleanId = (idToFetch || searchQuery).trim();
    if (!cleanId) return;

    setIsLoading(true);
    setNetworkError(null);

    try {
      const data = await publicApi.getCaseByHashId(cleanId);
      navigate(`/lookup/${encodeURIComponent(data?.caseHashId || cleanId)}`);
    } catch (err) {
      console.error('API Error fetching case by hash ID:', err);
      setNetworkError(
        err.response?.data?.message ||
          `No public case record found matching ID "${cleanId}".`
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (caseHashId && caseHashId !== 'not-found') {
      handleFetchCase(caseHashId);
    }
  }, [caseHashId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleFetchCase(searchQuery);
    }
  };

  return (
    <main id="main-content" className="case-not-found-page">
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
                      placeholder="e.g. LA-2026-0483"
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

              <div className="case-not-found-telemetry">
                <span className="case-not-found-tag">BACKEND TELEMETRY</span>
                <p className="case-not-found-endpoint">
                  Endpoint: <code className="about-code">GET /public/cases/{encodeURIComponent(caseHashId || searchQuery || ':caseHashId')}</code>
                </p>
                {networkError && (
                  <p className="case-not-found-api-msg">
                    API Response: <em>{networkError}</em>
                  </p>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}
