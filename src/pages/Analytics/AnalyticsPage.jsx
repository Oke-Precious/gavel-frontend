import React, { useState, useEffect } from 'react';
import { Briefcase, Clock, Layers } from 'lucide-react';
import Card from '../../components/Card.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { analyticsApi } from '../../services/api.js';
import './AnalyticsPage.css';

export default function AnalyticsPage() {
  const [overview, setOverview] = useState(null);
  const [heatmap, setHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadAnalytics() {
      setLoading(true);
      setError(null);
      try {
        const [overRes, heatRes] = await Promise.all([
          analyticsApi.overview(),
          analyticsApi.heatmap(),
        ]);

        if (!cancelled) {
          setOverview(overRes);
          setHeatmap(Array.isArray(heatRes) ? heatRes : (heatRes?.heatmap ?? []));
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(!requestError?.response
            ? 'Network error — check your connection and try again.'
            : requestError.response.status >= 500
              ? 'Something went wrong on our end. Please try again in a moment.'
              : requestError.response?.data?.message ?? 'Unable to load analytics.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAnalytics();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="container analytics-container">
          <Skeleton variant="text" width="300px" height="36px" />
          <div className="analytics-grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} padding="lg">
                <Skeleton variant="card" height={100} />
              </Card>
            ))}
          </div>
          <Card padding="lg">
            <Skeleton variant="card" height={250} />
          </Card>
        </div>
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="analytics-page">
        <div className="container analytics-container">
          <Card padding="lg">
            <EmptyState icon="error" message="Analytics Unavailable" subtext={error} actionLabel="Try Again" onAction={() => window.location.reload()} />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="container analytics-container">
        {/* Header */}
        <div className="analytics-header">
          <h1 className="analytics-title">Judicial System Bottleneck Analytics</h1>
          <p className="analytics-subtitle">
            Executive insights on systemic delay factors, court backlog heatmaps, and stage velocity metrics.
          </p>
        </div>

        {/* Overview Stat Cards */}
        <div className="analytics-grid">
          <Card padding="lg">
            <div className="analytics-stat-header">
              <Briefcase size={20} />
              <span>Total Cases</span>
            </div>
            <div className="analytics-stat-value">
              {Number(overview.cases?.total ?? overview.totalCases ?? 0).toLocaleString()}
            </div>
            <div className="analytics-stat-caption">Cases currently tracked across the system</div>
          </Card>

          <Card padding="lg">
            <div className="analytics-stat-header">
              <Clock size={20} />
              <span>Active Cases</span>
            </div>
            <div className="analytics-stat-value">
              {Number(overview.cases?.active ?? overview.activeCases ?? 0).toLocaleString()}
            </div>
            <div className="analytics-stat-caption">Open cases requiring continued oversight</div>
          </Card>

          <Card padding="lg">
            <div className="analytics-stat-header">
              <Layers size={20} />
              <span>Pro-Bono Cases</span>
            </div>
            <div className="analytics-stat-value">
              {Number(overview.cases?.proBono ?? overview.proBonoCases ?? 0).toLocaleString()}
            </div>
            <div className="analytics-stat-caption">Cases marked for volunteer representation</div>
          </Card>
        </div>

        {/* Court Bottleneck Heatmap Table */}
        <Card padding="lg">
          <h2 className="analytics-card-title">Cases by Court and Stage</h2>
          <table className="heatmap-table">
            <thead>
              <tr>
                <th>Court</th>
                <th>Lifecycle Stage</th>
                <th>Cases</th>
              </tr>
            </thead>
            <tbody>
              {heatmap.map((row, idx) => (
                <tr key={idx}>
                  <td><strong>{row.court ?? row._id?.court ?? 'Not provided'}</strong></td>
                  <td>{row.stage ?? row._id?.stage ?? 'Not provided'}</td>
                  <td>{Number(row.count ?? 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
