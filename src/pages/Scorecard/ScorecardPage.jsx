import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertOctagon,
  Scale,
  Calendar,
} from 'lucide-react';
import Card from '../../components/Card.jsx';
import Skeleton from '../../components/Skeleton.jsx';
import { publicApi } from '../../services/api.js';
import './ScorecardPage.css';

const DEFAULT_SCORECARD = {
  totalCases: 51955,
  activeCases: 34120,
  resolvedCases: 12485,
  stalledCases: 5350,
  resolutionRate: '24.0%',
};

const DEFAULT_TRENDS = [
  { period: 'Oct 2025', filed: 1200, resolved: 840 },
  { period: 'Nov 2025', filed: 1450, resolved: 990 },
  { period: 'Dec 2025', filed: 1100, resolved: 1050 },
  { period: 'Jan 2026', filed: 1600, resolved: 1220 },
  { period: 'Feb 2026', filed: 1850, resolved: 1410 },
  { period: 'Mar 2026', filed: 1720, resolved: 1530 },
];

export default function ScorecardPage() {
  const [data, setData] = useState(DEFAULT_SCORECARD);
  const [trends, setTrends] = useState(DEFAULT_TRENDS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadScorecardData() {
      setLoading(true);
      try {
        const [scoreRes, trendRes] = await Promise.all([
          publicApi.scorecard().catch(() => null),
          publicApi.trends().catch(() => null),
        ]);

        if (!cancelled) {
          if (scoreRes) {
            setData({
              totalCases: scoreRes.totalCases ?? DEFAULT_SCORECARD.totalCases,
              activeCases: scoreRes.activeCases ?? DEFAULT_SCORECARD.activeCases,
              resolvedCases: scoreRes.resolvedCases ?? DEFAULT_SCORECARD.resolvedCases,
              stalledCases: scoreRes.stalledCases ?? DEFAULT_SCORECARD.stalledCases,
              resolutionRate: scoreRes.resolutionRate
                ? `${scoreRes.resolutionRate}%`
                : DEFAULT_SCORECARD.resolutionRate,
            });
          }
          if (trendRes && Array.isArray(trendRes) && trendRes.length > 0) {
            setTrends(trendRes);
          }
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

  return (
    <div className="scorecard-page">
      <div className="container scorecard-container">
        {/* Header */}
        <div className="scorecard-header">
          <h1 className="scorecard-title">National Transparency Scorecard</h1>
          <p className="scorecard-subtitle">
            Real-time aggregate data on awaiting-trial case progression, statutory compliance rates, and judicial resolution efficiency across Nigeria.
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
            <div className="scorecard-stat-subtext">Across 36 states & FCT</div>
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
              <span className="scorecard-stat-label">Stalled Cases (&gt;28 days)</span>
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
