import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  Building2,
  ExternalLink,
  Filter,
  Layers,
  Search,
  Shield,
  Zap,
} from 'lucide-react';
import NigeriaMap from '../../components/NigeriaMap/NigeriaMap.jsx';
import { NIGERIA_REAL_GEO_STATES } from '../../components/NigeriaMap/nigeriaRealGeoPaths.js';
import { GEOPOLITICAL_ZONES } from '../../components/NigeriaMap/nigeriaMapData.js';
import { publicApi } from '../../services/api.js';
import Skeleton from '../../components/Skeleton.jsx';
import './BacklogMapPage.css';

export default function BacklogMapPage() {
  const [selectedState, setSelectedState] = useState('Lagos');
  const [mapMode, setMapMode] = useState('backlog'); // 'backlog' | 'stalled' | 'hubs'
  const [zoneFilter, setZoneFilter] = useState('All Zones');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapData, setMapData] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch live backlog statistics from GAVEL Render backend
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      try {
        const res = await publicApi.backlogMap();
        if (cancelled) return;

        const list = Array.isArray(res) ? res : (res?.backlog ?? []);
        const aggregated = {};

        // Seed all 37 federal divisions
        NIGERIA_REAL_GEO_STATES.forEach((s) => {
          aggregated[s.id] = {
            id: s.id,
            name: s.name,
            capital: s.capital,
            zone: s.zone,
            totalCases: 0,
            activeCases: 0,
            stalledCases: 0,
            courts: [],
            alertLevel: 'compliant',
          };
        });

        // Map backend court records to state jurisdictions
        list.forEach((item) => {
          const courtName = String(item.court ?? '').trim();
          const courtLower = courtName.toLowerCase();

          let targetState = null;
          if (courtLower.includes('ikeja') || courtLower.includes('lagos')) {
            targetState = 'Lagos';
          } else if (courtLower.includes('abuja') || courtLower.includes('fct') || courtLower.includes('maitama')) {
            targetState = 'FCT';
          } else {
            const matched = NIGERIA_REAL_GEO_STATES.find(
              (s) => courtLower.includes(s.id.toLowerCase()) || courtLower.includes(s.capital.toLowerCase())
            );
            if (matched) targetState = matched.id;
          }

          if (!targetState) targetState = 'Lagos';

          const record = aggregated[targetState];
          const active = Number(item.activeCount ?? item.activeCases ?? 0);
          const stalled = Number(item.stalledCount ?? item.stalledCases ?? 0);
          const total = Number(item.totalBacklog ?? (active + stalled));

          record.totalCases += total;
          record.activeCases += active;
          record.stalledCases += stalled;
          record.courts.push({
            name: courtName,
            active,
            stalled,
            total,
          });

          if (record.totalCases > 5 || record.stalledCases > 2) {
            record.alertLevel = 'critical';
          } else if (record.totalCases > 2) {
            record.alertLevel = 'severe';
          } else if (record.totalCases > 0) {
            record.alertLevel = 'warning';
          } else {
            record.alertLevel = 'compliant';
          }
        });

        setMapData(aggregated);
      } catch {
        // Fallback to seeded baseline
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  // Compute National KPIs
  const totalNationalBacklog = Object.values(mapData).reduce((sum, s) => sum + (s.totalCases || 0), 0);
  const totalActiveTrials = Object.values(mapData).reduce((sum, s) => sum + (s.activeCases || 0), 0);
  const totalStalledRemand = Object.values(mapData).reduce((sum, s) => sum + (s.stalledCases || 0), 0);

  // Active selected state metadata
  const selectedStateData = mapData[selectedState] || {
    id: selectedState,
    name: selectedState,
    capital: '—',
    zone: '—',
    totalCases: 0,
    activeCases: 0,
    stalledCases: 0,
    courts: [],
    alertLevel: 'compliant',
  };

  const selectedMeta = NIGERIA_REAL_GEO_STATES.find((s) => s.id === selectedState) || NIGERIA_REAL_GEO_STATES[0];

  // Filtered States List for search
  const filteredStates = NIGERIA_REAL_GEO_STATES.filter((s) => {
    const matchesZone = zoneFilter === 'All Zones' || s.zone === zoneFilter;
    const matchesQuery = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.capital.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesZone && matchesQuery;
  });

  if (loading) {
    return (
      <div className="futuristic-backlog-page">
        <div className="futuristic-container">
          <div className="futuristic-skeleton-header">
            <Skeleton variant="text" width="320px" height="36px" />
            <Skeleton variant="text" width="480px" height="20px" />
          </div>
          <div className="futuristic-grid">
            <Skeleton variant="card" height={560} />
            <Skeleton variant="card" height={560} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="futuristic-backlog-page">
      <div className="futuristic-container">
        {/* ================================================================= */}
        {/* Futuristic Mission Control Header                                 */}
        {/* ================================================================= */}
        <header className="futuristic-header">
          <div className="header-brand-block">
            <div className="futuristic-badge">
              <span className="badge-pulse-dot" />
              <span className="badge-text">GAVEL SPATIAL INTELLIGENCE · SOVEREIGN VECTOR SYSTEM</span>
            </div>
            <h1 className="header-title">National Judicial Backlog Monitor</h1>
            <p className="header-subtitle">
              Interactive territorial analytics of criminal docket congestion and remand detention across all 36 States and the Federal Capital Territory.
            </p>
          </div>

          {/* 3 Executive High-Impact KPI Tiles */}
          <div className="header-kpi-strip">
            <div className="kpi-tile">
              <div className="kpi-icon-wrap cyan">
                <Activity size={18} />
              </div>
              <div className="kpi-content">
                <span className="kpi-label">TOTAL VERIFIED BACKLOG</span>
                <span className="kpi-value cyan">{totalNationalBacklog}</span>
                <span className="kpi-meta">Logged Registry Dockets</span>
              </div>
            </div>

            <div className="kpi-tile">
              <div className="kpi-icon-wrap emerald">
                <Zap size={18} />
              </div>
              <div className="kpi-content">
                <span className="kpi-label">IN-TRIAL HEARINGS</span>
                <span className="kpi-value emerald">{totalActiveTrials}</span>
                <span className="kpi-meta">Active Court Proceedings</span>
              </div>
            </div>

            <div className="kpi-tile">
              <div className="kpi-icon-wrap crimson">
                <AlertTriangle size={18} />
              </div>
              <div className="kpi-content">
                <span className="kpi-label">STALLED REMAND DETENTIONS</span>
                <span className="kpi-value crimson">{totalStalledRemand}</span>
                <span className="kpi-meta">Pre-trial Delay Bottlenecks</span>
              </div>
            </div>
          </div>
        </header>

        {/* ================================================================= */}
        {/* Interactive Mode & Zone Navigation Bar                            */}
        {/* ================================================================= */}
        <div className="futuristic-toolbar">
          {/* Spatial Mode Selector */}
          <div className="mode-segmented-control">
            <span className="toolbar-section-label">
              <Layers size={14} />
              <span>Layer:</span>
            </span>
            <button
              type="button"
              className={`mode-btn ${mapMode === 'backlog' ? 'active' : ''}`}
              onClick={() => setMapMode('backlog')}
            >
              Backlog Heat
            </button>
            <button
              type="button"
              className={`mode-btn ${mapMode === 'stalled' ? 'active' : ''}`}
              onClick={() => setMapMode('stalled')}
            >
              Stalled Detentions
            </button>
            <button
              type="button"
              className={`mode-btn ${mapMode === 'hubs' ? 'active' : ''}`}
              onClick={() => setMapMode('hubs')}
            >
              Judicial Seats
            </button>
          </div>

          {/* Geopolitical Zone Filter Tabs */}
          <div className="zone-filter-bar">
            <span className="toolbar-section-label">
              <Filter size={14} />
              <span>Zone:</span>
            </span>
            <div className="zone-scroll-wrap">
              {GEOPOLITICAL_ZONES.map((zone) => (
                <button
                  key={zone}
                  type="button"
                  className={`zone-pill-btn ${zoneFilter === zone ? 'active' : ''}`}
                  onClick={() => setZoneFilter(zone)}
                >
                  {zone}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 2-Column Responsive Matrix: Sovereign Vector Map + Dossier Panel  */}
        {/* ================================================================= */}
        <div className="futuristic-grid">
          {/* Left Column: Pixel-Accurate Sovereign Vector Map Card */}
          <section className="futuristic-map-card">
            <div className="map-card-header">
              <div className="map-header-status">
                <span className="map-reticle-indicator">⌖</span>
                <span className="map-current-target">
                  INSPECTING: <strong className="target-name">{selectedMeta.name}</strong>
                  <span className="target-zone">[{selectedMeta.zone.toUpperCase()}]</span>
                </span>
              </div>
              <span className="map-instruction">
                Click any territory or drag/scroll to pan &amp; zoom
              </span>
            </div>

            {/* Pixel-Accurate Sovereign Map Component */}
            <div className="map-viewport-wrapper">
              <NigeriaMap
                data={mapData}
                selectedState={selectedState}
                onSelectState={(id) => setSelectedState(id)}
                mode={mapMode}
                theme="dark"
                showLabels={true}
                showBeacons={true}
                showCircuits={true}
                allowZoom={true}
              />
            </div>

            {/* Futuristic Severity Legend Bar */}
            <div className="map-footer-legend">
              <span className="legend-head">Strain Gradient:</span>
              <div className="legend-items">
                <div className="legend-item">
                  <span className="legend-node-dot compliant" />
                  <span>Compliant (&lt; 2)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-node-dot active-blue" />
                  <span>Active Trial Motion</span>
                </div>
                <div className="legend-item">
                  <span className="legend-node-dot warning-amber" />
                  <span>Moderate Strain (2–3)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-node-dot critical-red" />
                  <span>Critical Bottleneck (&gt; 3)</span>
                </div>
              </div>
            </div>
          </section>

          {/* Right Column: State Judicial Dossier Glass Panel */}
          <aside className="futuristic-dossier-card">
            {/* Dossier Header */}
            <div className="dossier-header-block">
              <div className="dossier-badge-row">
                <span className="dossier-zone-tag">{selectedMeta.zone}</span>
                <span className={`dossier-alert-tag ${selectedStateData.alertLevel}`}>
                  {selectedStateData.alertLevel === 'critical' ? 'CRITICAL DELAY' :
                   selectedStateData.alertLevel === 'severe' ? 'CONGESTION' :
                   selectedStateData.alertLevel === 'warning' ? 'ACTIVE DOCKET' : 'COMPLIANT'}
                </span>
              </div>
              <h2 className="dossier-state-title">
                {selectedMeta.name} {selectedMeta.id !== 'FCT' ? 'State' : ''}
              </h2>
              <div className="dossier-capital-row">
                <span>Judicial Headquarters: <strong>{selectedMeta.capital}</strong></span>
              </div>
            </div>

            {/* Quick State Search Input */}
            <div className="dossier-search-wrapper">
              <Search size={14} className="dossier-search-icon" />
              <input
                type="text"
                className="dossier-search-field"
                placeholder="Search any of 36 states or FCT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* State Picker Scroller */}
            <div className="dossier-chips-track">
              {filteredStates.map((st) => {
                const count = mapData[st.id]?.totalCases ?? 0;
                const isSelected = selectedState === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    className={`dossier-state-pill ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => setSelectedState(st.id)}
                  >
                    <span>{st.name}</span>
                    {count > 0 && <span className="pill-badge">{count}</span>}
                  </button>
                );
              })}
            </div>

            {/* 3 Metric Glass Tiles for Selected State */}
            <div className="dossier-metrics-grid">
              <div className="dossier-metric-tile">
                <span className="metric-tile-title">Verified Docket Backlog</span>
                <span className="metric-tile-number cyan">{selectedStateData.totalCases}</span>
                <span className="metric-tile-sub">Active in registry</span>
              </div>

              <div className="dossier-metric-tile">
                <span className="metric-tile-title">Trial In Motion</span>
                <span className="metric-tile-number emerald">{selectedStateData.activeCases}</span>
                <span className="metric-tile-sub">Scheduled hearings</span>
              </div>

              <div className="dossier-metric-tile">
                <span className="metric-tile-title">Stalled Remand</span>
                <span className="metric-tile-number crimson">{selectedStateData.stalledCases}</span>
                <span className="metric-tile-sub">Awaiting legal aid</span>
              </div>
            </div>

            {/* Judicial Division Registries */}
            <div className="dossier-courts-container">
              <h3 className="dossier-courts-title">
                <Building2 size={14} />
                <span>Court Registries &amp; Judicial Divisions ({selectedStateData.courts.length || 0})</span>
              </h3>

              {selectedStateData.courts.length > 0 ? (
                <div className="dossier-courts-scroll">
                  {selectedStateData.courts.map((court, idx) => (
                    <div key={idx} className="dossier-court-card">
                      <div className="court-card-info">
                        <span className="court-card-name">{court.name}</span>
                        <span className="court-card-stats">
                          {court.active} active hearings · {court.stalled} stalled
                        </span>
                      </div>
                      <Link
                        to={`/lookup?court=${encodeURIComponent(court.name)}`}
                        className="court-card-link"
                      >
                        <span>Inspect</span>
                        <ExternalLink size={12} />
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="dossier-courts-empty">
                  <Shield size={24} className="empty-shield-icon" />
                  <p className="empty-shield-text">
                    Zero stalled criminal backlog logged for {selectedMeta.name} in the latest registry sync.
                  </p>
                </div>
              )}
            </div>

            {/* Action CTAs */}
            <div className="dossier-actions-group">
              <Link
                to={`/lookup?state=${encodeURIComponent(selectedMeta.name)}`}
                className="dossier-btn primary"
              >
                <span>Search Dockets in {selectedMeta.name}</span>
                <ExternalLink size={14} />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
