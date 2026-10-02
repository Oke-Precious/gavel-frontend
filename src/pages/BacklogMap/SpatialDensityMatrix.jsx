import React, { useEffect, useRef, useState } from 'react';
import { NIGERIA_STATES_GEO } from './nigeriaGeoData.js';

export default function SpatialDensityMatrix({
  mapData,
  selectedState,
  onSelectState,
  audioMuted,
  playBlip,
  playLockOn,
}) {
  const canvasRef = useRef(null);
  const [metricMode, setMetricMode] = useState('backlog'); // 'backlog' | 'detainees' | 'congestion'
  const [autoRotate, setAutoRotate] = useState(true);
  const animFrameRef = useRef(null);
  const angleRef = useRef(0.2);
  const renderedPillarsRef = useRef([]);

  const handleCanvasClick = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    let closest = null;
    let minDist = 30;

    renderedPillarsRef.current.forEach((item) => {
      const dist = Math.hypot(item.x - clickX, item.y - clickY);
      if (dist < minDist) {
        minDist = dist;
        closest = item.stateId;
      }
    });

    if (closest) {
      onSelectState(closest);
      if (!audioMuted && playLockOn) playLockOn();
    }
  };

  // Isometric projection helper
  // Latitude [4, 14], Longitude [3, 14] mapped to 3D plane
  const project3D = (lat, lng, height, angle, width, canvasHeight) => {
    // Center at Nigeria centroid [9.08, 8.67]
    const xRel = (lng - 8.67) * 44;
    const yRel = (9.08 - lat) * 44;

    // Rotate around center
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const xRot = xRel * cos - yRel * sin;
    const yRot = xRel * sin + yRel * cos;

    // Isometric tilt
    const isoX = width / 2 + xRot * 1.5;
    const isoY = canvasHeight / 2 + yRot * 0.75 - height;

    return { x: isoX, y: isoY, baseIsoY: canvasHeight / 2 + yRot * 0.75 };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement.clientWidth || 800);
    let height = (canvas.height = 540);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth || 800;
      height = canvas.height = 540;
    };
    window.addEventListener('resize', handleResize);

    // Particle field
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.4 + 0.1,
      opacity: Math.random() * 0.6 + 0.2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Deep Space Matrix Background
      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        50,
        width / 2,
        height / 2,
        width / 1.2
      );
      bgGrad.addColorStop(0, '#0F172A');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Render Floating Data Particles
      particles.forEach((p) => {
        p.y -= p.speed;
        if (p.y < 0) p.y = height;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56, 189, 248, ${p.opacity})`;
        ctx.fill();
      });

      // Ambient Cyber Grid on floor
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1;
      const gridSpan = 8;
      for (let i = -gridSpan; i <= gridSpan; i++) {
        const p1 = project3D(9.08 + i * 0.7, 8.67 - gridSpan * 0.7, 0, angleRef.current, width, height);
        const p2 = project3D(9.08 + i * 0.7, 8.67 + gridSpan * 0.7, 0, angleRef.current, width, height);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.baseIsoY);
        ctx.lineTo(p2.x, p2.baseIsoY);
        ctx.stroke();
      }

      // Sort states from back to front for proper 3D depth occlusion
      const sortedStates = [...NIGERIA_STATES_GEO].sort((a, b) => {
        const yA = (9.08 - a.coords[0]) * Math.sin(angleRef.current);
        const yB = (9.08 - b.coords[0]) * Math.sin(angleRef.current);
        return yA - yB;
      });

      const currentPillars = [];

      // Draw Luminous Pillars
      sortedStates.forEach((state) => {
        const stateData = mapData[state.id];
        const isSelected = selectedState === state.id;

        // Metric height calculation
        let metricVal = 0;
        let pillarHeight = 12; // base stub
        let pillarColor = '#38BDF8'; // default cyan
        let pillarGlow = 'rgba(56, 189, 248, 0.4)';

        if (metricMode === 'backlog') {
          metricVal = stateData?.totalCases ?? 0;
          pillarHeight = 16 + metricVal * 42;
          if (metricVal > 5) {
            pillarColor = '#EF4444';
            pillarGlow = 'rgba(239, 68, 68, 0.6)';
          } else if (metricVal > 2) {
            pillarColor = '#F97316';
            pillarGlow = 'rgba(249, 115, 22, 0.5)';
          } else if (metricVal > 0) {
            pillarColor = '#0284C7';
            pillarGlow = 'rgba(2, 132, 199, 0.5)';
          }
        } else if (metricMode === 'detainees') {
          metricVal = state.estimatedDetainees;
          pillarHeight = 14 + (metricVal / 9000) * 120;
          pillarColor = '#8B5CF6';
          pillarGlow = 'rgba(139, 92, 246, 0.5)';
        } else {
          metricVal = state.congestionIndex;
          pillarHeight = 14 + (metricVal / 100) * 110;
          pillarColor = metricVal > 80 ? '#EF4444' : metricVal > 65 ? '#F59E0B' : '#10B981';
          pillarGlow = metricVal > 80 ? 'rgba(239, 68, 68, 0.5)' : 'rgba(245, 158, 11, 0.4)';
        }

        const top = project3D(state.coords[0], state.coords[1], pillarHeight, angleRef.current, width, height);
        const base = { x: top.x, y: top.baseIsoY };

        currentPillars.push({
          stateId: state.id,
          x: top.x,
          y: top.y,
        });

        // Pillar Base Ring on Floor
        ctx.beginPath();
        ctx.ellipse(base.x, base.y, isSelected ? 16 : 10, isSelected ? 8 : 5, 0, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? 'rgba(56, 189, 248, 0.6)' : 'rgba(30, 41, 59, 0.8)';
        ctx.fill();
        ctx.strokeStyle = pillarColor;
        ctx.lineWidth = isSelected ? 2.5 : 1;
        ctx.stroke();

        // Vertical Luminous Beam / Cylinder
        const beamGrad = ctx.createLinearGradient(base.x, base.y, top.x, top.y);
        beamGrad.addColorStop(0, 'rgba(15, 23, 42, 0.2)');
        beamGrad.addColorStop(0.5, pillarGlow);
        beamGrad.addColorStop(1, pillarColor);

        ctx.fillStyle = beamGrad;
        const radius = isSelected ? 9 : 5;

        // Pillar Body
        ctx.beginPath();
        ctx.moveTo(base.x - radius, base.y);
        ctx.lineTo(top.x - radius, top.y);
        ctx.lineTo(top.x + radius, top.y);
        ctx.lineTo(base.x + radius, base.y);
        ctx.closePath();
        ctx.fill();

        // Pillar Cap
        ctx.beginPath();
        ctx.ellipse(top.x, top.y, radius, radius * 0.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? '#FFFFFF' : pillarColor;
        ctx.fill();

        // Glowing Top Beacon Light
        ctx.beginPath();
        ctx.arc(top.x, top.y - 4, isSelected ? 5 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = pillarColor;
        ctx.shadowBlur = isSelected ? 14 : 6;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset blur

        // State Code Label
        ctx.fillStyle = isSelected ? '#38BDF8' : '#94A3B8';
        ctx.font = isSelected ? 'bold 11px Inter, sans-serif' : '9px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(state.id, top.x, top.y - (isSelected ? 16 : 10));

        if (metricVal > 0 && metricMode === 'backlog') {
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 9px monospace';
          ctx.fillText(`[${metricVal}]`, top.x, top.y - (isSelected ? 28 : 20));
        }
      });

      renderedPillarsRef.current = currentPillars;

      if (autoRotate) {
        angleRef.current += 0.0025;
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [mapData, selectedState, metricMode, autoRotate]);

  return (
    <div className="matrix-3d-wrapper">
      {/* 3D Matrix Controls Bar */}
      <div className="matrix-toolbar">
        <div className="matrix-status-tag">
          <span className="matrix-radar-pulse"></span>
          <span>3D SPATIAL DENSITY MATRIX · VOID PERSPECTIVE</span>
        </div>

        <div className="matrix-button-group">
          <span className="matrix-control-label">Extrude Metric:</span>
          <button
            type="button"
            className={`matrix-tab-btn ${metricMode === 'backlog' ? 'active' : ''}`}
            onClick={() => {
              setMetricMode('backlog');
              if (!audioMuted && playBlip) playBlip(1000);
            }}
          >
            Court Backlog
          </button>
          <button
            type="button"
            className={`matrix-tab-btn ${metricMode === 'detainees' ? 'active' : ''}`}
            onClick={() => {
              setMetricMode('detainees');
              if (!audioMuted && playBlip) playBlip(1100);
            }}
          >
            Detainees Awaiting Trial
          </button>
          <button
            type="button"
            className={`matrix-tab-btn ${metricMode === 'congestion' ? 'active' : ''}`}
            onClick={() => {
              setMetricMode('congestion');
              if (!audioMuted && playBlip) playBlip(1200);
            }}
          >
            Congestion Index
          </button>

          <button
            type="button"
            className={`matrix-orbit-btn ${autoRotate ? 'active' : ''}`}
            onClick={() => {
              setAutoRotate(!autoRotate);
              if (!audioMuted && playBlip) playBlip(800);
            }}
            title="Toggle Orbital Camera"
          >
            {autoRotate ? 'Pause Orbit' : 'Auto Orbit'}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="matrix-canvas-container">
        <canvas
          ref={canvasRef}
          className="matrix-canvas"
          onClick={handleCanvasClick}
          title="Click any pillar to select judicial hub"
        />
      </div>

      <div className="matrix-footer-hud">
        <span className="hud-metric-hint">
          Pillar elevation correlates directly to judicial strain in real-time.
        </span>
      </div>
    </div>
  );
}
