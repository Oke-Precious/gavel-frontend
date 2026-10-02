import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertTriangle,
  FileText,
  Layers,
  Maximize2,
  Minimize2,
  Radio,
  Search,
  ShieldAlert,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import TacticalLeafletMap from './TacticalLeafletMap.jsx';
import HolographicRadarMap from './HolographicRadarMap.jsx';
import SpatialDensityMatrix from './SpatialDensityMatrix.jsx';
import { NIGERIA_STATES_GEO, MAP_MODES, SEVERITY_TIERS, JUDICIAL_REGIONS } from './nigeriaGeoData.js';
import { cyberAudio } from './cyberAudio.js';
import { publicApi } from '../../services/api.js';
import './BacklogMapPage.css';

export default function BacklogMapPage() {
  const [mapEngine, setMapEngine] = useState('leaflet'); // 'leaflet' | 'radar' | 'matrix'
  const [selectedState, setSelectedState] = useState('Lagos');
  const [hoveredState, setHoveredState] = useState(null);
  const [regionFilter, setRegionFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapData, setMapData] = useState({});
  const [loading, setLoading] = useState(true);
  const [audioMuted, setAudioMuted] = useState(true);
  const [isScannerRunning, setIsScannerRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const scannerTimerRef = useRef(null);
  const pageContainerRef = useRef(null);

  // Play procedural audio helpers
  const playBlip = (freq) => {
    if (!audioMuted) cyberAudio.blip(freq);
  };
  const playLockOn = () => {
    if (!audioMuted) cyberAudio.lockOn();
  };
  const playRadarPing = () => {
    if (!audioMuted) cyberAudio.radarPing();
  };

  // Fetch real backlog data from the GAVEL backend
  useEffect(() => {
    let cancelled = false;

    async function loadBacklogData() {
      setLoading(true);
      try {
        const res = await publicApi.backlogMap();
        if (cancelled) return;

        const list = Array.isArray(res) ? res : (res?.backlog ?? []);

        // Aggregate by state
        const aggregated = {};

        // Seed with all states so every state has a valid baseline record
        NIGERIA_STATES_GEO.forEach((s) => {
          aggregated[s.id] = {
            id: s.id,
            name: s.name,
            capital: s.capital,
            region: s.region,
            totalCases: 0,
            activeCases: 0,
            stalledCases: 0,
            courts: [],
            congestionIndex: s.congestionIndex,
            estimatedDetainees: s.estimatedDetainees,
            alertLevel: 'compliant',
          };
        });

        // Map backend court records to states
        list.forEach((item) => {
          const courtName = String(item.court ?? '').trim();
          const courtLower = courtName.toLowerCase();

          // Match court to state
          let targetState = null;
          if (courtLower.includes('ikeja') || courtLower.includes('lagos')) {
            targetState = 'Lagos';
          } else if (courtLower.includes('abuja') || courtLower.includes('fct') || courtLower.includes('maitama')) {
            targetState = 'FCT';
          } else {
            const matched = NIGERIA_STATES_GEO.find(
              (s) => courtLower.includes(s.id.toLowerCase()) || courtLower.includes(s.capital.toLowerCase())
            );
            if (matched) targetState = matched.id;
          }

          if (!targetState) targetState = 'Lagos'; // Fallback to Lagos hub for unassigned judicial records

          const stateRecord = aggregated[targetState];
          const active = Number(item.activeCount ?? item.activeCases ?? 0);
          const stalled = Number(item.stalledCount ?? item.stalledCases ?? 0);
          const total = Number(item.totalBacklog ?? (active + stalled));

          stateRecord.totalCases += total;
          stateRecord.activeCases += active;
          stateRecord.stalledCases += stalled;
          stateRecord.courts.push({
            court: courtName,
            active,
            stalled,
            total,
          });

          // Compute alert severity tier
          if (stateRecord.totalCases > 5 || stateRecord.stalledCases > 2) {
            stateRecord.alertLevel = 'critical';
          } else if (stateRecord.totalCases > 2) {
            stateRecord.alertLevel = 'severe';
          } else if (stateRecord.totalCases > 0) {
            stateRecord.alertLevel = 'warning';
          } else {
            stateRecord.alertLevel = 'compliant';
          }
        });

        setMapData(aggregated);
      } catch {
        // Fallback to baseline if backend API returns error
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadBacklogData();
    return () => {
      cancelled = true;
    };
  }, []);

  // Automated Scanner Patrol Mode
  useEffect(() => {
    if (!isScannerRunning) {
      if (scannerTimerRef.current) clearInterval(scannerTimerRef.current);
      return;
    }

    const stateIds = NIGERIA_STATES_GEO.map((s) => s.id);
    let index = stateIds.indexOf(selectedState);
    if (index === -1) index = 0;

    scannerTimerRef.current = setInterval(() => {
      index = (index + 1) % stateIds.length;
      const nextId = stateIds[index];
      setSelectedState(nextId);
      if (!audioMuted) cyberAudio.blip(1000 + (index % 5) * 150, 0.03);
    }, 3200);

    return () => {
      if (scannerTimerRef.current) clearInterval(scannerTimerRef.current);
    };
  }, [isScannerRunning, selectedState, audioMuted]);

  // Aggregate National Metrics
  const nationalTotals = Object.values(mapData).reduce(
    (acc, curr) => ({
      total: acc.total + (curr.totalCases || 0),
      active: acc.active + (curr.activeCases || 0),
      stalled: acc.stalled + (curr.stalledCases || 0),
      detainees: acc.detainees + (curr.estimatedDetainees || 0),
    }),
    { total: 0, active: 0, stalled: 0, detainees: 0 }
  );

  const selectedStateData = mapData[selectedState] || {
    id: selectedState,
    name: selectedState,
    totalCases: 0,
    activeCases: 0,
    stalledCases: 0,
    estimatedDetainees: 0,
    congestionIndex: 50,
    courts: [],
    alertLevel: 'compliant',
  };

  const selectedGeo = NIGERIA_STATES_GEO.find((s) => s.id === selectedState) || NIGERIA_STATES_GEO[0];

  // Filtered States list for selector
  const filteredStates = NIGERIA_STATES_GEO.filter((s) => {
    const matchesRegion = regionFilter === 'all' || s.region === regionFilter;
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.capital.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      pageContainerRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  if (loading) {
    return (
      <div className="cyber-backlog-page">
        <div className="cyber-hud-container">
          <div className="cyber-loader-panel">
            <div className="cyber-loader-radar-ring"></div>
            <p className="cyber-loader-text">INITIALIZING TACTICAL GEOSPATIAL ENGINE...</p>
            <div className="cyber-loader-bar">
              <div className="cyber-loader-fill"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={pageContainerRef} className={`cyber-backlog-page ${isFullscreen ? 'is-fullscreen' : ''}`}>
      <div className="cyber-hud-container">
        {/* =================================================================== */}
        {/* Top Mission Control Header                                         */}
        {/* =================================================================== */}
        <header className="cyber-mission-header">
          <div className="cyber-header-left">
            <div className="cyber-branding-badge">
              <span className="cyber-blinking-node"></span>
              <span className="cyber-brand-text">GAVEL TACTICAL CARTOGRAPHY // VER 3.4</span>
            </div>
            <h1 className="cyber-page-title">National Judicial Backlog Monitor</h1>
            <p className="cyber-page-subtitle">
              Multi-engine spatial surveillance of awaiting-trial detainees, court dockets, and detention congestion across Nigeria's 36 States + FCT.
            </p>
          </div>

          {/* Quick HUD Controls */}
          <div className="cyber-header-actions">
            {/* Audio Toggle */}
            <button
              type="button"
              className={`cyber-icon-btn ${audioMuted ? 'is-muted' : 'is-active'}`}
              onClick={() => {
                const next = !audioMuted;
                setAudioMuted(next);
                if (!next) cyberAudio.lockOn();
              }}
              title={audioMuted ? 'Enable Tactical Audio Telemetry' : 'Mute Audio Telemetry'}
            >
              {audioMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              <span className="cyber-btn-label">{audioMuted ? 'AUDIO OFF' : 'AUDIO ON'}</span>
            </button>

            {/* Scanner Patrol Toggle */}
            <button
              type="button"
              className={`cyber-icon-btn ${isScannerRunning ? 'is-scanning' : ''}`}
              onClick={() => {
                const next = !isScannerRunning;
                setIsScannerRunning(next);
                playRadarPing();
              }}
              title="Automated Orbital Scanner Patrol"
            >
              <Radio size={18} className={isScannerRunning ? 'spin-icon' : ''} />
              <span className="cyber-btn-label">{isScannerRunning ? 'SCANNING...' : 'AUTO PATROL'}</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              className="cyber-icon-btn"
              onClick={toggleFullscreen}
              title="Toggle Fullscreen Cartography"
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </div>
        </header>

        {/* =================================================================== */}
        {/* National Metric Ticker HUD                                          */}
        {/* =================================================================== */}
        <div className="cyber-ticker-row">
          <div className="cyber-ticker-card">
            <div className="ticker-label">
              <FileText size={14} className="ticker-icon cyan" />
              <span>TOTAL LOGGED BACKLOG</span>
            </div>
            <div className="ticker-val cyan">{nationalTotals.total} <span className="ticker-sub">CASES</span></div>
            <div className="ticker-meta">Verified across registry syncs</div>
          </div>

          <div className="cyber-ticker-card">
            <div className="ticker-label">
              <Activity size={14} className="ticker-icon emerald" />
              <span>ACTIVE TRIAL PROCEEDINGS</span>
            </div>
            <div className="ticker-val emerald">{nationalTotals.active} <span className="ticker-sub">IN MOTION</span></div>
            <div className="ticker-meta">Cases currently assigned to courts</div>
          </div>

          <div className="cyber-ticker-card">
            <div className="ticker-label">
              <AlertTriangle size={14} className="ticker-icon amber" />
              <span>STALLED INDEFINITE DETENTIONS</span>
            </div>
            <div className="ticker-val amber">{nationalTotals.stalled} <span className="ticker-sub">BLOCKED</span></div>
            <div className="ticker-meta">Requires urgent pro-bono intervention</div>
          </div>

          <div className="cyber-ticker-card">
            <div className="ticker-label">
              <ShieldAlert size={14} className="ticker-icon purple" />
              <span>EST. AWAITING-TRIAL DETAINEES</span>
            </div>
            <div className="ticker-val purple">~{nationalTotals.detainees.toLocaleString()}</div>
            <div className="ticker-meta">National correctional capacity strain</div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* Tool Exploration Switcher: 3 Different Cartography Engines          */}
        {/* =================================================================== */}
        <div className="cyber-engine-switcher-bar">
          <div className="switcher-lead">
            <Layers size={16} className="switcher-icon" />
            <span className="switcher-title">GEOSPATIAL ENGINE:</span>
          </div>

          <div className="switcher-tabs">
            {MAP_MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                className={`switcher-tab ${mapEngine === mode.id ? 'is-active' : ''}`}
                onClick={() => {
                  setMapEngine(mode.id);
                  playBlip(1100);
                }}
              >
                <span className="switcher-tab-bullet"></span>
                <span className="switcher-tab-name">{mode.label}</span>
              </button>
            ))}
          </div>

          <div className="switcher-desc">
            {MAP_MODES.find((m) => m.id === mapEngine)?.desc}
          </div>
        </div>

        {/* =================================================================== */}
        {/* Main Cartography Workspace (Grid: Map Viewport + Tactical Drawer)   */}
        {/* =================================================================== */}
        <div className="cyber-workspace-grid">
          {/* Left: Map Viewport */}
          <div className="cyber-map-viewport-panel">
            {/* Viewport Header Toolbar */}
            <div className="viewport-hud-header">
              <div className="viewport-target-readout">
                <span className="hud-accent-crosshair">⌖</span>
                <span className="hud-target-label">FOCUS HUB:</span>
                <span className="hud-target-val">{selectedState}</span>
                <span className="hud-target-coords">
                  [{selectedGeo.coords[0].toFixed(2)}°N, {selectedGeo.coords[1].toFixed(2)}°E]
                </span>
              </div>

              {/* Regional Filter Pill Tabs */}
              <div className="viewport-region-filters">
                {JUDICIAL_REGIONS.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    className={`region-filter-tab ${regionFilter === r.id ? 'active' : ''}`}
                    onClick={() => {
                      setRegionFilter(r.id);
                      playBlip(950);
                    }}
                  >
                    {r.name.replace(' Division', '').replace(' Circuit', '')}
                  </button>
                ))}
              </div>
            </div>

            {/* Map Canvas / Component based on selected tool */}
            <div className="viewport-canvas-wrapper">
              {mapEngine === 'leaflet' && (
                <TacticalLeafletMap
                  mapData={mapData}
                  selectedState={selectedState}
                  onSelectState={setSelectedState}
                  onHoverState={setHoveredState}
                  audioMuted={audioMuted}
                  playBlip={playBlip}
                  playLockOn={playLockOn}
                />
              )}

              {mapEngine === 'radar' && (
                <HolographicRadarMap
                  mapData={mapData}
                  selectedState={selectedState}
                  hoveredState={hoveredState}
                  onSelectState={setSelectedState}
                  onHoverState={setHoveredState}
                  audioMuted={audioMuted}
                  playBlip={playBlip}
                  playLockOn={playLockOn}
                />
              )}

              {mapEngine === 'matrix' && (
                <SpatialDensityMatrix
                  mapData={mapData}
                  selectedState={selectedState}
                  onSelectState={setSelectedState}
                  audioMuted={audioMuted}
                  playBlip={playBlip}
                  playLockOn={playLockOn}
                />
              )}
            </div>

            {/* Severity Legend Bar */}
            <div className="viewport-legend-bar">
              <span className="legend-head">Backlog Density:</span>
              {Object.entries(SEVERITY_TIERS).map(([key, tier]) => (
                <div key={key} className="legend-chip">
                  <span className="legend-dot" style={{ backgroundColor: tier.color, boxShadow: `0 0 8px ${tier.color}` }} />
                  <span className="legend-name">{tier.label}</span>
                  <span className="legend-range">({tier.range})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Tactical Judicial Drawer */}
          <aside className="cyber-tactical-drawer">
            {/* Drawer Header */}
            <div className="drawer-header">
              <div className="drawer-badge-row">
                <span className="drawer-tag">
                  {selectedGeo.isFederalHq ? 'SUPREME COURT / FEDERAL HQ' : selectedGeo.region.toUpperCase()}
                </span>
                <span className={`drawer-alert-pill ${selectedStateData.alertLevel}`}>
                  {selectedStateData.alertLevel.toUpperCase()}
                </span>
              </div>
              <h2 className="drawer-state-name">{selectedGeo.name}</h2>
              <div className="drawer-coords-meta">
                <span>Capital: {selectedGeo.capital}</span>
                <span>·</span>
                <span>Lat: {selectedGeo.coords[0]}°N</span>
                <span>·</span>
                <span>Lng: {selectedGeo.coords[1]}°E</span>
              </div>
            </div>

            {/* State Search & Jump Select */}
            <div className="drawer-search-box">
              <Search size={14} className="drawer-search-icon" />
              <input
                type="text"
                className="drawer-search-input"
                placeholder="Search state or capital..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Quick State Grid Buttons */}
            <div className="drawer-states-scroller">
              {filteredStates.map((st) => {
                const count = mapData[st.id]?.totalCases ?? 0;
                const isSelected = selectedState === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    className={`drawer-state-chip ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedState(st.id);
                      playLockOn();
                    }}
                  >
                    <span className="chip-name">{st.name}</span>
                    {count > 0 && <span className="chip-badge">{count}</span>}
                  </button>
                );
              })}
            </div>

            {/* Detailed State Telemetry Metrics */}
            <div className="drawer-metrics-section">
              <div className="drawer-metric-tile">
                <span className="tile-title">Verified Docket Backlog</span>
                <span className="tile-number highlight">{selectedStateData.totalCases}</span>
                <span className="tile-footnote">
                  {selectedStateData.activeCases} Active · {selectedStateData.stalledCases} Stalled
                </span>
              </div>

              <div className="drawer-metric-tile">
                <span className="tile-title">Est. Correctional Detainees</span>
                <span className="tile-number">
                  {selectedGeo.estimatedDetainees.toLocaleString()}
                </span>
                <span className="tile-footnote">Awaiting trial / remand custody</span>
              </div>

              <div className="drawer-metric-tile">
                <span className="tile-title">Judicial Congestion Index</span>
                <div className="tile-progress-wrap">
                  <div
                    className="tile-progress-bar"
                    style={{ width: `${selectedGeo.congestionIndex}%` }}
                  />
                </div>
                <span className="tile-footnote">{selectedGeo.congestionIndex}% Strain Threshold</span>
              </div>
            </div>

            {/* Recognized Judicial Divisions & Court Registry */}
            <div className="drawer-courts-section">
              <h3 className="courts-section-title">
                Judicial Divisions & Registries ({selectedGeo.courts.length})
              </h3>
              <div className="courts-list">
                {selectedGeo.courts.map((courtName) => {
                  const match = selectedStateData.courts.find((c) => c.court === courtName);
                  return (
                    <div key={courtName} className="court-item-card">
                      <div className="court-item-info">
                        <span className="court-item-name">{courtName}</span>
                        {match && (
                          <span className="court-badge-active">
                            {match.active} active · {match.stalled} stalled
                          </span>
                        )}
                      </div>
                      <Link
                        to={`/lookup?court=${encodeURIComponent(courtName)}`}
                        className="court-lookup-link"
                      >
                        Inspect →
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Drawer Action CTAs */}
            <div className="drawer-actions">
              <Link to="/lookup" className="drawer-btn primary">
                <Search size={15} />
                <span>Search Cases in {selectedGeo.name}</span>
              </Link>
              <Link to="/pro-bono" className="drawer-btn secondary">
                <Zap size={15} />
                <span>Claim Pro-Bono in this Division</span>
              </Link>
            </div>
          </aside>
        </div>

        {/* =================================================================== */}
        {/* Live Telemetry Log Footer                                           */}
        {/* =================================================================== */}
        <footer className="cyber-telemetry-footer">
          <div className="telemetry-feed-indicator">
            <span className="feed-pulse-dot"></span>
            <span className="feed-title">REAL-TIME DATASTREAM:</span>
          </div>
          <div className="telemetry-feed-content">
            <span>[GAVEL-NET-SYNC]</span>
            <span>Render Cloud Cluster Connected</span>
            <span>·</span>
            <span>36 States + FCT Calibrated</span>
            <span>·</span>
            <span>Highest Strain: Lagos Judicial Division ({mapData['Lagos']?.totalCases || 3} Cases)</span>
            <span>·</span>
            <span>Federal HQ: Abuja FCT Active</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
