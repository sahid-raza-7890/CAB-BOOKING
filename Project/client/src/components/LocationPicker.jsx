import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useMapContext } from '../context/MapContext';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const DEBOUNCE_MS = 320;     // Wait before firing autocomplete request
const MIN_CHARS = 2;         // Minimum characters to trigger search
const MAX_SUGGESTIONS = 6;   // Maximum results shown in dropdown

// ─── DEBOUNCE HOOK ────────────────────────────────────────────────────────────
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ─── SESSION TOKEN ────────────────────────────────────────────────────────────
// Groups autocomplete + place detail calls for billing optimization (Google)
function useSessionToken() {
  const [token, setToken] = useState(() => crypto.randomUUID?.() || Math.random().toString(36));
  const refresh = () => setToken(crypto.randomUUID?.() || Math.random().toString(36));
  return [token, refresh];
}

// ─── SUGGESTION ITEM ─────────────────────────────────────────────────────────
function SuggestionItem({ suggestion, onSelect, isHighlighted }) {
  return (
    <div
      id={`suggestion-${suggestion.place_id}`}
      onClick={() => onSelect(suggestion)}
      onMouseDown={e => e.preventDefault()} // prevent input blur before click fires
      style={{
        padding: '10px 14px',
        cursor: 'pointer',
        background: isHighlighted ? 'var(--badge-bg)' : 'transparent',
        borderRadius: 8,
        transition: 'background 0.15s',
        display: 'flex', alignItems: 'flex-start', gap: 10,
      }}
    >
      <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>
        {suggestion.provider === 'google' ? '🔍' : '📍'}
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {suggestion.main_text}
        </div>
        {suggestion.secondary_text && (
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {suggestion.secondary_text}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAP PIN MODAL ────────────────────────────────────────────────────────────
// A lightweight interactive map using Google Maps
function MapPinModal({ initialAddress, onConfirm, onClose }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [pinAddress, setPinAddress] = useState(initialAddress || '');
  const [pinCoords, setPinCoords] = useState(null);
  const [resolving, setResolving] = useState(false);
  const [snapMessage, setSnapMessage] = useState('');
  const [venue, setVenue] = useState(null);
  const [showFloorPlan, setShowFloorPlan] = useState(false);

  const markerInst = useRef(null);

  useEffect(() => {
    const loadMap = () => {
      if (!window.L || !mapRef.current) return;
      const L = window.L;
      if (!mapInstanceRef.current) {
        const initialCoords = pinCoords ? [pinCoords.lat, pinCoords.lon] : [20.5937, 78.9629];
        const initialZoom = pinCoords ? 15 : 5;
        const map = L.map(mapRef.current, { zoomControl: true, attributionControl: false, preferCanvas: true }).setView(initialCoords, initialZoom);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19, subdomains: 'abcd' }).addTo(map);
        mapInstanceRef.current = map;
        
        map.on('click', async (e) => {
          const lat = e.latlng.lat;
          const lng = e.latlng.lng;
          await validatePin(lat, lng);
        });

        if (pinCoords) {
          markerInst.current = L.marker([pinCoords.lat, pinCoords.lon], { 
            draggable: true,
            icon: L.divIcon({ html: '<div style="font-size:32px;filter:drop-shadow(0 4px 8px rgba(239,68,68,0.5));">📍</div>', iconSize:[32,32], iconAnchor:[16,32], className:'' }) 
          }).addTo(map);

          markerInst.current.on('dragend', async (e) => {
            const lat = e.target.getLatLng().lat;
            const lng = e.target.getLatLng().lng;
            await validatePin(lat, lng);
          });
        }
      } else {
        if (pinCoords) {
          mapInstanceRef.current.setView([pinCoords.lat, pinCoords.lon]);
          if (markerInst.current) {
            markerInst.current.setLatLng([pinCoords.lat, pinCoords.lon]);
          } else {
            const L = window.L;
            markerInst.current = L.marker([pinCoords.lat, pinCoords.lon], { 
              draggable: true,
              icon: L.divIcon({ html: '<div style="font-size:32px;filter:drop-shadow(0 4px 8px rgba(239,68,68,0.5));">📍</div>', iconSize:[32,32], iconAnchor:[16,32], className:'' }) 
            }).addTo(mapInstanceRef.current);
            markerInst.current.on('dragend', async (e) => {
              const lat = e.target.getLatLng().lat;
              const lng = e.target.getLatLng().lng;
              await validatePin(lat, lng);
            });
          }
        }
      }
    };

    if (window.L) { loadMap(); return; }
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement('link'); link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = loadMap;
    document.head.appendChild(script);

  }, [pinCoords]);

  const validatePin = async (lat, lng) => {
    try {
      const res = await fetch('http://localhost:5000/api/maps/validate-pickup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lon: lng })
      });
      const data = await res.json();
      
      let finalLat = lat;
      let finalLng = lng;
      
      if (!data.valid && data.snappedLat && data.snappedLng) {
        finalLat = data.snappedLat;
        finalLng = data.snappedLng;
        setSnapMessage(data.message || 'Snapped to nearest valid zone.');
        setTimeout(() => setSnapMessage(''), 4000);
      } else {
        setSnapMessage('');
      }

      if (data.venue) {
        setVenue(data.venue);
      } else {
        setVenue(null);
        setShowFloorPlan(false);
      }
      
      setPinCoords({ lat: finalLat, lon: finalLng });
      await resolveAddress(finalLat, finalLng);
    } catch (err) {
      setPinCoords({ lat, lon: lng });
      await resolveAddress(lat, lng);
    }
  };

  // (Click handlers moved inside useEffect)

  const resolveAddress = async (lat, lon) => {
    setResolving(true);
    try {
      const res = await fetch('http://localhost:5000/api/maps/reverse-geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lon }),
      });
      const data = await res.json();
      if (data.address) setPinAddress(data.address);
    } catch (_) {
      setPinAddress(`${lat.toFixed(5)}, ${lon.toFixed(5)}`);
    } finally {
      setResolving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}
      onClick={onClose}
    >
      <div
        className="premium-glass"
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 640, overflow: 'hidden', padding: 0 }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--card-border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--text-main)' }}>📌 Drop a Pin</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Click on the map or drag the pin to set your location
            </div>
          </div>
          <button
            id="map-modal-close"
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--card-border)', border: 'none',
              fontSize: 18, cursor: 'pointer', color: 'var(--text-main)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >×</button>
        </div>

        {/* Map Container */}
        <div style={{ position: 'relative', width: '100%', height: 360, background: 'var(--card-bg)' }}>
          <div style={{ width: '100%', height: '100%' }}>
            <div id="ucab-location-picker-map" ref={mapRef} style={{ width: '100%', height: '100%' }} />
          </div>

          {/* Toast for Geofencing Snaps */}
          {snapMessage && (
            <div style={{
              position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(239, 68, 68, 0.9)', color: '#fff',
              padding: '8px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)', zIndex: 999,
              animation: 'dropIn 0.3s ease', whiteSpace: 'nowrap'
            }}>
              ⚠️ {snapMessage}
            </div>
          )}

          {/* Venue Floor Plan Overlay */}
          {showFloorPlan && venue && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 400,
              background: 'rgba(0,0,0,0.85)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <img src={venue.floorPlanUrl} alt={`${venue.name} Floor Plan`} style={{ maxWidth: '90%', maxHeight: '90%' }} />
            </div>
          )}
        </div>

        {/* Floor Plan Toggle Button */}
        {venue && (
          <div style={{ background: 'var(--card-bg)', padding: '8px 24px', borderTop: '1px solid var(--card-border)' }}>
            <button
              onClick={() => setShowFloorPlan(!showFloorPlan)}
              style={{
                width: '100%', padding: '8px 0', borderRadius: 8,
                background: showFloorPlan ? 'var(--primary-accent)' : 'var(--badge-bg)',
                color: showFloorPlan ? '#fff' : 'var(--primary-accent)',
                border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              🏢 {showFloorPlan ? 'Hide Floor Plan' : `View ${venue.name} Floor Plan`}
            </button>
          </div>
        )}

        {/* Address Preview + Confirm */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--card-border)',
          background: 'var(--card-bg)',
        }}>
          <div style={{
            padding: '10px 14px',
            background: 'var(--bg-color)',
            borderRadius: 10,
            border: '1px solid var(--card-border)',
            fontSize: 13, color: 'var(--text-main)',
            minHeight: 40,
            marginBottom: 14,
          }}>
            {resolving
              ? <span style={{ color: 'var(--text-muted)' }}>🔍 Resolving address…</span>
              : pinAddress || <span style={{ color: 'var(--text-muted)' }}>Click the map to select a location</span>
            }
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 10,
                background: 'var(--card-bg)', color: 'var(--text-main)',
                border: '1px solid var(--card-border)', fontWeight: 600, fontSize: 14, cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              id="map-confirm-btn"
              disabled={!pinAddress || resolving}
              onClick={() => { onConfirm(pinAddress, pinCoords); onClose(); }}
              style={{
                flex: 2, padding: '10px 0', borderRadius: 10,
                background: pinAddress && !resolving ? 'var(--primary-accent)' : 'var(--card-border)',
                color: 'var(--primary-text)',
                border: 'none', fontWeight: 700, fontSize: 14,
                cursor: pinAddress && !resolving ? 'pointer' : 'not-allowed',
              }}
            >
              {resolving ? '⏳ Resolving…' : '✅ Use This Location'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
/**
 * LocationPicker — Smart address input with autocomplete + map pin drop.
 *
 * Props:
 *   value         string     — controlled input value
 *   onChange      fn(string) — called with new address string
 *   onCoords      fn({lat,lon}) — called with coordinates when available
 *   placeholder   string
 *   id            string     — unique id for accessibility
 *   icon          string     — emoji prefix (default 📍)
 *   label         string     — visible field label
 *   disabled      bool
 *   showPinDrop   bool       — show the "Pin Drop" button (default true)
 *   autoFocus     bool
 */
export default function LocationPicker({
  value = '',
  onChange,
  onCoords,
  placeholder = 'Enter location…',
  id = 'location-picker',
  icon = '📍',
  label,
  disabled = false,
  showPinDrop = true,
  autoFocus = false,
}) {
  const { theme } = useTheme();

  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showMap, setShowMap] = useState(false);
  const [sessionToken, refreshSessionToken] = useSessionToken();

  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const abortRef = useRef(null);

  const debouncedQuery = useDebounce(query, DEBOUNCE_MS);

  // Sync external value → internal query
  useEffect(() => { setQuery(value); }, [value]);

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim().length < MIN_CHARS || !focused) {
      setSuggestions([]);
      setError('');
      return;
    }

    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const fetchSuggestions = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({ input: debouncedQuery, session: sessionToken });
        const res = await fetch(`http://localhost:5000/api/maps/autocomplete?${params}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          const err = await res.json();
          setError(err.error || 'Search failed.');
          setSuggestions([]);
          return;
        }

        const data = await res.json();
        const suggestionsArr = data.suggestions || data || [];
        if(Array.isArray(suggestionsArr)) setSuggestions(suggestionsArr.slice(0, MAX_SUGGESTIONS));
        else setSuggestions([]);
        setHighlightedIndex(-1);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError('Location search unavailable.');
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery, focused]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setSuggestions([]);
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange?.(val);
    setHighlightedIndex(-1);
    if (!val) setSuggestions([]);
  };

  const handleSelectSuggestion = (suggestion) => {
    const addr = suggestion.description;
    setQuery(addr);
    setSuggestions([]);
    setFocused(false);
    onChange?.(addr);
    if (suggestion.lat != null) onCoords?.({ lat: suggestion.lat, lon: suggestion.lon });
    refreshSessionToken(); // New session for next search
    inputRef.current?.blur();
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!suggestions.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setSuggestions([]);
      setFocused(false);
    }
  };

  const handlePinConfirm = (address, coords) => {
    setQuery(address);
    onChange?.(address);
    if (coords) onCoords?.(coords);
    setShowMap(false);
  };

  const showDropdown = focused && (loading || suggestions.length > 0 || error);

  return (
    <>
      <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
        {/* Label */}
        {label && (
          <label
            htmlFor={id}
            style={{
              display: 'block', fontSize: 12, fontWeight: 700,
              color: 'var(--text-muted)', marginBottom: 8,
              textTransform: 'uppercase', letterSpacing: '0.5px'
            }}
          >
            {icon} {label}
          </label>
        )}

        {/* Input Row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--bg-color)',
          border: `1.5px solid ${focused ? 'var(--primary-accent)' : 'var(--card-border)'}`,
          borderRadius: 12,
          padding: '2px 4px 2px 12px',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          boxShadow: focused ? '0 0 0 3px rgba(40,167,69,0.12)' : 'none',
        }}>
          {/* Icon */}
          <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>

          {/* Input */}
          <input
            ref={inputRef}
            id={id}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={showDropdown}
            aria-controls={`${id}-dropdown`}
            style={{
              flex: 1, border: 'none', outline: 'none',
              background: 'transparent', fontSize: 14,
              color: 'var(--text-main)', padding: '10px 4px',
              minWidth: 0,
            }}
          />

          {/* Loading spinner */}
          {loading && (
            <div style={{
              width: 16, height: 16, borderRadius: '50%',
              border: '2px solid var(--card-border)',
              borderTopColor: 'var(--primary-accent)',
              animation: 'spin 0.7s linear infinite', flexShrink: 0
            }} />
          )}

          {/* Clear button */}
          {query && !loading && (
            <button
              id={`${id}-clear`}
              onClick={() => { setQuery(''); onChange?.(''); setSuggestions([]); inputRef.current?.focus(); }}
              style={{
                width: 22, height: 22, borderRadius: '50%',
                background: 'var(--card-border)', border: 'none',
                fontSize: 13, cursor: 'pointer', color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'background 0.15s'
              }}
              title="Clear"
            >×</button>
          )}

          {/* Pin Drop Trigger */}
          {showPinDrop && (
            <button
              id={`${id}-pin-btn`}
              onClick={(e) => { e.preventDefault(); setShowMap(true); }}
              title="Drop a pin on the map"
              style={{
                padding: '7px 12px', borderRadius: 8, border: 'none',
                background: 'var(--badge-bg)', color: 'var(--badge-text)',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                flexShrink: 0, transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              📌 Pin
            </button>
          )}

          {/* Current Location Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              if (navigator.geolocation) {
                setLoading(true);
                navigator.geolocation.getCurrentPosition(
                  async (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    try {
                      const res = await fetch(`http://localhost:5000/api/maps/reverse-geocode`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ lat, lon })
                      });
                      const data = await res.json();
                      if (data.address) {
                        setQuery(data.address);
                        onChange?.(data.address);
                        onCoords?.({ lat, lon });
                      }
                    } catch (err) {
                      console.error("Failed to reverse geocode:", err);
                    } finally {
                      setLoading(false);
                    }
                  },
                  (err) => {
                    console.error("Geolocation error:", err);
                    setLoading(false);
                  }
                );
              }
            }}
            title="Use current location"
            style={{
              padding: '7px 12px', borderRadius: 8, border: 'none',
              background: 'var(--primary-accent)', color: '#fff',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              flexShrink: 0, transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            🎯
          </button>
        </div>

        {/* Dropdown */}
        {showDropdown && (
          <div
            id={`${id}-dropdown`}
            role="listbox"
            style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              borderRadius: 12,
              boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
              zIndex: 500,
              overflow: 'hidden',
              animation: 'dropIn 0.15s ease',
            }}
          >
            {/* Loading state */}
            {loading && !suggestions.length && (
              <div style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: 13 }}>
                🔍 Searching…
              </div>
            )}

            {/* Error state */}
            {error && (
              <div style={{ padding: '12px 16px', color: '#ef4444', fontSize: 13 }}>
                ⚠️ {error}
              </div>
            )}

            {/* Suggestions */}
            {suggestions.map((s, i) => (
              <SuggestionItem
                key={s.place_id}
                suggestion={s}
                onSelect={handleSelectSuggestion}
                isHighlighted={i === highlightedIndex}
              />
            ))}

              <div style={{
                padding: '6px 14px',
                fontSize: 10, color: 'var(--text-muted)',
                borderTop: '1px solid var(--card-border)',
                textAlign: 'right'
              }}>
                🔵 Powered by Google Maps
              </div>
          </div>
        )}
      </div>

      {/* Map Pin Modal */}
      {showMap && (
        <MapPinModal
          initialAddress={query}
          onConfirm={handlePinConfirm}
          onClose={() => setShowMap(false)}
        />
      )}

      {/* Keyframe animations */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes dropIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  );
}
