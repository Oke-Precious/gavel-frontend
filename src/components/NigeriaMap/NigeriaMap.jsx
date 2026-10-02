import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Crosshair } from 'lucide-react';
import { NIGERIA_REAL_GEO_STATES } from './nigeriaRealGeoPaths.js';
import './NigeriaMap.css';

/**
 * Reusable Pixel-Accurate Sovereign Vector Map of Nigeria (36 States + FCT)
 * Cloned directly from official administrative GeoJSON boundaries.
 *
 * @param {Object} data - Key-value map of state ID to data ({ totalCases, activeCases, stalledCases, alertLevel, ... })
 * @param {string} selectedState - Currently selected state ID
 * @param {function} onSelectState - Callback invoked when a state is clicked
 * @param {string} theme - 'dark' | 'light' (default: 'dark')
 * @param {string} mode - 'backlog' | 'stalled' | 'hubs' (default: 'backlog')
 * @param {boolean} showLabels - Show state names on centroids (default: true)
 * @param {boolean} showBeacons - Show pulsing radar beacons on active states (default: true)
 * @param {boolean} showCircuits - Show neural circuit links to Federal HQ (default: true)
 * @param {boolean} allowZoom - Allow interactive zoom and pan controls (default: true)
 * @param {boolean} compact - Compact mode for dashboard widgets (default: false)
 * @param {string} className - Optional container CSS class
 */
