import React, { useState, useEffect } from 'react';
import { BarChart2, AlertTriangle, Clock, Layers, ShieldAlert } from 'lucide-react';
import Card from '../../components/Card.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import { analyticsApi } from '../../services/api.js';
import './AnalyticsPage.css';

const DEFAULT_HEATMAP = [
  { court: 'Ikeja Magistrate Court', state: 'Lagos', avgStallDays: 96, bottleneckStage: 'Court Adjournment', alert: 'high' },
  { court: 'Enugu High Court', state: 'Enugu', avgStallDays: 215, bottleneckStage: 'Missing Counsel', alert: 'high' },
  { court: 'Kano High Court', state: 'Kano', avgStallDays: 54, bottleneckStage: 'File in Transit', alert: 'medium' },
  { court: 'Port Harcourt Magistrate', state: 'Rivers', avgStallDays: 22, bottleneckStage: 'Awaiting DPP Advice', alert: 'low' },
  { court: 'Kaduna Magistrate', state: 'Kaduna', avgStallDays: 68, bottleneckStage: 'Court Adjournment', alert: 'medium' },
];

export default function AnalyticsPage() {
  const [overview, setOverview] = useState(null);
  const [heatmap, setHeatmap] = useState(DEFAULT_HEATMAP);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadAnalytics() {
      setLoading(true);
      try {
        const [overRes, heatRes] = await Promise.all([
          analyticsApi.overview().catch(() => null),
          analyticsApi.heatmap().catch(() => null),
        ]);

        if (!cancelled) {
          if (overRes) setOverview(overRes);
          if (heatRes && Array.isArray(heatRes)) setHeatmap(heatRes);
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Clock size={20} color="#D97706" />
              <span style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: 600 }}>Avg Detention Length</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>
              {overview?.avgDetentionDays ?? 92} Days
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>Exceeds statutory target by 64 days</div>
          </Card>

          <Card padding="lg">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <AlertTriangle size={20} color="#DC2626" />
              <span style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: 600 }}>Primary Bottleneck</span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>
              Court Adjournment
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>Accounts for 41% of total delay time</div>
          </Card>

          <Card padding="lg">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Layers size={20} color="#1E3A8A" />
              <span style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: 600 }}>High Delay Courts</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>
              14 Centers
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#94A3B8' }}>Requiring urgent intervention</div>
          </Card>
        </div>

        {/* Court Bottleneck Heatmap Table */}
        <Card padding="lg">
          <h2 className="analytics-card-title">Judicial Center Bottleneck Heatmap</h2>
          <table className="heatmap-table">
            <thead>
              <tr>
                <th>Judicial Center</th>
                <th>State</th>
                <th>Avg Stall Duration</th>
                <th>Top Bottleneck Factor</th>
                <th>Severity</th>
              </tr>
            </thead>
            <tbody>
              {heatmap.map((row, idx) => (
                <tr key={idx}>
                  <td><strong>{row.court}</strong></td>
                  <td>{row.state}</td>
                  <td>{row.avgStallDays} days</td>
                  <td>{row.bottleneckStage}</td>
                  <td>
                    <span className={`heatmap-intensity heatmap-intensity--${row.alert || 'medium'}`}>
                      {(row.alert || 'medium').toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
