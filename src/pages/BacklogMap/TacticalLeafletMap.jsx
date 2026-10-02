import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { NIGERIA_CENTER, NIGERIA_DEFAULT_ZOOM, NIGERIA_STATES_GEO } from './nigeriaGeoData.js';

export default function TacticalLeafletMap({
  mapData,
  selectedState,
  onSelectState,
  onHoverState,
  audioMuted,
  playBlip,
  playLockOn,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const [cursorCoords, setCursorCoords] = useState({ lat: 9.082, lng: 8.675, zoom: 6 });

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Fix leaflet default icon path if needed, though we use custom divIcons
    delete L.Icon.Default.prototype._getIconUrl;

    const map = L.map(mapContainerRef.current, {
      center: NIGERIA_CENTER,
      zoom: NIGERIA_DEFAULT_ZOOM,
      minZoom: 5,
      maxZoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    // Add CartoDB Dark Matter tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Custom tactical Zoom control positioned top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Mouse move coordinate readout
    map.on('mousemove', (e) => {
      setCursorCoords({
        lat: Number(e.latlng.lat.toFixed(4)),
        lng: Number(e.latlng.lng.toFixed(4)),
        zoom: map.getZoom(),
      });
    });

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers when mapData or selectedState changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    NIGERIA_STATES_GEO.forEach((state) => {
      const stateData = mapData[state.id];
      const isSelected = selectedState === state.id;
      const totalCases = stateData?.totalCases ?? 0;
      const stalledCases = stateData?.stalledCases ?? 0;
      const activeCases = stateData?.activeCases ?? 0;

      // Color tier
      let tierClass = 'beacon-tier--zero';
      let tierColor = '#64748B';
      if (totalCases > 5 || stateData?.alertLevel === 'critical') {
        tierClass = 'beacon-tier--critical';
        tierColor = '#EF4444';
      } else if (totalCases > 2 || stateData?.alertLevel === 'severe') {
        tierClass = 'beacon-tier--severe';
        tierColor = '#F97316';
      } else if (totalCases > 0 || stateData?.alertLevel === 'warning') {
        tierClass = 'beacon-tier--warning';
        tierColor = '#38BDF8';
      } else {
        tierClass = 'beacon-tier--compliant';
        tierColor = '#10B981';
      }

      // Cyber Beacon Icon
      const beaconIcon = L.divIcon({
        className: 'cyber-beacon-container',
        html: `
          <div class="cyber-beacon ${tierClass} ${isSelected ? 'is-selected' : ''}">
            <div class="beacon-pulse-ring"></div>
            <div class="beacon-pulse-ring-outer"></div>
            <div class="beacon-core-dot"></div>
            ${totalCases > 0 ? `<span class="beacon-badge-count">${totalCases}</span>` : ''}
            <div class="beacon-tag-label">${state.name}</div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      const marker = L.marker(state.coords, { icon: beaconIcon });

      // Holographic Popup
      const popupHtml = `
        <div class="cyber-popup-card">
          <div class="cyber-popup-header">
            <span class="cyber-popup-tag">${state.isFederalHq ? 'FEDERAL HQ' : `${state.region.toUpperCase()}`}</span>
            <h4 class="cyber-popup-title">${state.name}</h4>
          </div>
          <div class="cyber-popup-body">
            <div class="cyber-popup-stat">
              <span class="cyber-stat-label">Total Backlog</span>
              <span class="cyber-stat-value" style="color: ${tierColor}">${totalCases} Cases</span>
            </div>
            <div class="cyber-popup-stat-grid">
              <div>
                <span class="cyber-stat-mini-label">Active</span>
                <span class="cyber-stat-mini-val">${activeCases}</span>
              </div>
              <div>
                <span class="cyber-stat-mini-label">Stalled</span>
                <span class="cyber-stat-mini-val">${stalledCases}</span>
              </div>
              <div>
                <span class="cyber-stat-mini-label">Est. Detainees</span>
                <span class="cyber-stat-mini-val">${state.estimatedDetainees.toLocaleString()}</span>
              </div>
            </div>
            <div class="cyber-popup-courts">
              <span class="cyber-stat-mini-label">Jurisdictions (${state.courts.length})</span>
              <ul class="cyber-courts-list">
                ${state.courts.slice(0, 3).map((c) => `<li>• ${c}</li>`).join('')}
              </ul>
            </div>
          </div>
          <div class="cyber-popup-footer">
            <button class="cyber-popup-btn" data-state-id="${state.id}">
              Inspect Judicial Division →
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'cyber-leaflet-popup',
        maxWidth: 320,
        closeButton: false,
      });

      marker.on('click', () => {
        onSelectState(state.id);
        if (!audioMuted && playLockOn) playLockOn();
      });

      marker.on('mouseover', () => {
        onHoverState(state.id);
        if (!audioMuted && playBlip) playBlip(1200);
      });

      marker.on('mouseout', () => {
        onHoverState(null);
      });

      marker.addTo(layer);
    });
  }, [mapData, selectedState, audioMuted, onSelectState, onHoverState, playBlip, playLockOn]);

  // Center on selected state when changed via dropdown or list
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedState) return;

    const matched = NIGERIA_STATES_GEO.find((s) => s.id === selectedState);
    if (matched) {
      map.flyTo(matched.coords, Math.max(map.getZoom(), 8), {
        animate: true,
        duration: 1.2,
      });
    }
  }, [selectedState]);

  // Quick Preset Jumps
  const handleJump = (coords, zoom) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo(coords, zoom, { animate: true, duration: 1.2 });
    if (!audioMuted && playBlip) playBlip(900);
  };

  return (
    <div className="tactical-leaflet-container">
      {/* HUD Telemetry Overlay (Top-Left) */}
      <div className="tactical-hud-top-left">
        <div className="tactical-status-indicator">
          <span className="tactical-pulse-dot"></span>
          <span className="tactical-mode-title">GIS TACTICAL SATELLITE · ACTIVE</span>
        </div>
        <div className="tactical-coords-readout">
          <span>LAT: {cursorCoords.lat > 0 ? `${cursorCoords.lat}°N` : `${Math.abs(cursorCoords.lat)}°S`}</span>
          <span className="tactical-separator">|</span>
          <span>LNG: {cursorCoords.lng > 0 ? `${cursorCoords.lng}°E` : `${Math.abs(cursorCoords.lng)}°W`}</span>
          <span className="tactical-separator">|</span>
          <span>ZOOM: {cursorCoords.zoom}x</span>
        </div>
      </div>

      {/* Quick Jump Hotspot Toolbar */}
      <div className="tactical-presets-bar">
        <button
          type="button"
          className="tactical-preset-chip"
          onClick={() => handleJump([6.5244, 3.3792], 10)}
        >
          Lagos Hub
        </button>
        <button
          type="button"
          className="tactical-preset-chip"
          onClick={() => handleJump([9.0765, 7.3986], 10)}
        >
          Abuja HQ
        </button>
        <button
          type="button"
          className="tactical-preset-chip"
          onClick={() => handleJump([4.8156, 7.0498], 9)}
        >
          Niger Delta
        </button>
        <button
          type="button"
          className="tactical-preset-chip"
          onClick={() => handleJump([12.0022, 8.5920], 9)}
        >
          Kano Circuit
        </button>
        <button
          type="button"
          className="tactical-preset-chip reset"
          onClick={() => handleJump(NIGERIA_CENTER, NIGERIA_DEFAULT_ZOOM)}
        >
          Full View
        </button>
      </div>

      {/* Cyber Grid Scanning Line Animation Overlay */}
      <div className="tactical-scanline-overlay" aria-hidden="true" />

      {/* Real Map Canvas */}
      <div ref={mapContainerRef} className="tactical-leaflet-map-element" />
    </div>
  );
}
