import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { CheckCircle, Shield, LockKeyhole } from 'lucide-react';

// ─── GOOGLE / APPLE ICONS ─────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);
const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.6-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.09 2.31-.86 3.65-.72 1.41.15 2.65.74 3.33 1.83-3.16 1.85-2.64 6.2 0 7.36-.67 1.63-1.55 3.04-2.06 3.7zm-4.75-13.6c-.23-2.14 1.62-4.04 3.8-4.18.25 2.33-1.95 4.34-3.8 4.18z"/>
  </svg>
);

// ─── THEME CONFIG ─────────────────────────────────────────────────────────────
const THEMES = {
  passenger: {
    accent:       '#FFD700',
    accentDim:    'rgba(255,215,0,0.12)',
    accentBorder: 'rgba(255,215,0,0.3)',
    accentHover:  '#e6c200',
    badgeBg:      'rgba(255,215,0,0.1)',
    badgeBorder:  'rgba(255,215,0,0.2)',
    badgeColor:   '#FFD700',
    btnText:      '#000',
    endpoint:     'http://localhost:5000/login',
    successRole:  null, // any non-driver
    // Left panel
    eyebrow:      '🧑 Passenger Portal',
    eyebrowColor: '#FFD700',
    title:        ['Every Ride,', 'Every Time.'],
    titleSpan:    1, // index of coloured line
    desc:         'Safe, reliable & affordable rides — book instantly, track in real time, arrive with confidence.',
    stats: [
      { val: '50k+', label: 'Happy Riders' },
      { val: '4.9★', label: 'Avg. Rating' },
      { val: '2 min', label: 'Avg. Pickup' },
    ],
    features: [
      { icon: '🛡️', bg: 'rgba(255,215,0,0.1)',  title: 'Safe & Verified',     desc: 'All drivers background-checked & verified' },
      { icon: '⚡', bg: 'rgba(59,130,246,0.1)',  title: 'Instant Booking',     desc: 'Ride confirmed in under 30 seconds' },
      { icon: '📍', bg: 'rgba(34,197,94,0.1)',   title: 'Live Tracking',       desc: 'Share your journey with trusted contacts' },
    ],
    trust: [
      { icon: '🛡️', label: 'Safe & Secure' },
      { icon: '⚡', label: 'Quick Rides' },
      { icon: '🎧', label: '24/7 Support' },
    ],
    // Right panel
    formBadge:    '🧑 Passenger Access',
    formBadgeBg:  'rgba(255,215,0,0.1)',
    formBadgeClr: '#FFD700',
    formTitle:    ['Welcome', 'Back!'],
    formSub:      'Log in to your account and ride with Ucab.',
    infoBg:       'rgba(255,215,0,0.07)',
    infoBorder:   'rgba(255,215,0,0.15)',
    infoIcon:     '🚖',
    infoTitle:    'Passenger Dashboard',
    infoDesc:     'Book rides, track journeys & manage your wallet',
    infoTitleClr: '#FFD700',
    btnLabel:     'Login',
    placeholder:  'passenger@ucab.com',
    signupLink:   '/register',
    signupLabel:  'Sign up as passenger',
    // Background gradient for left
    leftBg:       'linear-gradient(135deg,#0a0500 0%,#1a0e00 50%,#0a0500 100%)',
    orb1:         'rgba(255,215,0,0.15)',
    orb2:         'rgba(255,165,0,0.08)',
    bgImage:      'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=900&auto=format&fit=crop',
  },
  driver: {
    accent:       '#22C55E',
    accentDim:    'rgba(34,197,94,0.12)',
    accentBorder: 'rgba(34,197,94,0.3)',
    accentHover:  '#16a34a',
    badgeBg:      'rgba(34,197,94,0.1)',
    badgeBorder:  'rgba(34,197,94,0.2)',
    badgeColor:   '#22C55E',
    btnText:      '#000',
    endpoint:     'http://localhost:5000/login-driver',
    successRole:  'Driver',
    // Left panel
    eyebrow:      '🚕 Driver Portal',
    eyebrowColor: '#22C55E',
    title:        ['Drive. Earn.', 'Thrive.'],
    titleSpan:    1,
    desc:         'Join thousands of verified drivers earning daily with Ucab — flexible hours, instant payouts & full operational support.',
    stats: [
      { val: '₹24k+', label: 'Avg. Monthly Earn' },
      { val: '4.8★',  label: 'Avg. Driver Rating' },
      { val: '256+',  label: 'Active Drivers' },
    ],
    features: [
      { icon: '💸', bg: 'rgba(34,197,94,0.1)',  title: 'Instant Payouts',     desc: 'Withdraw your earnings anytime, instantly' },
      { icon: '📡', bg: 'rgba(59,130,246,0.1)', title: 'Smart Trip Matching', desc: 'AI-powered dispatch for maximum efficiency' },
      { icon: '🛡️', bg: 'rgba(239,68,68,0.1)',  title: 'Safety Command',     desc: 'SOS, live tracking & emergency support 24/7' },
    ],
    trust: [
      { icon: '💰', label: 'Daily Earnings' },
      { icon: '🕐', label: 'Flexible Hours' },
      { icon: '🎧', label: '24/7 Support' },
    ],
    // Right panel
    formBadge:    '🚕 Driver Access',
    formBadgeBg:  'rgba(34,197,94,0.1)',
    formBadgeClr: '#22C55E',
    formTitle:    ['Driver', 'Sign In'],
    formSub:      'Access your dispatch terminal and manage your trips.',
    infoBg:       'rgba(34,197,94,0.06)',
    infoBorder:   'rgba(34,197,94,0.15)',
    infoIcon:     '🟢',
    infoTitle:    'Dispatch Terminal',
    infoDesc:     'Real-time rides, earnings & live trip tracking',
    infoTitleClr: '#22C55E',
    btnLabel:     'Access Terminal',
    placeholder:  'driver@ucab.com',
    signupLink:   '/driver-register',
    signupLabel:  'Apply as a driver',
    // Background gradient for left
    leftBg:       'linear-gradient(135deg,#00080a 0%,#001a0e 50%,#00080a 100%)',
    orb1:         'rgba(34,197,94,0.15)',
    orb2:         'rgba(16,185,129,0.08)',
    bgImage:      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=900&auto=format&fit=crop',
  },
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function Login() {
  const [role,     setRole]     = useState('passenger');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [toast,    setToast]    = useState(null);

  const navigate = useNavigate();
  const { login } = useAuth();
  const t = THEMES[role];

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRoleSwitch = (newRole) => {
    setRole(newRole);
    if (newRole === 'driver') {
      setEmail('driver@ucab.com');
      setPassword('password123');
    } else {
      setEmail('');
      setPassword('');
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const res  = await fetch(t.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (res.ok) {
        const userRole = data.user?.role || 'Passenger';
        if (role === 'driver' && userRole !== 'Driver') {
          setError('Unauthorized. Driver credentials required.');
          setLoading(false); return;
        }
        if (role === 'passenger' && userRole !== 'Passenger') {
          setError(`Access denied. Please use the ${userRole} Portal.`);
          setLoading(false); return;
        }
        login(data.token, data.user);
        showToast('✅ Login successful! Redirecting…');
        setTimeout(() => {
          if (userRole === 'Admin')  navigate('/admin');
          else if (userRole === 'Driver') navigate('/driver');
          else navigate('/');
        }, 900);
      } else {
        setError(data.error || 'Invalid credentials. Please try again.');
      }
    } catch (_) {
      setError('Cannot reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', width: '100vw', display: 'flex',
      fontFamily: "'Inter', sans-serif", overflow: 'hidden',
      background: '#050505', color: '#fff', position: 'relative',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        .lg-input { width:100%; padding:13px 14px 13px 42px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09); border-radius:12px; color:#fff; font-size:13px; font-weight:500; font-family:'Inter',sans-serif; outline:none; transition:all 0.2s; }
        .lg-input:focus { background:rgba(255,255,255,0.07); }
        .lg-input::placeholder { color:#3a3a3a; }
        .lg-input.err { border-color:rgba(255,75,75,0.45); }
        .lg-social { flex:1; padding:11px 0; border-radius:11px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.2s; font-family:'Inter',sans-serif; color:#888; }
        .lg-social:hover { background:rgba(255,255,255,0.08); border-color:rgba(255,255,255,0.15); }
        .lg-feat { display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); transition:all 0.2s; }
        .lg-trust { display:flex; align-items:center; gap:8px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.07); border-radius:10px; padding:8px 14px; font-size:12px; font-weight:700; }
        @keyframes lgFade { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes lgShake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)} 40%{transform:translateX(5px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} }
        @keyframes lgSpin { to{transform:rotate(360deg)} }
        .lg-right-inner { animation: lgFade 0.35s ease both; }
        .lg-err { animation: lgShake 0.4s ease; }
      `}</style>

      {/* ══ LEFT PANEL ══ */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        padding: '40px 48px', position: 'relative', overflow: 'hidden',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        transition: 'all 0.5s ease',
      }}>
        {/* Background image */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `url(${t.bgImage})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          transition: 'all 0.5s ease',
        }} />
        {/* Overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: `linear-gradient(to top, rgba(5,5,5,0.97) 0%, rgba(5,5,5,0.82) 40%, rgba(5,5,5,0.6) 100%)`,
        }} />
        {/* Colour orb */}
        <div style={{
          position: 'absolute', top: -120, left: -80, width: 500, height: 500,
          borderRadius: '50%', background: `radial-gradient(circle, ${t.orb1} 0%, transparent 70%)`,
          filter: 'blur(60px)', zIndex: 1, transition: 'all 0.5s ease', pointerEvents: 'none',
        }} />

        {/* BRAND */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.4s',
          }}>
            <span style={{ fontSize: 20 }}>{role === 'driver' ? '🚕' : '🚖'}</span>
          </div>
          <div>
            <div style={{ fontSize: 24, fontWeight: 900, color: t.accent, letterSpacing: -0.8, transition: 'color 0.4s' }}>ucab</div>
            <div style={{ fontSize: 11, color: '#e5e7eb', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', marginTop: 2 }}>{role === 'driver' ? 'Driver Operations' : 'Passenger Platform'}</div>
          </div>
        </div>

        {/* HERO */}
        <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 0', animation: 'lgFade 0.4s ease both' }}>
          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: t.badgeBg, border: `1px solid ${t.badgeBorder}`,
            color: t.badgeColor, fontSize: 10, fontWeight: 800,
            padding: '4px 12px', borderRadius: 99, marginBottom: 18,
            textTransform: 'uppercase', letterSpacing: '0.5px', width: 'fit-content',
            transition: 'all 0.4s',
          }}>
            {t.eyebrow}
          </div>

          {/* Title */}
          <h1 style={{ fontSize: 'clamp(32px, 4vw, 54px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: -1.5, marginBottom: 14, transition: 'all 0.3s' }}>
            {t.title.map((line, i) => (
              <React.Fragment key={i}>
                {i === t.titleSpan ? <span style={{ color: t.accent, transition: 'color 0.4s' }}>{line}</span> : line}
                {i < t.title.length - 1 && <br />}
              </React.Fragment>
            ))}
          </h1>
          <p style={{ fontSize: 14, color: '#777', lineHeight: 1.7, maxWidth: 400, marginBottom: 32 }}>{t.desc}</p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 28, marginBottom: 36 }}>
            {t.stats.map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 26, fontWeight: 900, color: t.accent, transition: 'color 0.4s' }}>{s.val}</div>
                <div style={{ fontSize: 10, color: '#555', fontWeight: 600, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 400 }}>
            {t.features.map(f => (
              <div key={f.title} className="lg-feat">
                <div style={{ width: 36, height: 36, borderRadius: 9, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800 }}>{f.title}</div>
                  <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TRUST ROW */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {t.trust.map(tr => (
            <div key={tr.label} className="lg-trust">
              <span>{tr.icon}</span> {tr.label}
            </div>
          ))}
        </div>
      </div>

      {/* ══ RIGHT PANEL ══ */}
      <div style={{
        width: 480, minWidth: 480, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '40px 36px',
        background: 'rgba(8,8,8,0.96)', backdropFilter: 'blur(20px)',
      }}>
        <div key={role} className="lg-right-inner" style={{ width: '100%', maxWidth: 370 }}>

          {/* ROLE TOGGLE */}
          <div style={{
            display: 'flex', background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14, padding: 4, marginBottom: 28, gap: 4,
          }}>
            {['passenger', 'driver'].map(r => (
              <button
                key={r}
                onClick={() => handleRoleSwitch(r)}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
                  cursor: 'pointer', fontSize: 13, fontWeight: 700, transition: 'all 0.25s',
                  fontFamily: "'Inter', sans-serif",
                  background: role === r ? (r === 'passenger' ? '#FFD700' : '#22C55E') : 'transparent',
                  color: role === r ? '#000' : '#666',
                  boxShadow: role === r ? `0 4px 16px ${r === 'passenger' ? 'rgba(255,215,0,0.3)' : 'rgba(34,197,94,0.3)'}` : 'none',
                }}
              >
                {r === 'passenger' ? '🧑 Passenger' : '🚕 Driver'}
              </button>
            ))}
          </div>

          {/* FORM BADGE */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: t.formBadgeBg, border: `1px solid ${t.badgeBorder}`,
            color: t.formBadgeClr, fontSize: 9, fontWeight: 800,
            padding: '4px 10px', borderRadius: 6, marginBottom: 10,
            textTransform: 'uppercase', letterSpacing: '0.5px', transition: 'all 0.4s',
          }}>
            {t.formBadge}
          </div>

          {/* FORM TITLE */}
          <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.5, marginBottom: 6 }}>
            {t.formTitle[0]} <span style={{ color: t.accent, transition: 'color 0.4s' }}>{t.formTitle[1]}</span>
          </h2>
          <p style={{ fontSize: 13, color: '#555', fontWeight: 500, marginBottom: 20 }}>{t.formSub}</p>

          {/* INFO PILL */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: t.infoBg, border: `1px solid ${t.infoBorder}`,
            borderRadius: 11, padding: '10px 14px', marginBottom: 20,
            transition: 'all 0.4s',
          }}>
            <span style={{ fontSize: 20 }}>{t.infoIcon}</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: t.infoTitleClr, transition: 'color 0.4s' }}>{t.infoTitle}</div>
              <div style={{ fontSize: 10, color: '#555', marginTop: 1 }}>{t.infoDesc}</div>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="lg-err" style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,75,75,0.1)', border: '1px solid rgba(255,75,75,0.25)',
              borderRadius: 10, padding: '9px 12px', marginBottom: 16,
              fontSize: 12, fontWeight: 600, color: '#FF4B4B',
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: '#444' }}>✉️</span>
                <input
                  type="email"
                  className={`lg-input${error ? ' err' : ''}`}
                  placeholder={t.placeholder}
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  style={{ borderColor: error ? 'rgba(255,75,75,0.45)' : undefined }}
                  autoFocus
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: '#444' }}>🔑</span>
                <input
                  type={showPwd ? 'text' : 'password'}
                  className={`lg-input${error ? ' err' : ''}`}
                  placeholder="••••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  required
                />
                <button type="button" onClick={() => setShowPwd(p => !p)} tabIndex={-1}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 16, padding: 3 }}>
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 600, color: '#666', cursor: 'pointer' }}>
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                  style={{ width: 14, height: 14, accentColor: t.accent, cursor: 'pointer' }} />
                Remember me
              </label>
              <button type="button" style={{ fontSize: 12, fontWeight: 700, color: t.accent, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Inter',sans-serif", transition: 'color 0.3s' }}>
                Forgot Password?
              </button>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px 0', borderRadius: 12,
              background: t.accent, color: t.btnText, fontWeight: 900, fontSize: 15,
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'Inter',sans-serif",
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.25s', opacity: loading ? 0.7 : 1,
            }}
            onMouseOver={e => { if (!loading) { e.currentTarget.style.background = t.accentHover; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 6px 22px ${t.accentDim}`; } }}
            onMouseOut={e => { e.currentTarget.style.background = t.accent; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              {loading
                ? <><div style={{ width: 17, height: 17, border: '2px solid rgba(0,0,0,0.25)', borderTopColor: '#000', borderRadius: '50%', animation: 'lgSpin 0.7s linear infinite' }} /> Signing in…</>
                : <>{t.btnLabel} →</>}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ fontSize: 11, color: '#444', fontWeight: 600 }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* Social */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
            <button className="lg-social"><GoogleIcon /></button>
            <button className="lg-social"><AppleIcon /></button>
          </div>

          {/* Sign up link */}
          <p style={{ fontSize: 12, color: '#555', fontWeight: 500, textAlign: 'center', marginBottom: 14 }}>
            Don't have an account?{' '}
            <Link to={t.signupLink} style={{ color: t.accent, fontWeight: 800, textDecoration: 'none', transition: 'color 0.3s' }}>
              {t.signupLabel}
            </Link>
          </p>

          {/* Admin Portal */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            <span style={{ fontSize: 10, color: '#333', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px' }}>other portals</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
          </div>
          <Link to="/admin-login" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 0',
            fontSize: 11, fontWeight: 700, color: '#555', textDecoration: 'none',
            background: 'rgba(255,255,255,0.03)', transition: 'all 0.2s',
          }}
          onMouseOver={e => { e.currentTarget.style.color='#FFD700'; e.currentTarget.style.borderColor='rgba(255,215,0,0.25)'; }}
          onMouseOut={e  => { e.currentTarget.style.color='#555';    e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; }}
          >
            🛡️ Admin Portal
          </Link>

          {/* Security */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            {[{ icon: Shield, label: '100% Secure' }, { icon: LockKeyhole, label: '256-bit SSL' }, { icon: CheckCircle, label: 'Privacy' }].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#3a3a3a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                <s.icon size={11} /> {s.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.1)',
          borderLeft: `3px solid ${t.accent}`,
          borderRadius: 12, padding: '11px 20px',
          fontSize: 13, fontWeight: 700, color: '#fff',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)', zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: 8,
          animation: 'lgFade 0.3s ease', whiteSpace: 'nowrap',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Hide left on small screens */}
      <style>{`@media(max-width:860px){.lg-left{display:none!important}}`}</style>
    </div>
  );
}
