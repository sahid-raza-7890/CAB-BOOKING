import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

// ─── FALLBACK DATA (shown while API loads or on network error) ────────────────
const FALLBACK_VEHICLES = [
  { _id: 'f1', type: 'Basic', label: 'Mini', emoji: '🚗', description: 'Affordable city rides.', baseFare: 4.99, perKmRate: 0.80, capacity: 4, luggageCapacity: 1, eta: '2-4 min', features: ['AC', 'Music'] },
  { _id: 'f2', type: 'Basic', label: 'Sedan', emoji: '🚙', description: 'Comfortable everyday rides.', baseFare: 7.99, perKmRate: 1.10, capacity: 4, luggageCapacity: 2, eta: '3-5 min', isFeatured: true, features: ['AC', 'USB Charging'] },
  { _id: 'f3', type: 'SUV', label: 'SUV', emoji: '🚐', description: 'Spacious for families.', baseFare: 12.99, perKmRate: 1.60, capacity: 6, luggageCapacity: 4, eta: '4-6 min', features: ['AC', 'Extra Space'] },
  { _id: 'f4', type: 'Luxurious', label: 'Luxury', emoji: '🏎️', description: 'Premium experience.', baseFare: 24.99, perKmRate: 2.50, capacity: 4, luggageCapacity: 3, eta: '5-8 min', features: ['WiFi', 'Water'] },
  { _id: 'f5', type: 'Moto', label: 'Moto', emoji: '🏍️', description: 'Beat traffic fast.', baseFare: 2.49, perKmRate: 0.50, capacity: 1, luggageCapacity: 0, eta: '1-2 min', features: ['Helmet'] },
  { _id: 'f6', type: 'Auto', label: 'Auto', emoji: '🛺', description: 'Budget city hops.', baseFare: 1.99, perKmRate: 0.40, capacity: 3, luggageCapacity: 1, eta: '2-3 min', features: ['Budget'] },
  { _id: 'f7', type: 'EV', label: 'Electric', emoji: '⚡', description: 'Zero emissions rides.', baseFare: 8.99, perKmRate: 1.00, capacity: 4, luggageCapacity: 2, eta: '4-7 min', features: ['Eco', 'Silent'] },
  { _id: 'f8', type: 'BookLater', label: 'Schedule', emoji: '📅', description: 'Pre-book up to 7 days ahead.', baseFare: 9.99, perKmRate: 1.20, capacity: 4, luggageCapacity: 2, eta: 'Scheduled', features: ['Guaranteed'] },
  { _id: 'f9', type: 'Rental', label: 'Rental', emoji: '🔑', description: 'Driver by the hour.', baseFare: 29.99, perKmRate: 0, capacity: 4, luggageCapacity: 3, eta: 'On Demand', features: ['Multi-Stop'] },
];

// ─── FILTER TABS ──────────────────────────────────────────────────────────────
const FILTERS = [
  { id: 'All', label: '🚘 All' },
  { id: 'Basic', label: '🚗 Basic' },
  { id: 'SUV', label: '🚐 SUV' },
  { id: 'Luxurious', label: '🏎️ Luxury' },
  { id: 'Moto', label: '🏍️ Moto' },
  { id: 'Auto', label: '🛺 Auto' },
  { id: 'EV', label: '⚡ EV' },
  { id: 'BookLater', label: '📅 Book Later' },
  { id: 'Rental', label: '🔑 Rentals' },
];

// ─── SKELETON CARD ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--card-bg)', border: '1px solid var(--card-border)',
      borderRadius: 20, padding: 28, animation: 'pulse 1.5s ease-in-out infinite'
    }}>
      <div style={{ width: 64, height: 64, borderRadius: 12, background: 'var(--card-border)', margin: '0 auto 16px' }} />
      <div style={{ height: 20, borderRadius: 8, background: 'var(--card-border)', marginBottom: 10 }} />
      <div style={{ height: 14, borderRadius: 6, background: 'var(--card-border)', width: '70%', margin: '0 auto 16px' }} />
      <div style={{ height: 28, borderRadius: 8, background: 'var(--card-border)' }} />
    </div>
  );
}

