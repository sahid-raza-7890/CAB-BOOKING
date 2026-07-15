import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// ─── LOGO ─────────────────────────────────────────────────────────────────────
let logoSrc = null;
try { logoSrc = new URL('../assets/logo-01.png', import.meta.url).href; } catch (_) {}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

*,*::before,*::after { box-sizing: border-box; margin: 0; padding: 0; }

.al-root {
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
  width: 100vw;
  background: #050505;
  display: flex;
  color: #fff;
  overflow: hidden;
  position: relative;
}

/* ── ANIMATED BACKGROUND ── */
.al-bg-canvas {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
}
.al-orb {
  position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.18;
}
.al-orb-1 {
  width: 600px; height: 600px;
  background: radial-gradient(circle, #FFD21F, transparent 70%);
  top: -200px; left: -100px;
  animation: orbFloat1 14s ease-in-out infinite;
}
.al-orb-2 {
  width: 500px; height: 500px;
  background: radial-gradient(circle, #3B82F6, transparent 70%);
  bottom: -150px; right: -100px;
  animation: orbFloat2 18s ease-in-out infinite;
}
.al-orb-3 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, #8B5CF6, transparent 70%);
  top: 50%; left: 50%;
  animation: orbFloat3 22s ease-in-out infinite;
}
/* Grid */
.al-grid-overlay {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background-image:
    linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px);
  background-size: 50px 50px;
}