export default function NigeriaMap({
  data = {},
  selectedState = 'Lagos',
  onSelectState = () => {},
  theme = 'dark',
  mode = 'backlog',
  showLabels = true,
  showBeacons = true,
  showCircuits = true,
  allowZoom = true,
  compact = false,
  className = '',
}) {
  const [hoveredState, setHoveredState] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const startPanRef = useRef({ x: 0, y: 0 });

  // Abuja FCT coordinate in SVG coordinate space
  const FCT_CENTER = [370, 360];

  // Calculate State Polygon Fill
  const getStateStyle = (stateId) => {
    const stData = data[stateId];
    const total = stData?.totalCases ?? 0;
    const stalled = stData?.stalledCases ?? 0;
    const isDark = theme === 'dark';

    if (mode === 'stalled') {
      if (stalled > 1) return { fill: '#EF4444', glow: 'rgba(239, 68, 68, 0.4)' };
      if (stalled > 0) return { fill: '#F97316', glow: 'rgba(249, 115, 22, 0.3)' };
    } else {
      // Backlog or Hubs mode
      if (total > 5 || stData?.alertLevel === 'critical') {
        return { fill: '#EF4444', glow: 'rgba(239, 68, 68, 0.45)' };
      }
      if (total > 2 || stData?.alertLevel === 'severe') {
        return { fill: '#F97316', glow: 'rgba(249, 115, 22, 0.35)' };
      }
      if (total > 0 || stData?.alertLevel === 'warning') {
        return { fill: '#0284C7', glow: 'rgba(2, 132, 199, 0.35)' };
      }
    }

    // Default Neutral
    return {
      fill: isDark ? '#0F172A' : '#E2E8F0',
      glow: 'none',
    };
  };

  // Pan & Zoom Controls
  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.3, 2.5));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.3, 0.8));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Focus directly onto selected state
  const handleFocusSelected = () => {
    const selectedObj = NIGERIA_REAL_GEO_STATES.find((s) => s.id === selectedState);
    if (!selectedObj) return;
    setZoomLevel(1.6);
    // Center bounding box
    const offsetX = (400 - selectedObj.center[0]) * 0.7;
    const offsetY = (325 - selectedObj.center[1]) * 0.7;
    setPanOffset({ x: offsetX, y: offsetY });
  };

  const handleMouseDown = (e) => {
    if (!allowZoom || compact) return;
    setIsPanning(true);
    startPanRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    if (isPanning) {
      setPanOffset({
        x: e.clientX - startPanRef.current.x,
        y: e.clientY - startPanRef.current.y,
      });
    }
  };

  const handleMouseUp = () => setIsPanning(false);

  const hoveredData = hoveredState ? data[hoveredState.id] : null;

  return (
    <div
      className={`nigeria-cyber-map-container theme-${theme} ${compact ? 'is-compact' : ''} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        setIsPanning(false);
        setHoveredState(null);
      }}
    >
      {/* Tactical Floating HUD Controls (Top Right) */}
      {allowZoom && !compact && (
        <div className="map-hud-controls" aria-label="Map Navigation Controls">
          <button
            type="button"
            className="hud-ctrl-btn"
            onClick={handleZoomIn}
            title="Zoom In"
            aria-label="Zoom in"
          >
            <ZoomIn size={15} />
          </button>
          <button
            type="button"
            className="hud-ctrl-btn"
            onClick={handleZoomOut}
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <ZoomOut size={15} />
          </button>
          <button
            type="button"
            className="hud-ctrl-btn"
            onClick={handleFocusSelected}
            title="Focus on Selected State"
            aria-label="Focus on selected state"
          >
            <Crosshair size={15} />
          </button>
          <button
            type="button"
            className="hud-ctrl-btn reset"
            onClick={handleResetZoom}
            title="Reset Perspective"
            aria-label="Reset perspective"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      )}

      {/* SVG Canvas */}
      <svg
        viewBox="0 0 800 650"
        className="nigeria-cyber-svg"
        aria-label="Pixel-accurate map of Nigerian sovereign state borders"
        role="img"
      >
        <defs>
          {/* Holographic Neon Glow Filter */}
          <filter id="neon-cyan-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="neon-gold-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Futuristic Dot Matrix Pattern */}
          <pattern id="cyber-matrix-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.75" fill={theme === 'dark' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(15, 23, 42, 0.06)'} />
          </pattern>
        </defs>

        {/* Ambient Grid Backdrop */}
        <rect width="100%" height="100%" fill="url(#cyber-matrix-grid)" />

        {/* Main Scalable & Pannable Group */}
        <g
          transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}
          style={{ transformOrigin: '400px 325px', transition: isPanning ? 'none' : 'transform 0.25s ease' }}
        >
          {/* Neural Data Circuit Lines connecting State Centroids to Abuja FCT */}
          {showCircuits && !compact && (
            <g className="neural-circuits-layer" pointerEvents="none">
              {NIGERIA_REAL_GEO_STATES.filter((s) => s.id !== 'FCT').map((s) => {
                const hasCases = (data[s.id]?.totalCases ?? 0) > 0;
                return (
                  <line
                    key={`circuit-${s.id}`}
                    x1={FCT_CENTER[0]}
                    y1={FCT_CENTER[1]}
                    x2={s.center[0]}
                    y2={s.center[1]}
                    className={`circuit-track ${hasCases ? 'is-active' : ''}`}
                  />
                );
              })}
            </g>
          )}

          {/* Official 37 Sovereign State Polygons */}
          <g className="sovereign-states-layer">
            {NIGERIA_REAL_GEO_STATES.map((state) => {
              const isSelected = selectedState === state.id;
              const isHovered = hoveredState?.id === state.id;
              const style = getStateStyle(state.id);
              const stData = data[state.id];
              const totalCases = stData?.totalCases ?? 0;

              return (
                <g key={state.id} className="state-vector-group">
                  <path
                    d={state.d}
                    fill={style.fill}
                    fillOpacity={isSelected ? 0.95 : isHovered ? 0.88 : theme === 'dark' ? 0.7 : 0.9}
                    stroke={
                      isSelected
                        ? '#38BDF8'
                        : isHovered
                        ? '#7DD3FC'
                        : theme === 'dark'
                        ? 'rgba(56, 189, 248, 0.25)'
                        : '#CBD5E1'
                    }
                    strokeWidth={isSelected ? '2.4' : isHovered ? '1.8' : '1'}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    className={`state-polygon-path ${isSelected ? 'is-selected' : ''} ${isHovered ? 'is-hovered' : ''}`}
                    filter={isSelected ? 'url(#neon-cyan-glow)' : undefined}
                    onClick={() => onSelectState(state.id)}
                    onMouseEnter={() => setHoveredState(state)}
                    onMouseLeave={() => setHoveredState(null)}
                    tabIndex={0}
                    role="button"
                    aria-label={`${state.name}: ${totalCases} cases`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectState(state.id);
                      }
                    }}
                  />

                  {/* Centroid Beacons & Labels */}
                  <g
                    transform={`translate(${state.center[0]}, ${state.center[1]})`}
                    pointerEvents="none"
                  >
                    {/* Pulsing Radar Ring on Active Hotspots */}
                    {showBeacons && totalCases > 0 && (
                      <circle
                        r="10"
                        className="hotspot-pulse-ring"
                        fill="none"
                        stroke={totalCases > 2 ? '#EF4444' : '#38BDF8'}
                        strokeWidth="1.2"
                      />
                    )}

                    {/* Centroid Core Dot */}
                    <circle
                      r={state.id === 'FCT' ? 4.5 : totalCases > 0 ? 3.5 : 2}
                      fill={state.id === 'FCT' ? '#F59E0B' : totalCases > 0 ? '#38BDF8' : theme === 'dark' ? '#475569' : '#94A3B8'}
                      filter={state.id === 'FCT' ? 'url(#neon-gold-glow)' : undefined}
                      className="state-centroid-marker"
                    />

                    {/* Clean Monospace State Code Label */}
                    {showLabels && !compact && (
                      <text
                        y={totalCases > 0 ? 11 : 9}
                        className={`state-centroid-label ${isSelected ? 'is-selected' : ''}`}
                      >
                        {state.id === 'FCT' ? 'FCT' : state.id}
                      </text>
                    )}
                  </g>
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      {/* Floating Holographic Tooltip */}
      {hoveredState && (
        <div
          className="map-hologram-tooltip"
          style={{
            left: `${tooltipPos.x + 16}px`,
            top: `${tooltipPos.y - 14}px`,
          }}
          aria-hidden="true"
        >
          <div className="hologram-tooltip-kicker">
            <span>{hoveredState.zone}</span>
            {hoveredState.id === 'FCT' && <span className="hq-tag">FEDERAL HQ</span>}
          </div>
          <h4 className="hologram-tooltip-title">{hoveredState.name}</h4>
          <div className="hologram-tooltip-divider" />
          <div className="hologram-tooltip-metrics">
            <div className="tooltip-metric-row">
              <span className="metric-label">Court Backlog:</span>
              <span className="metric-value highlight">
                {hoveredData?.totalCases ? `${hoveredData.totalCases} Cases` : '0 Active Cases'}
              </span>
            </div>
            <div className="tooltip-metric-row">
              <span className="metric-label">Judicial Seat:</span>
              <span className="metric-value">{hoveredState.capital}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
