import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

// ─── FALLBACK REGISTRY (shown if API is unreachable) ─────────────────────────
const FALLBACK_REGISTRY = {
  coreRides: {
    label: 'Core Rides', icon: '🚖',
    description: 'Our full fleet of vehicles, ready for any journey.',
    color: '#28a745',
    items: [
      { id: 'basic',     name: 'Basic',          emoji: '🚗', desc: 'Affordable city rides for solo or couple travel.', badge: null },
      { id: 'suv',       name: 'SUV',             emoji: '🚐', desc: 'Spacious for families, groups, and extra luggage.', badge: null },
      { id: 'luxurious', name: 'Luxury',          emoji: '🏎️', desc: 'Premium vehicles with professional VIP drivers.', badge: 'Premium' },
      { id: 'moto',      name: 'Moto',            emoji: '🏍️', desc: 'Beat city traffic on a motorcycle — solo only.', badge: 'Fastest' },
      { id: 'auto',      name: 'Auto / Tuk-Tuk',  emoji: '🛺', desc: 'Classic auto for affordable, breezy short hops.', badge: 'Budget' },
      { id: 'ev',        name: 'Electric (EV)',   emoji: '⚡', desc: 'Zero-emission rides — silent and eco-friendly.', badge: 'Eco' },
    ]
  },
  bookingModels: {
    label: 'Booking Models', icon: '📋',
    description: 'Flexible ways to plan and book your perfect ride.',
    color: '#6366f1',
    items: [
      { id: 'book-later', name: 'Book for Later', emoji: '📅', desc: 'Schedule a ride up to 7 days in advance.', badge: 'Smart' },
      { id: 'rentals',    name: 'Rentals',        emoji: '🔑', desc: 'Hire a car and driver for 1–12 hours.', badge: 'Flexible' },
    ]
  },
  mappingTools: {
    label: 'Mapping & Navigation', icon: '🗺️',
    description: 'Intelligent location tools that make booking seamless.',
    color: '#f59e0b',
    items: [
      { id: 'autocomplete', name: 'Smart Autocomplete', emoji: '🔍', desc: 'Finds your address as you type via Google Places.', badge: 'AI-Powered' },
      { id: 'pin-drop',     name: 'Map Pin Drop',       emoji: '📌', desc: "Can't find your address? Drop a pin on the live map.", badge: 'Interactive' },
    ]
  }
};

// ─── BADGE COLOR MAP ──────────────────────────────────────────────────────────
const BADGE_COLORS = {
  Premium:     { bg: 'rgba(99,102,241,0.12)', text: '#6366f1' },
  Fastest:     { bg: 'rgba(239,68,68,0.12)',  text: '#ef4444' },
  Budget:      { bg: 'rgba(34,197,94,0.12)',  text: '#16a34a' },
  Eco:         { bg: 'rgba(20,184,166,0.12)', text: '#0d9488' },
  Smart:       { bg: 'rgba(99,102,241,0.12)', text: '#6366f1' },
  Flexible:    { bg: 'rgba(245,158,11,0.12)', text: '#d97706' },
  'AI-Powered':{ bg: 'rgba(168,85,247,0.12)', text: '#9333ea' },
  Interactive: { bg: 'rgba(59,130,246,0.12)', text: '#2563eb' },
};

// ─── SERVICE CARD ─────────────────────────────────────────────────────────────
function ServiceCard({ item, categoryColor, onBook }) {
  const [hovered, setHovered] = useState(false);
  const badgeStyle = item.badge ? BADGE_COLORS[item.badge] : null;

  return (
    <div
      id={`service-card-${item.id}`}
      className="premium-glass"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '28px 24px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        borderTop: hovered ? `3px solid ${categoryColor}` : '3px solid transparent',
        transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
        transform: hovered ? 'translateY(-5px)' : 'none',
      }}
      onClick={() => onBook(item)}
      role="button"
      tabIndex={0}
      aria-label={`Select ${item.name}`}
      onKeyDown={e => e.key === 'Enter' && onBook(item)}
    >
      {/* Glow blob on hover */}
      <div style={{
        position: 'absolute', top: -30, right: -30,
        width: 100, height: 100, borderRadius: '50%',
        background: categoryColor,
        opacity: hovered ? 0.08 : 0,
        transition: 'opacity 0.3s ease',
        pointerEvents: 'none'
      }} />

      {/* Badge */}
      {item.badge && badgeStyle && (
        <div style={{
          position: 'absolute', top: 14, right: 14,
          background: badgeStyle.bg, color: badgeStyle.text,
          fontSize: 10, fontWeight: 800, padding: '3px 10px',
          borderRadius: 999, letterSpacing: '0.5px', textTransform: 'uppercase'
        }}>
          {item.badge}
        </div>
      )}

      {/* Icon */}
      <div style={{
        fontSize: 44, marginBottom: 14, lineHeight: 1,
        filter: hovered ? `drop-shadow(0 4px 12px ${categoryColor}55)` : 'none',
        transition: 'filter 0.3s ease',
        display: 'inline-block'
      }}>
        {item.emoji}
      </div>

      {/* Name */}
      <div style={{
        fontSize: 17, fontWeight: 800, marginBottom: 8,
        color: hovered ? categoryColor : 'var(--text-main)',
        transition: 'color 0.2s'
      }}>
        {item.name}
      </div>

      {/* Description */}
      <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 18 }}>
        {item.desc}
      </div>

      {/* CTA */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 13, fontWeight: 700,
        color: categoryColor,
        opacity: hovered ? 1 : 0.6,
        transition: 'opacity 0.2s'
      }}>
        Book Now <span style={{ transform: hovered ? 'translateX(4px)' : 'none', display: 'inline-block', transition: 'transform 0.2s' }}>→</span>
      </div>
    </div>
  );
}