// ─── VEHICLE CARD ─────────────────────────────────────────────────────────────
function VehicleCard({ vehicle, selected, onSelect }) {
  const isSelected = selected?._id === vehicle._id;

  return (
    <div
      id={`vehicle-card-${vehicle.label.toLowerCase().replace(/\s+/, '-')}`}
      className="premium-glass"
      onClick={() => onSelect(vehicle)}
      style={{
        padding: 24,
        textAlign: 'center',
        cursor: 'pointer',
        border: isSelected
          ? '2px solid var(--primary-accent)'
          : '1px solid var(--card-border)',
        boxShadow: isSelected
          ? '0 0 0 4px rgba(var(--primary-accent-rgb, 40,167,69), 0.15), var(--shadow-glass)'
          : 'var(--shadow-glass)',
        transform: isSelected ? 'translateY(-4px) scale(1.02)' : undefined,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
      }}
      role="button"
      aria-pressed={isSelected}
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onSelect(vehicle)}
    >
      {/* Featured / Type Badge */}
      {vehicle.isFeatured && (
        <div style={{
          position: 'absolute', top: 12, right: 12,
          background: 'var(--primary-accent)', color: 'var(--primary-text)',
          fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 999,
          letterSpacing: '0.5px', textTransform: 'uppercase'
        }}>
          Popular
        </div>
      )}

      {/* Selected Checkmark */}
      {isSelected && (
        <div style={{
          position: 'absolute', top: 12, left: 12,
          background: 'var(--primary-accent)', color: 'var(--primary-text)',
          width: 24, height: 24, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700
        }}>✓</div>
      )}

      {/* Icon */}
      <div style={{ fontSize: 52, marginBottom: 12, lineHeight: 1 }}>{vehicle.emoji}</div>

      {/* Name */}
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6, color: 'var(--text-main)' }}>
        {vehicle.label}
      </div>

      {/* Description */}
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5 }}>
        {vehicle.description}
      </div>

      {/* Meta: seats + bags + ETA */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>
        {vehicle.capacity > 0 && <span>👤 {vehicle.capacity}</span>}
        {vehicle.luggageCapacity > 0 && <span>🧳 {vehicle.luggageCapacity}</span>}
        <span>⏱ {vehicle.eta}</span>
      </div>

      {/* Features Chips */}
      {vehicle.features?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 16 }}>
          {vehicle.features.slice(0, 3).map(f => (
            <span key={f} style={{
              fontSize: 10, padding: '3px 9px', borderRadius: 999,
              background: 'var(--badge-bg)', color: 'var(--badge-text)',
              fontWeight: 600
            }}>
              {f}
            </span>
          ))}
        </div>
      )}

      {/* Price */}
      <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--primary-accent)' }}>
        ₹{vehicle.baseFare.toFixed(2)}
        <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginLeft: 4 }}>
          {vehicle.perKmRate > 0 ? `+ ₹${vehicle.perKmRate}/km` : '/ flat rate'}
        </span>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function VehicleSelector({ onVehicleSelect }) {
  const { theme } = useTheme();

  const [vehicles, setVehicles] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Fetch from backend ──
  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('http://localhost:5000/api/vehicles');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setVehicles(data.length ? data : FALLBACK_VEHICLES);
      } catch (err) {
        console.warn('Using fallback vehicle data:', err.message);
        setVehicles(FALLBACK_VEHICLES);
        setError('Live data unavailable — showing demo fleet.');
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  // ── Filter whenever vehicles list or active filter changes ──
  useEffect(() => {
    if (activeFilter === 'All') {
      setFiltered(vehicles);
    } else {
      setFiltered(vehicles.filter(v => v.type === activeFilter));
    }
  }, [vehicles, activeFilter]);

  const handleSelect = (vehicle) => {
    setSelected(vehicle);
    onVehicleSelect?.(vehicle);   // bubble up to parent (e.g. Home.jsx)
  };

  return (
    <section id="vehicle-selector" style={{ padding: '80px 0', background: 'var(--bg-color)' }}>
      <div className="section-wrapper">

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="section-badge">🚘 Our Fleet</div>
          <h2 className="section-title">Choose Your Ride</h2>
          <p className="section-subtitle" style={{ margin: '0 auto 36px' }}>
            From budget city hops to premium transfers — we have the perfect vehicle for every journey.
          </p>

          {/* Filter Tabs */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', justifyContent: 'center',
            gap: 8, marginBottom: 8
          }}>
            {FILTERS.map(f => (
              <button
                key={f.id}
                id={`filter-${f.id.toLowerCase()}`}
                onClick={() => setActiveFilter(f.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 999,
                  border: activeFilter === f.id
                    ? '2px solid var(--primary-accent)'
                    : '1px solid var(--card-border)',
                  background: activeFilter === f.id ? 'var(--primary-accent)' : 'var(--card-bg)',
                  color: activeFilter === f.id ? 'var(--primary-text)' : 'var(--text-muted)',
                  fontSize: 13, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div style={{
            marginBottom: 24, padding: '10px 16px', borderRadius: 10,
            background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)',
            color: 'var(--text-muted)', fontSize: 13, textAlign: 'center'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
          gap: 20
        }}>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : filtered.map(v => (
                <VehicleCard
                  key={v._id}
                  vehicle={v}
                  selected={selected}
                  onSelect={handleSelect}
                />
              ))
          }
        </div>

        {/* Selection Confirm Bar */}
        {selected && !loading && (
          <div style={{
            marginTop: 32, padding: '20px 28px',
            background: 'var(--card-bg)',
            border: '2px solid var(--primary-accent)',
            borderRadius: 16,
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
            boxShadow: '0 8px 32px rgba(40,167,69,0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 40 }}>{selected.emoji}</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>{selected.label} selected</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{selected.description}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--primary-accent)' }}>
                ₹{selected.baseFare.toFixed(2)}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>base fare · ETA {selected.eta}</div>
            </div>
          </div>
        )}

      </div>

      {/* Pulse animation for skeleton */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </section>
  );
}
