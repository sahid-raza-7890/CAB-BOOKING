import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, LockKeyhole, CheckCircle } from 'lucide-react';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
.dr-root{font-family:'Inter',sans-serif;min-height:100vh;width:100vw;display:flex;background:#050505;color:#fff;overflow:hidden;}
.dr-input{width:100%;padding:12px 14px 12px 42px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);border-radius:12px;color:#fff;font-size:13px;font-weight:500;font-family:'Inter',sans-serif;outline:none;transition:all 0.2s;}
.dr-input:focus{border-color:rgba(34,197,94,0.5);background:rgba(34,197,94,0.04);box-shadow:0 0 0 3px rgba(34,197,94,0.08);}
.dr-input::placeholder{color:#3a3a3a;}
.dr-input.err{border-color:rgba(255,75,75,0.45);}
.dr-select{width:100%;padding:12px 14px 12px 42px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);border-radius:12px;color:#fff;font-size:13px;font-weight:500;font-family:'Inter',sans-serif;outline:none;transition:all 0.2s;appearance:none;cursor:pointer;}
.dr-select:focus{border-color:rgba(34,197,94,0.5);background:rgba(34,197,94,0.04);box-shadow:0 0 0 3px rgba(34,197,94,0.08);}
.dr-select option{background:#1a1a1a;color:#fff;}
.dr-feat{display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:11px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);transition:all 0.2s;}
.dr-feat:hover{background:rgba(34,197,94,0.05);border-color:rgba(34,197,94,0.12);}
.dr-step{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,0.05);}
.dr-step:last-child{border-bottom:none;}
@keyframes drFade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes drSpin{to{transform:rotate(360deg)}}
@keyframes drShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}
.dr-right{animation:drFade 0.4s ease both;}
.dr-err{animation:drShake 0.4s ease;}
`;

const VEHICLE_TYPES = [
  { val: 'Bike',  label: '🏍️ Bike / Moto' },
  { val: 'Auto',  label: '🛺 Auto Rickshaw' },
  { val: 'Mini',  label: '🚗 Mini Hatchback' },
  { val: 'Sedan', label: '🚕 Premium Sedan' },
  { val: 'SUV',   label: '🚙 Spacious SUV' },
];

export default function DriverRegister() {
  const [userData, setUserData] = useState({
    name: '', email: '', password: '', phone: '',
    vehicleNumber: '', role: 'Driver', vehicleType: 'Sedan',
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [toast,   setToast]   = useState(null);
  const navigate = useNavigate();

  const showToast = (msg, ok) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = e => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    const { name, email, password, phone, vehicleNumber } = userData;
    if (!name.trim() || !email.trim() || !password.trim() || !phone.trim() || !vehicleNumber.trim()) {
      setError('Please fill in all required fields.'); return;
    }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const payload = { ...userData, cabType: userData.vehicleType };
      const res = await fetch('http://localhost:5000/register-driver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('✅ Driver profile created! Redirecting to login…', true);
        setTimeout(() => navigate('/driver-login'), 1500);
      } else {
        setError(data.error || 'Registration failed. Please try again.');
      }
    } catch (_) {
      setError('Cannot reach server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const ACCENT       = '#22C55E';
  const ACCENT_HOVER = '#16a34a';

  return (
    <>
      <style>{CSS}</style>
      <div className="dr-root">

        {/* ══ LEFT PANEL ══ */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          padding: '40px 48px', position: 'relative', overflow: 'hidden',
          borderRight: '1px solid rgba(255,255,255,0.05)',
        }}>
          {/* BG Image */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0,
            backgroundImage: `url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=900&auto=format&fit=crop')`,
            backgroundSize: 'cover', backgroundPosition: 'center',
          }} />
          <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to top, rgba(5,5,5,0.97) 0%, rgba(5,5,5,0.82) 40%, rgba(5,5,5,0.55) 100%)' }} />
          <div style={{ position: 'absolute', top: -100, left: -80, width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.14) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 1, pointerEvents: 'none' }} />

          {/* Brand */}
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🚕</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 900, color: ACCENT, letterSpacing: -0.8 }}>ucab</div>
              <div style={{ fontSize: 11, color: '#e5e7eb', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', marginTop: 2 }}>Driver Operations</div>
            </div>
          </div>

          {/* Hero */}
          <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 0' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: ACCENT, fontSize: 10, fontWeight: 800, padding: '4px 12px', borderRadius: 99, marginBottom: 18, textTransform: 'uppercase', letterSpacing: '0.5px', width: 'fit-content' }}>
              🚕 Partner With Us
            </div>
            <h1 style={{ fontSize: 'clamp(30px, 3.5vw, 50px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: -1.5, marginBottom: 14 }}>
              Start Earning<br /><span style={{ color: ACCENT }}>With Ucab.</span>
            </h1>
            <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7, maxWidth: 400, marginBottom: 32 }}>
              Apply to drive with Ucab and get access to daily rides, instant payouts, real-time dispatch and full operational support.
            </p>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 28, marginBottom: 36 }}>
              {[{ val: '₹24k+', label: 'Avg. Monthly Earn' }, { val: '5 min', label: 'Approval Time' }, { val: '0%', label: 'Commission First Month' }].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: ACCENT }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: '#555', fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Steps */}
            <div style={{ maxWidth: 400, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Application Steps</div>
              {[
                { n: '01', title: 'Submit Application', desc: 'Fill in your details & vehicle info' },
                { n: '02', title: 'Quick Verification',  desc: 'We review your application in minutes' },
                { n: '03', title: 'Start Driving',       desc: 'Go live and start accepting rides' },
              ].map(step => (
                <div key={step.n} className="dr-step">
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: ACCENT, flexShrink: 0 }}>{step.n}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800 }}>{step.title}</div>
                    <div style={{ fontSize: 10, color: '#555', marginTop: 1 }}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Features */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, maxWidth: 400 }}>
              {[
                { icon: '💸', bg: 'rgba(34,197,94,0.1)',  title: 'Instant Daily Payouts',     desc: 'Withdraw earnings anytime to your bank' },
                { icon: '📡', bg: 'rgba(59,130,246,0.1)', title: 'Smart Ride Matching',       desc: 'AI dispatch maximises your earnings' },
              ].map(f => (
                <div key={f.title} className="dr-feat">
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{f.icon}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800 }}>{f.title}</div>
                    <div style={{ fontSize: 10, color: '#555', marginTop: 1 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust badges */}
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: 8 }}>
            {[{ icon: '💰', l: 'Daily Earnings' }, { icon: '🕐', l: 'Flexible Hours' }, { icon: '🎧', l: '24/7 Support' }].map(b => (
              <div key={b.l} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '7px 12px', fontSize: 11, fontWeight: 700 }}>
                {b.icon} {b.l}
              </div>
            ))}
          </div>
        </div>

        {/* ══ RIGHT PANEL ══ */}
        <div style={{ width: 500, minWidth: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 36px', background: 'rgba(8,8,8,0.96)', backdropFilter: 'blur(20px)', overflowY: 'auto' }}>
          <div className="dr-right" style={{ width: '100%', maxWidth: 390 }}>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: ACCENT, fontSize: 9, fontWeight: 800, padding: '4px 10px', borderRadius: 6, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              🚕 Driver Application
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.5, marginBottom: 6 }}>
              Join as a <span style={{ color: ACCENT }}>Driver</span>
            </h2>
            <p style={{ fontSize: 13, color: '#555', marginBottom: 20 }}>Partner with Ucab and start earning today.</p>

            {/* Info pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 11, padding: '10px 14px', marginBottom: 20 }}>
              <span style={{ fontSize: 20 }}>🟢</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: ACCENT }}>0% Commission — First Month</div>
                <div style={{ fontSize: 10, color: '#555', marginTop: 1 }}>Keep 100% of your earnings for 30 days</div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="dr-err" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,75,75,0.1)', border: '1px solid rgba(255,75,75,0.25)', borderRadius: 10, padding: '9px 12px', marginBottom: 16, fontSize: 12, fontWeight: 600, color: '#FF4B4B' }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Two-column row: Name + Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 13 }}>
                {[
                  { name: 'name',  label: 'Full Name',  icon: '👤', type: 'text',  ph: 'John Doe' },
                  { name: 'email', label: 'Email',      icon: '✉️', type: 'email', ph: 'driver@ucab.com' },
                ].map(f => (
                  <div key={f.name}>
                    <label style={{ fontSize: 10, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>{f.label}</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#444' }}>{f.icon}</span>
                      <input type={f.type} name={f.name} value={userData[f.name]} onChange={handleChange} placeholder={f.ph} className="dr-input" required />
                    </div>
                  </div>
                ))}
              </div>

              {/* Phone + Password */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 13 }}>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>Phone</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#444' }}>📱</span>
                    <input type="tel" name="phone" value={userData.phone} onChange={handleChange} placeholder="+91 9876543210" className="dr-input" required />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#444' }}>🔑</span>
                    <input type={showPwd ? 'text' : 'password'} name="password" value={userData.password} onChange={handleChange} placeholder="Min. 6 chars" className="dr-input" required />
                    <button type="button" onClick={() => setShowPwd(p => !p)} tabIndex={-1}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 14 }}>
                      {showPwd ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Vehicle Number + Type */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>License Plate</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#444' }}>🪪</span>
                    <input type="text" name="vehicleNumber" value={userData.vehicleNumber} onChange={handleChange} placeholder="AP 07 AB 1234" className="dr-input" required />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 10, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>Vehicle Type</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#444' }}>🚗</span>
                    <select name="vehicleType" value={userData.vehicleType} onChange={handleChange} className="dr-select" required>
                      {VEHICLE_TYPES.map(v => <option key={v.val} value={v.val}>{v.label}</option>)}
                    </select>
                    <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#444', pointerEvents: 'none', fontSize: 12 }}>▾</span>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: '13px 0', borderRadius: 12, background: ACCENT, color: '#000', fontWeight: 900, fontSize: 14, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Inter',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s', opacity: loading ? 0.7 : 1 }}
                onMouseOver={e => { if (!loading) { e.currentTarget.style.background = ACCENT_HOVER; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 22px rgba(34,197,94,0.3)'; } }}
                onMouseOut={e  => { e.currentTarget.style.background = ACCENT; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {loading
                  ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.25)', borderTopColor: '#000', borderRadius: '50%', animation: 'drSpin 0.7s linear infinite' }} /> Submitting Application…</>
                  : <>Submit Driver Application →</>}
              </button>
            </form>

            <p style={{ fontSize: 12, color: '#555', textAlign: 'center', marginTop: 18 }}>
              Already registered?{' '}
              <Link to="/driver-login" style={{ color: ACCENT, fontWeight: 800, textDecoration: 'none' }}>Sign in here</Link>
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              {[{ icon: Shield, l: '100% Secure' }, { icon: LockKeyhole, l: '256-bit SSL' }, { icon: CheckCircle, l: 'Verified' }].map(s => (
                <div key={s.l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#3a3a3a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  <s.icon size={11} /> {s.l}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.1)', borderLeft: `3px solid ${ACCENT}`, borderRadius: 12, padding: '11px 20px', fontSize: 13, fontWeight: 700, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', animation: 'drFade 0.3s ease' }}>
            {toast.msg}
          </div>
        )}
      </div>
    </>
  );
}