// ─── CATEGORY SECTION ─────────────────────────────────────────────────────────
function CategorySection({ categoryKey, category, onBook }) {
  return (
    <section
      id={`category-${categoryKey}`}
      style={{ marginBottom: 72 }}
    >
      {/* Category Header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16, marginBottom: 32
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: `${category.color}18`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24
            }}>
              {category.icon}
            </div>
            <div>
              <h2 style={{
                fontSize: 24, fontWeight: 900, margin: 0,
                color: 'var(--text-main)'
              }}>
                {category.label}
              </h2>
              <div style={{
                width: 40, height: 3, borderRadius: 2,
                background: category.color, marginTop: 6
              }} />
            </div>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 0 60px' }}>
            {category.description}
          </p>
        </div>

        <div style={{
          background: `${category.color}18`,
          color: category.color,
          padding: '6px 16px', borderRadius: 999, fontSize: 13, fontWeight: 700,
          whiteSpace: 'nowrap', alignSelf: 'center'
        }}>
          {category.items.length} {category.items.length === 1 ? 'Service' : 'Services'}
        </div>
      </div>

      {/* Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 20
      }}>
        {category.items.map(item => (
          <ServiceCard
            key={item.id}
            item={item}
            categoryColor={category.color}
            onBook={onBook}
          />
        ))}
      </div>
    </section>
  );
}

// ─── SKELETON ─────────────────────────────────────────────────────────────────
function SkeletonSection() {
  return (
    <div style={{ marginBottom: 64 }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 28 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--card-border)', animation: 'pulse 1.5s infinite' }} />
        <div>
          <div style={{ width: 160, height: 22, borderRadius: 6, background: 'var(--card-border)', marginBottom: 8, animation: 'pulse 1.5s infinite' }} />
          <div style={{ width: 40, height: 3, borderRadius: 2, background: 'var(--card-border)' }} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
        {[1,2,3].map(i => (
          <div key={i} className="premium-glass" style={{ padding: 28, animation: 'pulse 1.5s infinite' }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: 'var(--card-border)', marginBottom: 14 }} />
            <div style={{ height: 18, borderRadius: 6, background: 'var(--card-border)', marginBottom: 10 }} />
            <div style={{ height: 14, borderRadius: 5, background: 'var(--card-border)', width: '75%' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function Services() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const token = (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));

  const [registry, setRegistry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  // ── Fetch registry from backend ──
  useEffect(() => {
    const fetchRegistry = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:5000/api/services/registry');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setRegistry(data);
      } catch (err) {
        console.warn('Using fallback service registry:', err.message);
        setRegistry(FALLBACK_REGISTRY);
        setError('Showing cached data — live sync unavailable.');
      } finally {
        setLoading(false);
      }
    };
    fetchRegistry();
  }, []);

  // ── Book handler ──
  const handleBook = (item) => {
    if (!token) {
      navigate('/login');
      return;
    }
    navigate('/book-ride');
  };

  // ── Total service count ──
  const totalCount = registry
    ? Object.values(registry).reduce((sum, cat) => sum + cat.items.length, 0)
    : 0;

  // ── Determine categories to show based on filter ──
  const visibleEntries = registry
    ? Object.entries(registry).filter(([key]) => activeFilter === 'all' || activeFilter === key)
    : [];

  const FILTER_OPTIONS = [
    { id: 'all', label: '🚘 All Services' },
    { id: 'coreRides', label: '🚖 Core Rides' },
    { id: 'bookingModels', label: '📋 Booking Models' },
    { id: 'mappingTools', label: '🗺️ Mapping Tools' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', paddingTop: 80 }}>

      {/* ─── PAGE HERO ─────────────────────────────────────────────────────── */}
      <div style={{
        background: 'var(--hero-bg)',
        padding: '60px 40px 56px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
          width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(40,167,69,0.1) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div className="section-badge" style={{ position: 'relative', zIndex: 1 }}>
          🚀 Platform Features
        </div>
        <h1 className="section-title" style={{ position: 'relative', zIndex: 1, margin: '12px auto 16px' }}>
          Everything You Need to Ride
        </h1>
        <p style={{
          fontSize: 17, color: 'var(--text-muted)', maxWidth: 520,
          margin: '0 auto 32px', lineHeight: 1.75, position: 'relative', zIndex: 1
        }}>
          From motorcycle sprints to luxury airport transfers — Ucab's complete service catalogue is built for every journey and every rider.
        </p>

        {/* Summary Chips */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          {!loading && registry && Object.values(registry).map(cat => (
            <div key={cat.label} style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              borderRadius: 999, padding: '7px 16px',
              fontSize: 13, fontWeight: 600, color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', gap: 7
            }}>
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span style={{
                background: 'var(--badge-bg)', color: 'var(--badge-text)',
                borderRadius: 999, padding: '1px 8px', fontSize: 11, fontWeight: 800
              }}>
                {cat.items.length}
              </span>
            </div>
          ))}
          {!loading && (
            <div style={{
              background: 'var(--primary-accent)', color: 'var(--primary-text)',
              borderRadius: 999, padding: '7px 18px',
              fontSize: 13, fontWeight: 800
            }}>
              {totalCount} Total Services
            </div>
          )}
        </div>
      </div>

      {/* ─── FILTER BAR ────────────────────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 68, zIndex: 100,
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--card-border)',
        padding: '14px 40px',
        display: 'flex', gap: 8, overflowX: 'auto'
      }}>
        {FILTER_OPTIONS.map(f => (
          <button
            key={f.id}
            id={`filter-${f.id}`}
            onClick={() => setActiveFilter(f.id)}
            style={{
              padding: '8px 18px', borderRadius: 999, whiteSpace: 'nowrap',
              border: activeFilter === f.id
                ? '2px solid var(--primary-accent)'
                : '1px solid var(--card-border)',
              background: activeFilter === f.id ? 'var(--primary-accent)' : 'var(--card-bg)',
              color: activeFilter === f.id ? 'var(--primary-text)' : 'var(--text-muted)',
              fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* ─── MAIN CONTENT ───────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 40px 80px' }}>

        {/* Error notice */}
        {error && (
          <div style={{
            marginBottom: 28, padding: '10px 18px', borderRadius: 10,
            background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
            color: 'var(--text-muted)', fontSize: 13
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <>
            <SkeletonSection />
            <SkeletonSection />
            <SkeletonSection />
          </>
        )}

        {/* Category sections */}
        {!loading && visibleEntries.map(([key, category]) => (
          <CategorySection
            key={key}
            categoryKey={key}
            category={category}
            onBook={handleBook}
          />
        ))}

        {/* ─── CTA BANNER ─── */}
        {!loading && (
          <div style={{
            marginTop: 16,
            background: 'var(--stat-bg)',
            borderRadius: 24, padding: '48px 40px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 24, textAlign: 'left'
          }}>
            <div>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🎯</div>
              <h3 style={{ fontSize: 26, fontWeight: 900, margin: '0 0 10px', color: '#fff' }}>
                Ready to Ride?
              </h3>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', margin: 0, maxWidth: 400 }}>
                All {totalCount} services are available right now. Book in seconds, ride in minutes.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                id="services-book-now-btn"
                onClick={() => token ? navigate('/book-ride') : navigate('/login')}
                style={{
                  padding: '14px 28px', borderRadius: 12,
                  background: '#fff',
                  color: '#1a1a2e',
                  border: 'none', fontWeight: 800, fontSize: 15, cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                }}
              >
                🚀 Book a Ride
              </button>
              <Link
                to="/"
                style={{
                  padding: '14px 28px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.15)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.3)',
                  fontWeight: 700, fontSize: 15, display: 'inline-block'
                }}
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Pulse animation */}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }`}</style>
    </div>
  );
}