/* ── LEFT PANEL ── */
.al-left {
  flex: 1; display: flex; flex-direction: column; justify-content: space-between;
  padding: 40px 48px;
  position: relative; z-index: 1;
  border-right: 1px solid rgba(255,255,255,0.06);
}
.al-brand { display: flex; align-items: center; gap: 12px; }
.al-brand-logo { width: 40px; height: 40px; object-fit: contain; }
.al-brand-text { font-size: 28px; font-weight: 900; color: #FFD21F; letter-spacing: -1px; }
.al-brand-sub { font-size: 11px; color: #e5e7eb; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin-top: 2px; }

.al-hero { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 40px 0; }
.al-hero-eyebrow {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(255,210,31,0.1); border: 1px solid rgba(255,210,31,0.2);
  color: #FFD21F; font-size: 11px; font-weight: 700;
  padding: 5px 12px; border-radius: 99px; margin-bottom: 20px;
  letter-spacing: 0.5px; text-transform: uppercase;
  width: fit-content;
}
.al-hero-title {
  font-size: clamp(36px, 4vw, 56px); font-weight: 900;
  line-height: 1.1; letter-spacing: -1.5px; margin-bottom: 16px;
}
.al-hero-title span { color: #FFD21F; }
.al-hero-desc { font-size: 15px; color: #666; line-height: 1.7; max-width: 420px; margin-bottom: 40px; }

.al-stats-row { display: flex; gap: 32px; margin-bottom: 48px; }
.al-stat-item { }
.al-stat-val { font-size: 28px; font-weight: 900; color: #fff; }
.al-stat-val span { color: #FFD21F; }
.al-stat-label { font-size: 11px; color: #555; font-weight: 600; margin-top: 2px; }

/* Feature cards */
.al-features { display: flex; flex-direction: column; gap: 10px; max-width: 420px; }
.al-feature-card {
  display: flex; align-items: center; gap: 14px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px; padding: 14px 16px;
  transition: all 0.2s;
}
.al-feature-card:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,210,31,0.15); }
.al-feature-icon {
  width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; font-size: 18px;
}
.al-feature-text h4 { font-size: 13px; font-weight: 800; margin-bottom: 2px; }
.al-feature-text p  { font-size: 11px; color: #555; line-height: 1.5; }

.al-left-footer {
  font-size: 11px; color: #444;
  display: flex; align-items: center; gap: 16px;
}
.al-left-footer a { color: #555; text-decoration: none; font-weight: 600; }
.al-left-footer a:hover { color: #FFD21F; }

/* ── RIGHT PANEL ── */
.al-right {
  width: 480px; min-width: 480px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 48px 40px;
  position: relative; z-index: 1;
  background: rgba(10,10,10,0.6);
  backdrop-filter: blur(24px);
}

.al-form-card {
  width: 100%; max-width: 380px;
}

.al-form-header { margin-bottom: 28px; }
.al-form-badge {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(255,75,75,0.1); border: 1px solid rgba(255,75,75,0.2);
  color: #FF4B4B; font-size: 10px; font-weight: 800;
  padding: 4px 10px; border-radius: 6px; margin-bottom: 14px;
  text-transform: uppercase; letter-spacing: 0.5px;
}
.al-form-title { font-size: 26px; font-weight: 900; letter-spacing: -0.5px; margin-bottom: 6px; }
.al-form-sub   { font-size: 13px; color: #555; font-weight: 500; }

/* Admin pill badge */
.al-admin-pill {
  display: flex; align-items: center; gap: 8px;
  background: rgba(255,210,31,0.07); border: 1px solid rgba(255,210,31,0.15);
  border-radius: 12px; padding: 10px 14px; margin-bottom: 24px;
}
.al-admin-pill-icon { font-size: 20px; flex-shrink: 0; }
.al-admin-pill-text h5 { font-size: 12px; font-weight: 800; color: #FFD21F; }
.al-admin-pill-text p  { font-size: 10px; color: #555; margin-top: 1px; }

/* Form fields */
.al-field { margin-bottom: 16px; }
.al-field-label {
  font-size: 11px; font-weight: 700; color: #777;
  text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; display: block;
}
.al-field-wrap { position: relative; }
.al-field-icon {
  position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
  font-size: 15px; color: #555; pointer-events: none; z-index: 1;
}
.al-field-input {
  width: 100%; padding: 13px 14px 13px 42px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px; color: #fff; font-size: 13px; font-weight: 500;
  font-family: 'Inter', sans-serif; outline: none;
  transition: all 0.2s;
}
.al-field-input:focus {
  border-color: rgba(255,210,31,0.5);
  background: rgba(255,210,31,0.04);
  box-shadow: 0 0 0 3px rgba(255,210,31,0.08);
}
.al-field-input::placeholder { color: #444; }
.al-field-input.error { border-color: rgba(255,75,75,0.5); }
.al-eye-btn {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: #555; cursor: pointer; font-size: 16px; padding: 4px;
}
.al-eye-btn:hover { color: #aaa; }

/* Remember + Forgot */
.al-options {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px;
}
.al-checkbox-label {
  display: flex; align-items: center; gap: 8px; cursor: pointer;
  font-size: 12px; font-weight: 600; color: #666;
}
.al-checkbox-label input[type=checkbox] {
  width: 15px; height: 15px; accent-color: #FFD21F; cursor: pointer;
}
.al-forgot { font-size: 12px; font-weight: 700; color: #FFD21F; background: none; border: none; cursor: pointer; font-family: 'Inter',sans-serif; }
.al-forgot:hover { text-decoration: underline; }

/* Submit button */
.al-submit-btn {
  width: 100%; padding: 14px 0; border-radius: 12px;
  background: #FFD21F; color: #000; font-weight: 900; font-size: 15px;
  border: none; cursor: pointer; font-family: 'Inter',sans-serif;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: all 0.2s; position: relative; overflow: hidden;
  letter-spacing: -0.2px;
}
.al-submit-btn:hover:not(:disabled) { background: #e6c200; transform: translateY(-1px); box-shadow: 0 6px 24px rgba(255,210,31,0.35); }
.al-submit-btn:active:not(:disabled) { transform: translateY(0); }
.al-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.al-submit-btn .al-spinner {
  width: 18px; height: 18px; border: 2px solid rgba(0,0,0,0.3);
  border-top-color: #000; border-radius: 50%;
  animation: alSpin 0.7s linear infinite;
}

/* Error banner */
.al-error-banner {
  display: flex; align-items: center; gap: 8px;
  background: rgba(255,75,75,0.1); border: 1px solid rgba(255,75,75,0.25);
  border-radius: 10px; padding: 10px 14px; margin-bottom: 18px;
  font-size: 12px; font-weight: 600; color: #FF4B4B;
  animation: alShake 0.4s ease;
}

/* Security footer */
.al-security {
  display: flex; align-items: center; justify-content: center; gap: 20px;
  margin-top: 28px; padding-top: 20px;
  border-top: 1px solid rgba(255,255,255,0.05);
}
.al-security-item {
  display: flex; align-items: center; gap: 5px;
  font-size: 10px; color: #444; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px;
}

/* Version badge */
.al-version {
  margin-top: 20px; text-align: center;
  font-size: 10px; color: #333; font-weight: 600;
}

/* ── ANIMATIONS ── */
@keyframes orbFloat1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(60px,-40px) scale(1.05)} 66%{transform:translate(-30px,30px) scale(0.95)} }
@keyframes orbFloat2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-50px,30px) scale(1.1)} }
@keyframes orbFloat3 { 0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(-50%,-50%) scale(1.2)} }
@keyframes alSpin { to { transform: rotate(360deg); } }
@keyframes alShake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
@keyframes alFadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
.al-form-card { animation: alFadeIn 0.5s ease both; }

/* Toast */
.al-toast {
  position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
  background: #111; border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px; padding: 12px 20px;
  font-size: 13px; font-weight: 700;
  box-shadow: 0 8px 32px rgba(0,0,0,0.6);
  z-index: 9999; display: flex; align-items: center; gap: 8px;
  animation: alFadeIn 0.3s ease;
  white-space: nowrap;
}

/* Responsive: hide left panel on small screens */
@media (max-width: 900px) {
  .al-left { display: none; }
  .al-right { width: 100%; min-width: 0; }
}
`;

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function AdminLogin() {
  const navigate  = useNavigate();
  const { login } = useAuth();

  const [email,    setEmail]    = useState('admin@ucab.com');
  const [password, setPassword] = useState('admin123');
  const [showPwd,  setShowPwd]  = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [toast,    setToast]    = useState(null);
  // Animated counter
  const [count,    setCount]    = useState({ rides: 0, drivers: 0, revenue: 0 });

  // ── Animated counters on mount ────────────────────────────────────────────
  useEffect(() => {
    const targets = { rides: 1842, drivers: 256, revenue: 126 };
    const duration = 1800;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const t = setInterval(() => {
      step++;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount({
        rides:   Math.round(targets.rides   * ease),
        drivers: Math.round(targets.drivers * ease),
        revenue: Math.round(targets.revenue * ease),
      });
      if (step >= steps) clearInterval(t);
    }, interval);
    return () => clearInterval(t);
  }, []);

  const showToast = (msg, color = '#FFD21F') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Handle Login ─────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter your admin email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/login-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (res.ok) {
        const userRole = data.user?.role;
        if (userRole !== 'Admin') {
          setError('Access denied. This portal is for Admins only.');
          setLoading(false);
          return;
        }
        login(data.token, data.user);
        showToast('✅ Welcome back, ' + (data.user?.name || 'Admin') + '!');
        setTimeout(() => navigate('/admin'), 900);
      } else {
        setError(data.error || 'Invalid credentials. Please try again.');
      }
    } catch (_) {
      setError('Cannot reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <>
      <style>{CSS}</style>
      <div className="al-root">

        {/* Animated background */}
        <div className="al-bg-canvas">
          <div className="al-orb al-orb-1" />
          <div className="al-orb al-orb-2" />
          <div className="al-orb al-orb-3" />
        </div>
        <div className="al-grid-overlay" />

        {/* ══ LEFT PANEL ══ */}
        <div className="al-left">
          {/* Brand */}
          <div className="al-brand">
            {logoSrc
              ? <img src={logoSrc} alt="ucab" className="al-brand-logo" />
              : <span style={{ fontSize: 30 }}>🚕</span>}
            <div>
              <div className="al-brand-text">ucab</div>
              <div className="al-brand-sub">Operations Center</div>
            </div>
          </div>

          {/* Hero */}
          <div className="al-hero">
            <div className="al-hero-eyebrow">
              <span>⚡</span> Admin Operations Portal
            </div>
            <h1 className="al-hero-title">
              Command the<br />
              <span>Entire Platform.</span>
            </h1>
            <p className="al-hero-desc">
              One dashboard to manage rides, drivers, passengers, payments, safety, and analytics — in real time, at scale.
            </p>

            {/* Stats */}
            <div className="al-stats-row">
              <div className="al-stat-item">
                <div className="al-stat-val">{count.rides.toLocaleString()}<span>+</span></div>
                <div className="al-stat-label">Rides Today</div>
              </div>
              <div className="al-stat-item">
                <div className="al-stat-val">{count.drivers}<span>+</span></div>
                <div className="al-stat-label">Active Drivers</div>
              </div>
              <div className="al-stat-item">
                <div className="al-stat-val">₹{count.revenue}k<span>+</span></div>
                <div className="al-stat-label">Revenue Today</div>
              </div>
            </div>

            {/* Feature cards */}
            <div className="al-features">
              {[
                { icon: '🗺️', bg: 'rgba(59,130,246,0.1)',  title: 'Live City Map',        desc: 'Track every driver, ride, and SOS in real time' },
                { icon: '📊', bg: 'rgba(139,92,246,0.1)', title: 'Deep Analytics',        desc: 'Revenue, demand zones, peak hours & growth metrics' },
                { icon: '🛡️', bg: 'rgba(255,75,75,0.1)',  title: 'Safety Command Center', desc: 'Monitor SOS alerts, verify drivers & secure every ride' },
              ].map(f => (
                <div key={f.title} className="al-feature-card">
                  <div className="al-feature-icon" style={{ background: f.bg }}>{f.icon}</div>
                  <div className="al-feature-text">
                    <h4>{f.title}</h4>
                    <p>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="al-left-footer">
            <span>© 2025 UCAB</span>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Use</a>
            <a href="#">Support</a>
          </div>
        </div>

        {/* ══ RIGHT PANEL ══ */}
        <div className="al-right">
          <div className="al-form-card">

            {/* Header */}
            <div className="al-form-header">
              <div className="al-form-badge">🔒 Restricted Access</div>
              <h2 className="al-form-title">Admin Sign In</h2>
              <p className="al-form-sub">Enter your administrator credentials to continue.</p>
            </div>

            {/* Admin identity pill */}
            <div className="al-admin-pill">
              <div className="al-admin-pill-icon">🛡️</div>
              <div className="al-admin-pill-text">
                <h5>Operations Center Access</h5>
                <p>Authorized personnel only — all sessions are logged</p>
                <div style={{ marginTop: '8px', fontSize: '10px', color: 'rgba(255,210,31,0.85)', background: 'rgba(255,210,31,0.06)', padding: '6px 10px', borderRadius: '6px', border: '1px dashed rgba(255,210,31,0.2)' }}>
                  🔑 <strong>Test Credentials:</strong> admin@ucab.com / admin123
                </div>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="al-error-banner">
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div className="al-field">
                <label className="al-field-label">Admin Email</label>
                <div className="al-field-wrap">
                  <span className="al-field-icon">✉️</span>
                  <input
                    id="admin-email"
                    type="email"
                    className={`al-field-input${error ? ' error' : ''}`}
                    placeholder="admin@ucab.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    autoComplete="email"
                    autoFocus
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="al-field">
                <label className="al-field-label">Password</label>
                <div className="al-field-wrap">
                  <span className="al-field-icon">🔑</span>
                  <input
                    id="admin-password"
                    type={showPwd ? 'text' : 'password'}
                    className={`al-field-input${error ? ' error' : ''}`}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    autoComplete="current-password"
                    required
                  />
                  <button type="button" className="al-eye-btn" onClick={() => setShowPwd(p => !p)} tabIndex={-1}>
                    {showPwd ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="al-options">
                <label className="al-checkbox-label">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                  />
                  Keep me signed in
                </label>
                <button type="button" className="al-forgot">Forgot password?</button>
              </div>

              {/* Submit */}
              <button type="submit" className="al-submit-btn" disabled={loading}>
                {loading
                  ? <><div className="al-spinner" /> Verifying…</>
                  : <>Sign In to Dashboard <span style={{ fontSize: 16 }}>→</span></>}
              </button>
            </form>

            {/* Security row */}
            <div className="al-security">
              {[
                { icon: '🔒', label: '256-bit SSL' },
                { icon: '🛡️', label: '100% Secure' },
                { icon: '📋', label: 'Audit Logged' },
              ].map(s => (
                <div key={s.label} className="al-security-item">
                  <span>{s.icon}</span> {s.label}
                </div>
              ))}
            </div>

            {/* Portal links */}
            <div style={{ marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16 }}>
              <div style={{ fontSize: 10, color: '#333', fontWeight: 600, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 10 }}>Other Portals</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <a href="/login" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 0', fontSize: 11, fontWeight: 700, color: '#555', textDecoration: 'none', background: 'rgba(255,255,255,0.03)', transition: 'all 0.2s' }}
                  onMouseOver={e => { e.currentTarget.style.color='#FFD21F'; e.currentTarget.style.borderColor='rgba(255,210,31,0.25)'; }}
                  onMouseOut={e  => { e.currentTarget.style.color='#555';    e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; }}
                >🧑 Passenger</a>
                <a href="/driver-login" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 0', fontSize: 11, fontWeight: 700, color: '#555', textDecoration: 'none', background: 'rgba(255,255,255,0.03)', transition: 'all 0.2s' }}
                  onMouseOver={e => { e.currentTarget.style.color='#FFD21F'; e.currentTarget.style.borderColor='rgba(255,210,31,0.25)'; }}
                  onMouseOut={e  => { e.currentTarget.style.color='#555';    e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; }}
                >🚕 Driver</a>
              </div>
            </div>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className="al-toast" style={{ borderLeft: `3px solid ${toast.color}` }}>
            {toast.msg}
          </div>
        )}
      </div>
    </>
  );
}
