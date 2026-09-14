'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCivicData, CivicProblemItem } from '@/context/CivicDataContext';
import {
  MapPin,
  ExternalLink,
  ThumbsUp,
  AlertTriangle,
  Crosshair,
  Navigation,
  Locate,
  Filter,
} from 'lucide-react';

interface InteractiveCivicMapProps {
  onPickLocation?: (lat: number, lng: number, address: string) => void;
  isPickerMode?: boolean;
}

// Dynamic Leaflet loader — avoids SSR issues with Next.js
let L: typeof import('leaflet') | null = null;

export default function InteractiveCivicMap({
  onPickLocation,
  isPickerMode = false,
}: InteractiveCivicMapProps) {
  const { problems, selectedProblem, setSelectedProblem, upvoteProblem } = useCivicData();
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [pickedCoord, setPickedCoord] = useState<{ lat: number; lng: number } | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const pickedMarkerRef = useRef<any>(null);

  const filteredProblems = activeCategory === 'ALL'
    ? problems
    : problems.filter((p) => p.category === activeCategory);

  // ──────────────────────────────────────────────
  // 1. Load Leaflet dynamically (client-only)
  // ──────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadLeaflet = async () => {
      if (!L) {
        // Inject Leaflet CSS
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.crossOrigin = '';
          document.head.appendChild(link);
        }
        // Import Leaflet JS
        L = await import('leaflet');
      }
      setMapReady(true);
    };

    loadLeaflet();
  }, []);

  // ──────────────────────────────────────────────
  // 2. Get user's live location
  // ──────────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setLocationError('Location access denied — defaulting to Delhi');
        // Fallback: Delhi center
        setUserLocation({ lat: 28.6139, lng: 77.209 });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // ──────────────────────────────────────────────
  // 3. Initialize Leaflet map
  // ──────────────────────────────────────────────
  useEffect(() => {
    if (!mapReady || !L || !mapContainerRef.current || !userLocation) return;
    if (mapInstanceRef.current) return; // Already initialized

    const map = L.map(mapContainerRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 13,
      zoomControl: false,
      attributionControl: true,
    });

    // Add zoom control to bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Dark-mode compatible tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;
    markersLayerRef.current = L.layerGroup().addTo(map);

    // Add user location marker
    const userIcon = L.divIcon({
      className: 'civic-user-marker',
      html: `<div style="
        width: 18px; height: 18px; 
        background: #1E3A8A; 
        border: 3px solid white; 
        border-radius: 50%; 
        box-shadow: 0 0 0 4px rgba(30,58,138,0.3), 0 2px 8px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });

    userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .addTo(map)
      .bindPopup(`
        <div style="font-family: 'Inter', sans-serif; padding: 4px 0;">
          <div style="font-weight: 800; font-size: 12px; color: #1E3A8A;">📍 Your Location</div>
          <div style="font-size: 11px; color: #64748B; margin-top: 2px;">
            ${userLocation.lat.toFixed(5)}° N, ${userLocation.lng.toFixed(5)}° E
          </div>
        </div>
      `);

    // Picker mode: click to drop pin
    if (isPickerMode && onPickLocation) {
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        setPickedCoord({ lat, lng });

        // Remove old picked marker
        if (pickedMarkerRef.current) {
          map.removeLayer(pickedMarkerRef.current);
        }

        const pickedIcon = L!.divIcon({
          className: 'civic-picked-marker',
          html: `<div style="
            width: 28px; height: 28px; 
            background: #DC2626; 
            border: 3px solid white; 
            border-radius: 50%; 
            box-shadow: 0 0 0 4px rgba(220,38,38,0.3), 0 4px 12px rgba(0,0,0,0.3);
            display: flex; align-items: center; justify-content: center;
            color: white; font-size: 14px;
          ">📌</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 28],
        });

        pickedMarkerRef.current = L!.marker([lat, lng], { icon: pickedIcon }).addTo(map);

        // Reverse geocode attempt via Nominatim (free)
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`)
          .then((res) => res.json())
          .then((data) => {
            const addr = data.display_name || `GPS: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;
            onPickLocation(Number(lat.toFixed(6)), Number(lng.toFixed(6)), addr);
          })
          .catch(() => {
            onPickLocation(
              Number(lat.toFixed(6)),
              Number(lng.toFixed(6)),
              `GPS: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`
            );
          });
      });
    }

    return () => {
      // Cleanup on unmount
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
      userMarkerRef.current = null;
      pickedMarkerRef.current = null;
    };
  }, [mapReady, userLocation, isPickerMode, onPickLocation]);

  // ──────────────────────────────────────────────
  // 4. Update problem markers when filter changes
  // ──────────────────────────────────────────────
  useEffect(() => {
    if (!mapReady || !L || !markersLayerRef.current) return;

    const layer = markersLayerRef.current;
    layer.clearLayers();

    filteredProblems.forEach((prob) => {
      const isCritical = prob.priorityScore >= 90;
      const isSelected = selectedProblem?.id === prob.id;

      const markerColor = isSelected ? '#F59E0B' : isCritical ? '#DC2626' : '#1E3A8A';
      const markerSize = isSelected ? 32 : 24;
      const borderColor = isSelected ? '#FCD34D' : isCritical ? '#FCA5A5' : '#93C5FD';

      const icon = L!.divIcon({
        className: 'civic-problem-marker',
        html: `<div style="
          width: ${markerSize}px; height: ${markerSize}px;
          background: ${markerColor};
          border: 2px solid ${borderColor};
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: ${isSelected ? 14 : 11}px; font-weight: 900;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
          transition: transform 0.15s ease;
          font-family: 'JetBrains Mono', monospace;
        ">${Math.round(prob.priorityScore)}</div>`,
        iconSize: [markerSize, markerSize],
        iconAnchor: [markerSize / 2, markerSize / 2],
      });

      const marker = L!.marker([prob.latitude, prob.longitude], { icon });

      const statusLabel =
        prob.status === 'DEPLOYED' ? '🟢 Deployed' :
        prob.status === 'PROTOTYPE_READY' ? '🔵 Prototype Ready' :
        prob.status === 'ADOPTED_CAPSTONE' ? '🟣 Adopted' :
        prob.status === 'VERIFIED' ? '🟡 Verified' :
        prob.status === 'RESOLVED' ? '✅ Resolved' :
        '🔴 Reported';

      marker.bindPopup(`
        <div style="font-family: 'Inter', sans-serif; max-width: 280px; padding: 4px 0;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
            <span style="
              display: inline-block; padding: 2px 8px; 
              background: #EFF6FF; color: #1E3A8A; 
              font-size: 10px; font-weight: 800; 
              border: 1px solid #BFDBFE;
            ">${prob.category.replace(/_/g, ' ')}</span>
            <span style="font-size: 10px; font-weight: 700; color: #F59E0B;">
              ⚠ ${prob.priorityScore}/100
            </span>
          </div>
          <div style="font-weight: 800; font-size: 13px; color: #0F172A; line-height: 1.3;">
            ${prob.title}
          </div>
          <div style="font-size: 11px; color: #64748B; margin-top: 4px; line-height: 1.4;">
            ${prob.description.substring(0, 120)}${prob.description.length > 120 ? '...' : ''}
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 8px; padding-top: 6px; border-top: 1px solid #E2E8F0;">
            <span style="font-size: 10px; color: #64748B; font-weight: 600;">
              📍 ${prob.address}
            </span>
            <span style="font-size: 10px; font-weight: 700;">${statusLabel}</span>
          </div>
          <div style="display: flex; gap: 8px; margin-top: 6px; font-size: 10px; color: #94A3B8;">
            <span>👍 ${prob.upvotesCount} upvotes</span>
            <span>📋 ${prob.reportsCount} reports</span>
            <span>⏱ ${prob.slaRemainingHours}h SLA</span>
          </div>
          ${prob.assignedUniversity ? `
            <div style="margin-top: 6px; padding: 4px 8px; background: #F0FDF4; border: 1px solid #BBF7D0; font-size: 10px; font-weight: 700; color: #166534;">
              🎓 ${prob.assignedUniversity}
            </div>
          ` : ''}
        </div>
      `, { maxWidth: 300 });

      marker.on('click', () => {
        setSelectedProblem(prob);
      });

      marker.addTo(layer);
    });
  }, [mapReady, filteredProblems, selectedProblem, setSelectedProblem]);

  // ──────────────────────────────────────────────
  // 5. Fly to selected problem
  // ──────────────────────────────────────────────
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedProblem) return;
    mapInstanceRef.current.flyTo([selectedProblem.latitude, selectedProblem.longitude], 15, {
      duration: 0.8,
    });
  }, [selectedProblem]);

  // ──────────────────────────────────────────────
  // Re-center on user location
  // ──────────────────────────────────────────────
  const handleRecenter = useCallback(() => {
    if (!mapInstanceRef.current || !userLocation) return;
    mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 14, { duration: 0.6 });
  }, [userLocation]);

  // ──────────────────────────────────────────────
  // Open in Google Maps
  // ──────────────────────────────────────────────
  const centerLat = selectedProblem?.latitude || userLocation?.lat || 28.6139;
  const centerLng = selectedProblem?.longitude || userLocation?.lng || 77.209;

  return (
    <div className="w-full bg-white border border-slate-200 overflow-hidden flex flex-col space-y-3 p-4 sm:p-5 text-slate-900"
      style={{ borderRadius: 0 }}
    >
      {/* ─── Toolbar ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#1E3A8A] text-white flex items-center justify-center"
            style={{ borderRadius: 0 }}
          >
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 tracking-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
              Live Municipal Hotspot Map
            </h3>
            <span className="text-[10px] text-slate-500 font-medium" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {filteredProblems.length} ACTIVE &bull; LIVE GPS &bull; CLICK TO INSPECT
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Re-center button */}
          <button
            type="button"
            onClick={handleRecenter}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200"
            style={{ borderRadius: 0 }}
          >
            <Locate className="w-3.5 h-3.5" />
            <span>My Location</span>
          </button>

          {/* Open in Google Maps */}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${centerLat},${centerLng}`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 bg-[#1E3A8A] hover:bg-[#1e3070] text-white text-xs font-bold transition-all flex items-center gap-1.5"
            style={{ borderRadius: 0 }}
          >
            <span>Google Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* ─── Category Filter Pills ─── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
        {[
          { label: `All (${problems.length})`, value: 'ALL' },
          { label: 'Water', value: 'WATER_SANITATION' },
          { label: 'Roads', value: 'INFRASTRUCTURE_ROADS' },
          { label: 'Environment', value: 'ENVIRONMENT_WASTE' },
          { label: 'Energy', value: 'ENERGY_POWER' },
          { label: 'Healthcare', value: 'HEALTHCARE' },
          { label: 'Agriculture', value: 'AGRICULTURE' },
          { label: 'Safety', value: 'PUBLIC_SAFETY' },
        ].map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => setActiveCategory(cat.value)}
            className={`px-3 py-1 whitespace-nowrap font-bold transition-all border ${
              activeCategory === cat.value
                ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
            }`}
            style={{ borderRadius: 0 }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* ─── Picker Mode Banner ─── */}
      {isPickerMode && (
        <div className="flex items-center gap-2 px-3 py-2 bg-[#FEF3C7] border border-[#FCD34D] text-xs font-bold text-amber-800"
          style={{ borderRadius: 0 }}
        >
          <Navigation className="w-4 h-4 text-amber-600" />
          <span>Click anywhere on the map to drop your GPS pin for the grievance report</span>
        </div>
      )}

      {/* ─── Map Container ─── */}
      <div className="relative w-full h-[460px] border border-slate-300 overflow-hidden bg-slate-100"
        style={{ borderRadius: 0 }}
      >
        {!mapReady || !userLocation ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-50">
            <div className="w-8 h-8 border-2 border-[#1E3A8A] border-t-transparent animate-spin" style={{ borderRadius: '50%' }} />
            <span className="text-xs font-bold text-slate-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {locationError || 'ACQUIRING GPS SIGNAL...'}
            </span>
          </div>
        ) : null}

        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* ─── Selected Problem Quick Card ─── */}
        {selectedProblem && (
          <div
            className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md z-20 bg-white p-4 border border-slate-200 shadow-lg space-y-2"
            style={{ borderRadius: 0 }}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className="px-2.5 py-0.5 text-[10px] font-bold bg-blue-50 text-[#1E3A8A] border border-blue-200"
                style={{ borderRadius: 0 }}
              >
                {selectedProblem.category.replace(/_/g, ' ')}
              </span>
              <div className="flex items-center gap-1 text-[11px] font-extrabold text-amber-600">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>Priority {selectedProblem.priorityScore}/100</span>
              </div>
            </div>

            <div>
              <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 line-clamp-1">
                {selectedProblem.title}
              </h4>
              <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5 leading-relaxed font-medium">
                {selectedProblem.description}
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100">
              <span className="text-slate-500 font-semibold truncate max-w-[200px]">
                📍 {selectedProblem.address}
              </span>

              <button
                type="button"
                onClick={() => upvoteProblem(selectedProblem.id)}
                className={`px-3 py-1 text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  selectedProblem.hasUpvoted
                    ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                    : 'bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-[#1E3A8A] border-slate-200'
                }`}
                style={{ borderRadius: 0 }}
              >
                <ThumbsUp className="w-3 h-3" />
                <span>{selectedProblem.upvotesCount}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
