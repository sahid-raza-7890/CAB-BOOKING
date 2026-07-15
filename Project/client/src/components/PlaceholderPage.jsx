import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ICON_MAP = {
  'Intercity':  { emoji: '🛣️',  color: '#6366f1' },
  'Rentals':    { emoji: '🔑',  color: '#22C55E' },
  'Schedule':   { emoji: '📅',  color: '#FFD400' },
  'Wallet':     { emoji: '💳',  color: '#a855f7' },
  'Offers':     { emoji: '🎁',  color: '#22C55E' },
  'Help':       { emoji: '❓',  color: '#4f8ef7' },
  'default':    { emoji: '🚧',  color: '#FFD400' },
};

export default function PlaceholderPage({ title = 'Coming Soon' }) {
  const navigate = useNavigate();
  const meta = ICON_MAP[title] || ICON_MAP['default'];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080808',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
      padding: 24,
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap');`}</style>

      <div style={{
        background: '#121212',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 24,
        padding: '56px 48px',
        textAlign: 'center',
        maxWidth: 440,
        width: '100%',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
      }}>
        <div style={{ fontSize: 72, marginBottom: 20 }}>{meta.emoji}</div>

        <h1 style={{
          fontSize: 28, fontWeight: 900, color: '#fff', margin: '0 0 8px',
        }}>{title}</h1>

        <p style={{
          fontSize: 14, color: '#666', marginBottom: 32, lineHeight: 1.6,
        }}>
          This section is <span style={{ color: meta.color, fontWeight: 700 }}>coming soon</span>.<br />
          We're working hard to bring you something great.
        </p>

        <div style={{
          display: 'inline-block',
          padding: '6px 14px',
          borderRadius: 8,
          background: `${meta.color}18`,
          border: `1px solid ${meta.color}40`,
          color: meta.color,
          fontSize: 12,
          fontWeight: 700,
          marginBottom: 32,
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
        }}>
          🚧 Under Construction
        </div>

        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            margin: '0 auto',
            padding: '12px 24px',
            background: '#FFD400',
            color: '#000',
            border: 'none',
            borderRadius: 12,
            fontWeight: 800,
            fontSize: 14,
            cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
            transition: 'all 0.2s',
          }}
          onMouseOver={e => e.currentTarget.style.background = '#e6c200'}
          onMouseOut={e => e.currentTarget.style.background = '#FFD400'}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>
    </div>
  );
}
