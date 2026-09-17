import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertOctagon,
  Scale,
} from 'lucide-react';
import Card from '../../components/Card.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { publicApi } from '../../services/api.js';
import './ScorecardPage.css';

export default function ScorecardPage() {
  const [data, setData] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadScorecardData() {
      setLoading(true);
      setError(null);
      try {
        const [scoreRes, trendRes] = await Promise.all([
          publicApi.scorecard(),
          publicApi.trends(),
        ]);

        if (!cancelled) {
          setData({
            totalCases: Number(scoreRes.totalCases ?? 0),
            activeCases: Number(scoreRes.activeCases ?? 0),
            resolvedCases: Number(scoreRes.resolvedCases ?? 0),
            stalledCases: Number(scoreRes.stalledCases ?? 0),
            resolutionRate: `${Number(scoreRes.resolutionRate ?? 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`,
          });
          setTrends(Array.isArray(trendRes) ? trendRes : (trendRes?.trends ?? []));
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(!requestError?.response
            ? 'Network error — check your connection and try again.'
            : requestError.response.status >= 500
              ? 'Something went wrong on our end. Please try again in a moment.'
              : requestError.response?.data?.message ?? 'Unable to load the transparency scorecard.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadScorecardData();
    return () => {
      cancelled = true;
    };
  }, []);

  const maxVal = Math.max(...trends.map((t) => Math.max(t.filed, t.resolved)), 2000);

  if (loading) {
    return (
      <div className="scorecard-page">
        <div className="container scorecard-container">
          <Skeleton variant="text" width="400px" height="36px" />
          <div className="scorecard-stats-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} padding="lg">
                <Skeleton variant="card" height={100} />
              </Card>
            ))}
          </div>
          <Card padding="lg">
            <Skeleton variant="card" height={240} />
          </Card>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="scorecard-page">
        <div className="container scorecard-container">
          <Card padding="lg">
            <EmptyState
              icon="error"
              message="Transparency Data Unavailable"
              subtext={error}
              actionLabel="Try Again"
              onAction={() => window.location.reload()}
            />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="scorecard-page">
      <div className="container scorecard-container">
        {/* Header */}
        <div className="scorecard-header">
          <h1 className="scorecard-title">National Transparency Scorecard</h1>
          <p className="scorecard-subtitle">
            Current aggregate data on awaiting-trial case progression and judicial resolution across records in GAVEL.
          </p>
        </div>

        {/* 4 Stat Cards Grid */}
        <div className="scorecard-stats-grid">
          {/* Card 1: Total Cases */}
          <div className="scorecard-stat-card">
            <div className="scorecard-stat-header">
              <span className="scorecard-stat-label">Total Cases Tracked</span>
              <div className="scorecard-stat-icon scorecard-stat-icon--primary">
                <Scale size={20} />
              </div>
            </div>
            <div className="scorecard-stat-value">
              {data.totalCases.toLocaleString()}
            </div>
            <div className="scorecard-stat-subtext">Across records currently in GAVEL</div>
          </div>

          {/* Card 2: Active Pre-Trial */}
          <div className="scorecard-stat-card">
            <div className="scorecard-stat-header">
              <span className="scorecard-stat-label">Active Pre-Trial</span>
              <div className="scorecard-stat-icon scorecard-stat-icon--warning">
                <Clock size={20} />
              </div>
            </div>
            <div className="scorecard-stat-value">
              {data.activeCases.toLocaleString()}
            </div>
            <div className="scorecard-stat-subtext">Currently awaiting trial</div>
          </div>

          {/* Card 3: Stalled Cases */}
          <div className="scorecard-stat-card">
            <div className="scorecard-stat-header">
              <span className="scorecard-stat-label">Stalled Cases</span>
              <div className="scorecard-stat-icon scorecard-stat-icon--danger">
                <AlertOctagon size={20} />
              </div>
            </div>
            <div className="scorecard-stat-value">
              {data.stalledCases.toLocaleString()}
            </div>
            <div className="scorecard-stat-subtext">Exceeding statutory limits</div>
          </div>

          {/* Card 4: Resolution Rate */}
          <div className="scorecard-stat-card">
            <div className="scorecard-stat-header">
              <span className="scorecard-stat-label">Resolution Efficiency</span>
              <div className="scorecard-stat-icon scorecard-stat-icon--success">
                <CheckCircle2 size={20} />
              </div>
            </div>
            <div className="scorecard-stat-value">
              {data.resolutionRate}
            </div>
            <div className="scorecard-stat-subtext">
              {data.resolvedCases.toLocaleString()} cases resolved
            </div>
          </div>
        </div>

        {/* Case Progression Trends Section */}
        <Card padding="lg" className="scorecard-trends-card">
          <div className="scorecard-trends-header">
            <h2 className="scorecard-trends-title">Monthly Case Progression Trends</h2>
            <div className="trends-chart__legend">
              <div className="trends-chart__legend-item">
                <span className="trends-chart__dot trends-chart__dot--filed" />
                <span>Cases Filed</span>
              </div>
              <div className="trends-chart__legend-item">
                <span className="trends-chart__dot trends-chart__dot--resolved" />
                <span>Cases Resolved</span>
              </div>
            </div>
          </div>

          <div className="trends-chart">
            {trends.map((item) => {
              const filedHeight = Math.round((item.filed / maxVal) * 160);
              const resolvedHeight = Math.round((item.resolved / maxVal) * 160);
              return (
                <div key={item.period} className="trends-chart__col">
                  <div className="trends-chart__bars">
                    <div
                      className="trends-chart__bar trends-chart__bar--filed"
                      style={{ height: `${filedHeight}px` }}
                      title={`Filed: ${item.filed}`}
                    />
                    <div
                      className="trends-chart__bar trends-chart__bar--resolved"
                      style={{ height: `${resolvedHeight}px` }}
                      title={`Resolved: ${item.resolved}`}
                    />
                  </div>
                  <span className="trends-chart__label">{item.period}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
