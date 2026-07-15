import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

import { CarFront, Bike, Zap, CalendarClock, CarTaxiFront, Truck, Star, Key } from 'lucide-react';

const getVehicleIcon = (label, isSelected) => {
  const l = (label || '').toLowerCase();
  const color = isSelected ? 'var(--primary-accent)' : 'var(--text-main)';
  if (l.includes('moto') || l.includes('bike')) return <Bike size={36} color={color} strokeWidth={1.5} />;
  if (l.includes('auto')) return <CarTaxiFront size={36} color={color} strokeWidth={1.5} />;
  if (l.includes('electric')) return <Zap size={36} color={color} strokeWidth={1.5} />;
  if (l.includes('schedule')) return <CalendarClock size={36} color={color} strokeWidth={1.5} />;
  if (l.includes('suv')) return <Truck size={36} color={color} strokeWidth={1.5} />;
  if (l.includes('luxury')) return <Star size={36} color={color} strokeWidth={1.5} />;
  if (l.includes('rental')) return <Key size={36} color={color} strokeWidth={1.5} />;
  return <CarFront size={36} color={color} strokeWidth={1.5} />;
}


export default function FarePreview({ distanceKm, bookingType, onSelectVehicle }) {
  const { theme } = useTheme();
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const fetchFares = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('http://localhost:5000/api/rides/fare-estimate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ distanceKm, type: bookingType })
        });
        const data = await res.json();
        if (res.ok) {
          setEstimates(data.estimates || []);
        } else {
          setError(data.error || 'Failed to fetch estimates');
        }
      } catch (err) {
        setError('Network error getting fare estimates');
      } finally {
        setLoading(false);
      }
    };
    fetchFares();
  }, [distanceKm, bookingType]);

  const handleSelect = (v) => {
    setSelectedId(v.id);
    onSelectVehicle(v);
  };

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{
          width: 24, height: 24, borderRadius: '50%',
          border: '2px solid var(--card-border)', borderTopColor: 'var(--primary-accent)',
          animation: 'spin 1s linear infinite', margin: '0 auto 10px'
        }} />
        Calculating best fares...
      </div>
    );
  }

  if (error) {
    return <div style={{ color: '#ef4444', padding: 20, textAlign: 'center' }}>⚠️ {error}</div>;
  }

  return (
    <div style={{ marginTop: 20 }}>
      <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)', marginBottom: 12 }}>
        Select Vehicle Tier
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 12
      }}>
        {estimates.map(v => {
          const isSelected = selectedId === v.id;
          return (
            <div
              key={v.id}
              onClick={() => handleSelect(v)}
              className="premium-glass"
              style={{
                padding: '16px 12px',
                cursor: 'pointer',
                textAlign: 'center',
                border: isSelected ? '2px solid var(--primary-accent)' : '1px solid var(--card-border)',
                background: isSelected ? 'var(--badge-bg)' : 'var(--card-bg)',
                transition: 'all 0.2s',
                transform: isSelected ? 'translateY(-2px)' : 'none',
                boxShadow: isSelected ? '0 4px 12px rgba(40,167,69,0.15)' : 'none',
                borderRadius: 12
              }}
            >
              <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>{getVehicleIcon(v.label, isSelected)}</div>
              <div style={{ fontWeight: 800, fontSize: 14, color: isSelected ? 'var(--primary-accent)' : 'var(--text-main)' }}>
                {v.label}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                {v.eta} away
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main)' }}>
                ₹{v.estimatedTotal.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
