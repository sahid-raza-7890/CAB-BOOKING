import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, LockKeyhole, CheckCircle } from 'lucide-react';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
.pr-root{font-family:'Inter',sans-serif;min-height:100vh;width:100vw;display:flex;background:#050505;color:#fff;overflow:hidden;}
.pr-input{width:100%;padding:12px 14px 12px 42px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);border-radius:12px;color:#fff;font-size:13px;font-weight:500;font-family:'Inter',sans-serif;outline:none;transition:all 0.2s;}
.pr-input:focus{border-color:rgba(255,215,0,0.5);background:rgba(255,215,0,0.04);box-shadow:0 0 0 3px rgba(255,215,0,0.08);}
.pr-input::placeholder{color:#3a3a3a;}
.pr-input.err{border-color:rgba(255,75,75,0.45);}
.pr-feat{display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:11px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);transition:all 0.2s;}
.pr-feat:hover{background:rgba(255,215,0,0.05);border-color:rgba(255,215,0,0.12);}
.pr-step{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid rgba(255,255,255,0.05);}
.pr-step:last-child{border-bottom:none;}
@keyframes prFade{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes prSpin{to{transform:rotate(360deg)}}
@keyframes prShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}
.pr-right{animation:prFade 0.4s ease both;}
.pr-err{animation:prShake 0.4s ease;}
`;

export default function Register() {
  const [userData, setUserData] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPwd,  setShowPwd]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [toast,    setToast]    = useState(null);
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
    const { name, email, password } = userData;
    if (!name.trim() || !email.trim() || !password.trim()) { setError('Please fill in all required fields.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const res  = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('✅ Account created! Redirecting to login…', true);
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError(data.error || 'Registration failed. Please try again.');
      }
    } catch (_) {
      setError('Cannot reach server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const ACCENT       = '#FFD700';
  const ACCENT_HOVER = '#e6c200';
  const ACCENT_DIM   = 'rgba(255,215,0,0.12)';

  return (
    <>
      <style>{CSS}</style>
      <div className="pr-root">

        {/* ══ LEFT PANEL ══ */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          padding: '40px 48px', position: 'relative', overflow: 'hidden',
          borderRight: '1px solid rgba(255,255,255,0.05)',
        }}>
          {/* BG Image */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 0,
            backgroundImage: `url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=900&auto=format&fit=crop')`,
            backgroundSize: 'cover', backgroundPosition: 'center',
          }} />
          <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to top, rgba(5,5,5,0.97) 0%, rgba(5,5,5,0.82) 40%, rgba(5,5,5,0.55) 100%)' }} />
          <div style={{ position: 'absolute', top: -100, left: -80, width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,215,0,0.14) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 1, pointerEvents: 'none' }} />

          {/* Brand */}
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🚖</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 900, color: ACCENT, letterSpacing: -0.8 }}>ucab</div>
              <div style={{ fontSize: 11, color: '#e5e7eb', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', marginTop: 2 }}>Passenger Platform</div>
            </div>
          </div>

          {/* Hero */}
          <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 0' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)', color: ACCENT, fontSize: 10, fontWeight: 800, padding: '4px 12px', borderRadius: 99, marginBottom: 18, textTransform: 'uppercase', letterSpacing: '0.5px', width: 'fit-content' }}>
              🧑 Create Your Account
            </div>
            <h1 style={{ fontSize: 'clamp(30px, 3.5vw, 50px)', fontWeight: 900, lineHeight: 1.1, letterSpacing: -1.5, marginBottom: 14 }}>
              Join Thousands of<br /><span style={{ color: ACCENT }}>Happy Riders.</span>
            </h1>
            <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7, maxWidth: 400, marginBottom: 32 }}>
              Sign up for free and get access to instant ride booking, live tracking, wallet, exclusive offers and 24/7 support.
            </p>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 28, marginBottom: 36 }}>
              {[{ val: 'Free', label: 'Sign Up' }, { val: '2 min', label: 'To Get Riding' }, { val: '₹150', label: 'Signup Bonus' }].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: ACCENT }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: '#555', fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Steps */}
            <div style={{ maxWidth: 400, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '14px 16px', marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>How it works</div>
              {[
                { n: '01', title: 'Create Account',   desc: 'Fill in your details in under 2 minutes' },
                { n: '02', title: 'Verify & Login',   desc: 'Confirm your email and sign in' },
                { n: '03', title: 'Book Your Ride',   desc: 'Instant match with a verified driver' },
              ].map(step => (
                <div key={step.n} className="pr-step">
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: ACCENT, flexShrink: 0 }}>{step.n}</div>
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
                { icon: '🛡️', bg: 'rgba(255,215,0,0.1)',  title: 'Safe & Verified Drivers', desc: 'Every driver is background checked' },
                { icon: '💳', bg: 'rgba(59,130,246,0.1)',  title: 'Multiple Payment Options',  desc: 'Cash, UPI, cards & wallet' },
              ].map(f => (
                <div key={f.title} className="pr-feat">
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
            {[{ icon: '🛡️', l: 'Safe & Secure' }, { icon: '⚡', l: 'Quick Rides' }, { icon: '🎧', l: '24/7 Support' }].map(b => (
              <div key={b.l} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '7px 12px', fontSize: 11, fontWeight: 700 }}>
                {b.icon} {b.l}
              </div>
            ))}
          </div>
        </div>

        {/* ══ RIGHT PANEL ══ */}
        <div style={{ width: 480, minWidth: 480, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 36px', background: 'rgba(8,8,8,0.96)', backdropFilter: 'blur(20px)', overflowY: 'auto' }}>
          <div className="pr-right" style={{ width: '100%', maxWidth: 370 }}>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.2)', color: ACCENT, fontSize: 9, fontWeight: 800, padding: '4px 10px', borderRadius: 6, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              🧑 Passenger Registration
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 900, letterSpacing: -0.5, marginBottom: 6 }}>
              Create <span style={{ color: ACCENT }}>Account</span>
            </h2>
            <p style={{ fontSize: 13, color: '#555', marginBottom: 22 }}>Join Ucab and start riding today. It's free!</p>

            {/* Info pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,215,0,0.07)', border: '1px solid rgba(255,215,0,0.15)', borderRadius: 11, padding: '10px 14px', marginBottom: 20 }}>
              <span style={{ fontSize: 20 }}>🎁</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: ACCENT }}>₹150 Signup Bonus</div>
                <div style={{ fontSize: 10, color: '#555', marginTop: 1 }}>Applied automatically on your first ride</div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="pr-err" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,75,75,0.1)', border: '1px solid rgba(255,75,75,0.25)', borderRadius: 10, padding: '9px 12px', marginBottom: 16, fontSize: 12, fontWeight: 600, color: '#FF4B4B' }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* Full Name */}
              {[
                { name: 'name',  label: 'Full Name',     icon: '👤', type: 'text',     placeholder: 'John Doe' },
                { name: 'email', label: 'Email Address', icon: '✉️', type: 'email',    placeholder: 'john@example.com' },
                { name: 'phone', label: 'Phone Number',  icon: '📱', type: 'tel',      placeholder: '+91 9876543210' },
              ].map(f => (
                <div key={f.name} style={{ marginBottom: 13 }}>
                  <label style={{ fontSize: 10, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>{f.label}</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#444' }}>{f.icon}</span>
                    <input
                      type={f.type} name={f.name}
                      value={userData[f.name]} onChange={handleChange}
                      placeholder={f.placeholder}
                      className={`pr-input${error ? ' err' : ''}`}
                      required={f.name !== 'phone'}
                    />
                  </div>
                </div>
              ))}

              {/* Password */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 6 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#444' }}>🔑</span>
                  <input
                    type={showPwd ? 'text' : 'password'} name="password"
                    value={userData.password} onChange={handleChange}
                    placeholder="Min. 6 characters"
                    className={`pr-input${error ? ' err' : ''}`}
                    required
                  />
                  <button type="button" onClick={() => setShowPwd(p => !p)} tabIndex={-1}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 15, padding: 3 }}>
                    {showPwd ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: '13px 0', borderRadius: 12, background: ACCENT, color: '#000', fontWeight: 900, fontSize: 14, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Inter',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s', opacity: loading ? 0.7 : 1 }}
                onMouseOver={e => { if (!loading) { e.currentTarget.style.background = ACCENT_HOVER; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 22px rgba(255,215,0,0.35)'; } }}
                onMouseOut={e  => { e.currentTarget.style.background = ACCENT; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {loading
                  ? <><div style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.25)', borderTopColor: '#000', borderRadius: '50%', animation: 'prSpin 0.7s linear infinite' }} /> Creating Account…</>
                  : <>Create My Account →</>}
              </button>
            </form>

            <p style={{ fontSize: 12, color: '#555', textAlign: 'center', marginTop: 18 }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: ACCENT, fontWeight: 800, textDecoration: 'none' }}>Log in here</Link>
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 20, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              {[{ icon: Shield, l: '100% Secure' }, { icon: LockKeyhole, l: '256-bit SSL' }, { icon: CheckCircle, l: 'Privacy' }].map(s => (
                <div key={s.l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#3a3a3a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  <s.icon size={11} /> {s.l}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#0e0e0e', border: '1px solid rgba(255,255,255,0.1)', borderLeft: `3px solid ${ACCENT}`, borderRadius: 12, padding: '11px 20px', fontSize: 13, fontWeight: 700, boxShadow: '0 8px 32px rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', animation: 'prFade 0.3s ease' }}>
            {toast.msg}
          </div>
        )}
      </div>
    </>
  );
}
