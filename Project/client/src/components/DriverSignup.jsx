import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// ─── LOGO ─────────────────────────────────────────────────────────────────────
let logoSrc = null;
try { logoSrc = new URL('../assets/logo-01.png', import.meta.url).href; } catch (_) {}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.dl-root {
  font-family: 'Inter', sans-serif;
  min-height: 100vh; width: 100vw;
  background: #050505; color: #fff;
  display: flex; overflow: hidden; position: relative;
}

/* Background */
.dl-bg {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background:
    radial-gradient(ellipse 60% 50% at 20% 50%, rgba(34,197,94,0.08) 0%, transparent 70%),
    radial-gradient(ellipse 50% 60% at 80% 30%, rgba(255,210,31,0.06) 0%, transparent 70%);
}
.dl-grid {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background-image:
    linear-gradient(rgba(255,255,255,.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.02) 1px, transparent 1px);
  background-size: 48px 48px;
}

/* LEFT */
.dl-left {
  flex: 1; display: flex; flex-direction: column; justify-content: space-between;
  padding: 40px 52px; position: relative; z-index: 1;
  border-right: 1px solid rgba(255,255,255,0.05);
}
.dl-brand { display: flex; align-items: center; gap: 10px; }
.dl-brand img { width: 38px; height: 38px; object-fit: contain; }
.dl-brand-name { font-size: 24px; font-weight: 900; color: #FFD21F; letter-spacing: -0.8px; }
.dl-brand-sub  { font-size: 10px; color: #555; font-weight: 600; }

.dl-hero { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 40px 0; }
.dl-eyebrow {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.2);
  color: #22C55E; font-size: 10px; font-weight: 800;
  padding: 4px 12px; border-radius: 99px; margin-bottom: 18px;
  text-transform: uppercase; letter-spacing: 0.5px; width: fit-content;
}
.dl-title {
  font-size: clamp(32px, 4vw, 52px); font-weight: 900; line-height: 1.1;
  letter-spacing: -1.5px; margin-bottom: 14px;
}
.dl-title span { color: #22C55E; }
.dl-desc { font-size: 15px; color: #666; line-height: 1.7; max-width: 400px; margin-bottom: 36px; }

/* Stats */
.dl-stats { display: flex; gap: 28px; margin-bottom: 40px; }
.dl-stat-val   { font-size: 28px; font-weight: 900; }
.dl-stat-val span { color: #22C55E; }
.dl-stat-label { font-size: 11px; color: #555; font-weight: 600; margin-top: 2px; }

/* Feature list */
.dl-features { display: flex; flex-direction: column; gap: 10px; max-width: 400px; }
.dl-feature {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; border-radius: 12px;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05);
  transition: all 0.2s;
}
.dl-feature:hover { background: rgba(34,197,94,0.06); border-color: rgba(34,197,94,0.15); }
.dl-feature-icon { font-size: 20px; flex-shrink: 0; }
.dl-feature-text h4 { font-size: 12px; font-weight: 800; }
.dl-feature-text p  { font-size: 11px; color: #555; margin-top: 1px; }

.dl-left-footer { font-size: 11px; color: #444; display: flex; gap: 16px; }
.dl-left-footer a { color: #555; text-decoration: none; font-weight: 600; }
.dl-left-footer a:hover { color: #22C55E; }

/* RIGHT */
.dl-right {
  width: 460px; min-width: 460px;
  display: flex; align-items: center; justify-content: center;
  padding: 48px 40px; position: relative; z-index: 1;
  background: rgba(8,8,8,0.7); backdrop-filter: blur(20px);
}
.dl-card { width: 100%; max-width: 360px; animation: dlFadeIn 0.45s ease both; }

/* Badge */
.dl-badge {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.2);
  color: #22C55E; font-size: 9px; font-weight: 800;
  padding: 4px 10px; border-radius: 6px; margin-bottom: 12px;
  text-transform: uppercase; letter-spacing: 0.5px;
}
.dl-card-title { font-size: 26px; font-weight: 900; letter-spacing: -0.5px; margin-bottom: 6px; }
.dl-card-sub   { font-size: 13px; color: #555; font-weight: 500; margin-bottom: 22px; }

/* Info pill */
.dl-info-pill {
  display: flex; align-items: center; gap: 10px;
  background: rgba(34,197,94,0.06); border: 1px solid rgba(34,197,94,0.15);
  border-radius: 11px; padding: 10px 14px; margin-bottom: 22px;
}
.dl-info-icon { font-size: 20px; }
.dl-info-text h5 { font-size: 12px; font-weight: 800; color: #22C55E; }
.dl-info-text p  { font-size: 10px; color: #555; margin-top: 1px; }

/* Fields */
.dl-field { margin-bottom: 14px; }
.dl-label {
  font-size: 10px; font-weight: 700; color: #666; text-transform: uppercase;
  letter-spacing: 0.5px; margin-bottom: 6px; display: block;
}
.dl-input-wrap { position: relative; }
.dl-input-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); font-size: 15px; color: #444; }
.dl-input {
  width: 100%; padding: 12px 12px 12px 40px;
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 11px; color: #fff; font-size: 13px; font-weight: 500;
  font-family: 'Inter', sans-serif; outline: none; transition: all 0.2s;
}
.dl-input:focus {
  border-color: rgba(34,197,94,0.5); background: rgba(34,197,94,0.04);
  box-shadow: 0 0 0 3px rgba(34,197,94,0.08);
}
.dl-input::placeholder { color: #3a3a3a; }
.dl-input.error { border-color: rgba(255,75,75,0.4); }
.dl-eye {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: #555; cursor: pointer; font-size: 16px; padding: 3px;
}
.dl-eye:hover { color: #aaa; }

/* Options */
.dl-options {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;
}
.dl-check-label {
  display: flex; align-items: center; gap: 7px;
  font-size: 12px; font-weight: 600; color: #666; cursor: pointer;
}
.dl-check-label input { width: 14px; height: 14px; accent-color: #22C55E; cursor: pointer; }
.dl-forgot { font-size: 12px; font-weight: 700; color: #22C55E; background: none; border: none; cursor: pointer; font-family: 'Inter',sans-serif; }

/* Error */
.dl-error {
  display: flex; align-items: center; gap: 8px;
  background: rgba(255,75,75,0.1); border: 1px solid rgba(255,75,75,0.25);
  border-radius: 10px; padding: 9px 12px; margin-bottom: 16px;
  font-size: 12px; font-weight: 600; color: #FF4B4B;
  animation: dlShake 0.4s ease;
}

/* Submit */
.dl-submit {
  width: 100%; padding: 13px 0; border-radius: 11px;
  background: #22C55E; color: #000; font-weight: 900; font-size: 14px;
  border: none; cursor: pointer; font-family: 'Inter', sans-serif;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: all 0.2s;
}
.dl-submit:hover:not(:disabled) { background: #16a34a; transform: translateY(-1px); box-shadow: 0 6px 22px rgba(34,197,94,0.3); }
.dl-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
.dl-spinner {
  width: 17px; height: 17px; border: 2px solid rgba(0,0,0,0.25);
  border-top-color: #000; border-radius: 50%;
  animation: dlSpin 0.7s linear infinite;
}

/* Links */
.dl-links { text-align: center; margin-top: 20px; }
.dl-links p { font-size: 12px; color: #555; margin-bottom: 6px; }
.dl-links a { color: #22C55E; font-weight: 700; text-decoration: none; }
.dl-links a:hover { text-decoration: underline; }

.dl-divider { display: flex; align-items: center; gap: 10px; margin: 16px 0 14px; }
.dl-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
.dl-divider-text { font-size: 10px; color: #444; font-weight: 600; }

.dl-portal-link {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 10px 0;
  font-size: 11px; font-weight: 700; color: #666; text-decoration: none;
  transition: all 0.2s; background: rgba(255,255,255,0.03);
}
.dl-portal-link:hover { border-color: rgba(255,210,31,0.25); color: #FFD21F; background: rgba(255,210,31,0.05); }

/* Security */
.dl-security {
  display: flex; align-items: center; justify-content: center; gap: 16px;
  margin-top: 22px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.05);
}
.dl-security-item { font-size: 10px; color: #3a3a3a; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; display: flex; align-items: center; gap: 4px; }

/* Animations */
@keyframes dlFadeIn { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
@keyframes dlSpin   { to { transform: rotate(360deg); } }
@keyframes dlShake  { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)} 40%{transform:translateX(5px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)} }

/* Toast */
.dl-toast {
  position: fixed; bottom: 22px; left: 50%; transform: translateX(-50%);
  background: #0e0e0e; border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px; padding: 11px 20px; font-size: 13px; font-weight: 700;
  box-shadow: 0 8px 32px rgba(0,0,0,0.6); z-index: 9999;
  display: flex; align-items: center; gap: 8px;
  animation: dlFadeIn 0.3s ease; white-space: nowrap;
}

@media (max-width: 860px) {
  .dl-left { display: none; }
  .dl-right { width: 100%; min-width: 0; }
}
`;

export default function DriverSignup() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email,    setEmail]    = useState('driver@ucab.com');
  const [password, setPassword] = useState('password123');
  const [showPwd,  setShowPwd]  = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [toast,    setToast]    = useState(null);

  const showToast = (msg, color = '#22C55E') => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/login-driver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (res.ok && data.user?.role === 'Driver') {
        login(data.token, data.user);
        showToast('✅ Access granted. Loading dispatch terminal…');
        setTimeout(() => navigate('/driver'), 900);
      } else {
        setError(data.error || 'Unauthorized. Driver credentials required.');
      }
    } catch (_) {
      setError('Cannot reach server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="dl-root">
        <div className="dl-bg" />
        <div className="dl-grid" />

        {/* ══ LEFT ══ */}
        <div className="dl-left">
          <div className="dl-brand">
            {logoSrc ? <img src={logoSrc} alt="ucab" /> : <span style={{ fontSize: 28 }}>🚕</span>}
            <div>
              <div className="dl-brand-name">ucab</div>
              <div className="dl-brand-sub">Driver Operations</div>
            </div>
          </div>

          <div className="dl-hero">
            <div className="dl-eyebrow">🚕 Driver Portal</div>
            <h1 className="dl-title">Drive.<br /><span>Earn. Thrive.</span></h1>
            <p className="dl-desc">
              Join thousands of verified drivers earning with Ucab. Flexible hours, instant payments, and full support — every single day.
            </p>

            <div className="dl-stats">
              <div>
                <div className="dl-stat-val">₹24k<span>+</span></div>
                <div className="dl-stat-label">Avg. Monthly Earn</div>
              </div>
              <div>
                <div className="dl-stat-val">256<span>+</span></div>
                <div className="dl-stat-label">Active Drivers</div>
              </div>
              <div>
                <div className="dl-stat-val">4.8<span>★</span></div>
                <div className="dl-stat-label">Avg. Driver Rating</div>
              </div>
            </div>

            <div className="dl-features">
              {[
                { icon: '💸', title: 'Instant Payouts',         desc: 'Withdraw your earnings any time, instantly' },
                { icon: '📍', title: 'Smart Trip Matching',     desc: 'AI-powered matching for maximum efficiency' },
                { icon: '🛡️', title: 'Safety First',            desc: 'SOS, live tracking & emergency support 24/7' },
              ].map(f => (
                <div key={f.title} className="dl-feature">
                  <div className="dl-feature-icon">{f.icon}</div>
                  <div className="dl-feature-text">
                    <h4>{f.title}</h4>
                    <p>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="dl-left-footer">
            <span>© 2025 UCAB</span>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Support</a>
          </div>
        </div>

        {/* ══ RIGHT ══ */}
        <div className="dl-right">
          <div className="dl-card">
            <div className="dl-badge">🚕 Driver Access</div>
            <h2 className="dl-card-title">Driver Sign In</h2>
            <p className="dl-card-sub">Access your dispatch terminal and manage your trips.</p>

            <div className="dl-info-pill">
              <div className="dl-info-icon">🟢</div>
              <div className="dl-info-text">
                <h5>Dispatch Terminal</h5>
                <p>Real-time rides, earnings & live trip tracking</p>
              </div>
            </div>

            {error && (
              <div className="dl-error">⚠️ {error}</div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="dl-field">
                <label className="dl-label">Driver Email</label>
                <div className="dl-input-wrap">
                  <span className="dl-input-icon">✉️</span>
                  <input
                    type="email"
                    className={`dl-input${error ? ' error' : ''}`}
                    placeholder="driver@ucab.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    autoComplete="email"
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div className="dl-field">
                <label className="dl-label">Password</label>
                <div className="dl-input-wrap">
                  <span className="dl-input-icon">🔑</span>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    className={`dl-input${error ? ' error' : ''}`}
                    placeholder="••••••••••"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError(''); }}
                    autoComplete="current-password"
                    required
                  />
                  <button type="button" className="dl-eye" onClick={() => setShowPwd(p => !p)} tabIndex={-1}>
                    {showPwd ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="dl-options">
                <label className="dl-check-label">
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                  Keep me signed in
                </label>
                <button type="button" className="dl-forgot">Forgot password?</button>
              </div>

              <button type="submit" className="dl-submit" disabled={loading}>
                {loading
                  ? <><div className="dl-spinner" /> Authenticating…</>
                  : <>Access Dispatch Terminal →</>}
              </button>
            </form>

            <div className="dl-links">
              <p>Want to drive for us? <Link to="/driver-register">Apply here</Link></p>
            </div>

            <div className="dl-divider">
              <div className="dl-divider-line" />
              <span className="dl-divider-text">other portals</span>
              <div className="dl-divider-line" />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/login"       className="dl-portal-link" style={{ flex: 1 }}>🧑 Passenger</Link>
              <Link to="/admin-login" className="dl-portal-link" style={{ flex: 1 }}>🛡️ Admin</Link>
            </div>

            <div className="dl-security">
              <div className="dl-security-item">🔒 256-bit SSL</div>
              <div className="dl-security-item">🛡️ Secure</div>
              <div className="dl-security-item">📋 Logged</div>
            </div>
          </div>
        </div>

        {toast && (
          <div className="dl-toast" style={{ borderLeft: `3px solid ${toast.color}` }}>
            {toast.msg}
          </div>
        )}
      </div>
    </>
  );
}
