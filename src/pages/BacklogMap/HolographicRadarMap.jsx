import React, { useState } from 'react';
import { NIGERIA_STATES_GEO } from './nigeriaGeoData.js';

export default function HolographicRadarMap({
  mapData,
  selectedState,
  hoveredState,
  onSelectState,
  onHoverState,
  audioMuted,
  playBlip,
  playLockOn,
}) {
  const [radarActive, setRadarActive] = useState(true);

  // Abuja FCT coordinate in SVG space as the radar hub
  const FCT_CENTER = [348, 220];

  const getStateColor = (stateId) => {
    const data = mapData[stateId];
    if (!data || data.totalCases === 0) return '#1E293B'; // Dark Slate Base
    if (data.totalCases > 5 || data.alertLevel === 'critical') return '#EF4444'; // Crimson
    if (data.totalCases > 2 || data.alertLevel === 'severe') return '#F97316'; // Orange
    if (data.totalCases > 0 || data.alertLevel === 'warning') return '#0284C7'; // Cyan
    return '#10B981'; // Emerald
  };

  return (
    <div className="hologram-radar-wrapper">
      {/* Top Radar HUD Bar */}
      <div className="radar-hud-bar">
        <div className="radar-status-tag">
          <span className="radar-ping-light"></span>
          <span>RADAR SURVEILLANCE · 360° SWEEP ACTIVE</span>
        </div>
        <div className="radar-controls">
          <button
            type="button"
            className={`radar-toggle-btn ${radarActive ? 'active' : ''}`}
            onClick={() => {
              setRadarActive(!radarActive);
              if (!audioMuted && playBlip) playBlip(1000);
            }}
          >
            {radarActive ? 'Pause Beam' : 'Resume Sweep'}
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="radar-svg-container">
        <svg
          viewBox="0 0 760 520"
          className="radar-svg"
          aria-label="Holographic vector map of Nigerian judicial backlog"
        >
          <defs>
            {/* Glowing Drop Shadows */}
            <filter id="neon-glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="neon-glow-red" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Radar Beam Gradient */}
            <linearGradient id="radar-beam" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.75" />
              <stop offset="60%" stopColor="#0284C7" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
            </linearGradient>

            {/* Grid Pattern */}
            <pattern id="cyber-grid-pattern" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(56, 189, 248, 0.08)" strokeWidth="0.8" />
            </pattern>
          </defs>

          {/* Background Cyber Grid */}
          <rect width="100%" height="100%" fill="url(#cyber-grid-pattern)" />

          {/* Concentric Radar Rings originating from FCT Abuja */}
          <g className="radar-concentric-rings" pointerEvents="none">
            <circle cx={FCT_CENTER[0]} cy={FCT_CENTER[1]} r="70" className="radar-ring r1" />
            <circle cx={FCT_CENTER[0]} cy={FCT_CENTER[1]} r="150" className="radar-ring r2" />
            <circle cx={FCT_CENTER[0]} cy={FCT_CENTER[1]} r="240" className="radar-ring r3" />
            <circle cx={FCT_CENTER[0]} cy={FCT_CENTER[1]} r="340" className="radar-ring r4" />
            
            {/* Crosshairs */}
            <line x1={FCT_CENTER[0]} y1="20" x2={FCT_CENTER[0]} y2="500" className="radar-crosshair" />
            <line x1="20" y1={FCT_CENTER[1]} x2="740" y2={FCT_CENTER[1]} className="radar-crosshair" />
          </g>

          {/* Tactical Circuit Lines from States to FCT Federal HQ */}
          <g className="radar-circuit-network" pointerEvents="none">
            {NIGERIA_STATES_GEO.filter((s) => !s.isFederalHq && s.svgCoord).map((s) => {
              const hasCases = (mapData[s.id]?.totalCases ?? 0) > 0;
              return (
                <line
                  key={`line-${s.id}`}
                  x1={FCT_CENTER[0]}
                  y1={FCT_CENTER[1]}
                  x2={s.svgCoord[0]}
                  y2={s.svgCoord[1]}
                  className={`circuit-line ${hasCases ? 'is-active' : ''}`}
                />
              );
            })}
          </g>

          {/* State Polygons with Holographic Glow */}
          <g className="radar-states-layer">
            {NIGERIA_STATES_GEO.map((st) => {
              const isSelected = selectedState === st.id;
              const isHovered = hoveredState === st.id;
              const fillColor = getStateColor(st.id);
              const totalCases = mapData[st.id]?.totalCases ?? 0;

              return (
                <g key={st.id} className="radar-state-group">
                  <path
                    d={st.path}
                    fill={fillColor}
                    fillOpacity={isSelected ? 0.9 : isHovered ? 0.8 : 0.45}
                    stroke={isSelected ? '#38BDF8' : isHovered ? '#67E8F9' : '#334155'}
                    strokeWidth={isSelected ? '2.5' : isHovered ? '2' : '1.2'}
                    className={`radar-state-polygon ${isSelected ? 'selected' : ''}`}
                    filter={isSelected ? 'url(#neon-glow-cyan)' : undefined}
                    onClick={() => {
                      onSelectState(st.id);
                      if (!audioMuted && playLockOn) playLockOn();
                    }}
                    onMouseEnter={() => {
                      onHoverState(st.id);
                      if (!audioMuted && playBlip) playBlip(1100);
                    }}
                    onMouseLeave={() => onHoverState(null)}
                    tabIndex={0}
                    role="button"
                    aria-label={`${st.name}: ${totalCases} backlog cases`}
                  />

                  {/* Node Dot & Label */}
                  {st.svgCoord && (
                    <g
                      transform={`translate(${st.svgCoord[0]}, ${st.svgCoord[1]})`}
                      pointerEvents="none"
                    >
                      {/* Pulsing Beacon if state has active backlog */}
                      {totalCases > 0 && (
                        <circle
                          r="12"
                          className="radar-active-beacon-pulse"
                          fill="none"
                          stroke={totalCases > 5 ? '#EF4444' : '#38BDF8'}
                          strokeWidth="1.5"
                        />
                      )}
                      <circle
                        r={st.isFederalHq ? 5 : 3.5}
                        fill={st.isFederalHq ? '#F59E0B' : totalCases > 0 ? '#38BDF8' : '#64748B'}
                        className="radar-centroid-dot"
                      />
                      <text
                        y={12}
                        className={`radar-state-text ${isSelected ? 'selected' : ''}`}
                      >
                        {st.id}
                      </text>
                      {totalCases > 0 && (
                        <text y={-8} className="radar-badge-text">
                          [{totalCases}]
                        </text>
                      )}
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* Continuous Rotating Radar Sweep Beam */}
          {radarActive && (
            <g
              className="radar-sweep-beam-container"
              transform={`translate(${FCT_CENTER[0]}, ${FCT_CENTER[1]})`}
              pointerEvents="none"
            >
              <g className="radar-sweep-beam-anim">
                <path
                  d="M 0 0 L 380 -60 A 380 380 0 0 1 380 60 Z"
                  fill="url(#radar-beam)"
                  opacity="0.35"
                />
                <line x1="0" y1="0" x2="380" y2="0" stroke="#38BDF8" strokeWidth="2" opacity="0.9" />
              </g>
            </g>
          )}

          {/* Reticle Brackets on 4 corners */}
          <g className="radar-reticles" stroke="#38BDF8" strokeWidth="2" fill="none" opacity="0.6">
            <path d="M 20 50 L 20 20 L 50 20" />
            <path d="M 740 50 L 740 20 L 710 20" />
            <path d="M 20 470 L 20 500 L 50 500" />
            <path d="M 740 470 L 740 500 L 710 500" />
          </g>
        </svg>

        {/* Hover Telemetry Tooltip */}
        {hoveredState && (
          <div className="radar-hover-telemetry">
            <div className="telemetry-pill">SYSTEM SCANNER</div>
            <div className="telemetry-name">{hoveredState}</div>
            <div className="telemetry-cases">
              {mapData[hoveredState]
                ? `${mapData[hoveredState].totalCases} Active Backlog Cases`
                : 'No Cases Logged in Registry'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
