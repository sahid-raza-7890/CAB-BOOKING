import React, { useState, useEffect } from 'react';
import PreferenceCard from './PreferenceCard';

export default function GeneralSettings({ prefs, onUpdate }) {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    avatar: 'avatar1'
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  
  // Legacy password state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const getToken = () => localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/users/profile', {
          headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            bio: data.bio || '',
            avatar: data.avatar || 'avatar1'
          });
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/otp/send', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (res.ok) {
        setShowOtp(true);
      } else {
        alert("Failed to send OTP");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const verifyAndSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const verifyRes = await fetch('http://localhost:5000/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ code: otpCode })
      });
      const verifyData = await verifyRes.json();
      
      if (verifyRes.ok && verifyData.verified) {
        const res = await fetch('http://localhost:5000/api/users/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
          body: JSON.stringify(profile)
        });
        if (res.ok) {
          localStorage.setItem('ucab_user_name', profile.name);
          setShowOtp(false);
          setOtpCode('');
          alert("Profile updated successfully!");
        }
      } else {
        alert("Invalid OTP");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      if (res.ok) {
        alert("Password updated!");
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading Profile...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PreferenceCard title="Personal Information" subtitle="Update your profile details.">
        <form onSubmit={handleProfileUpdate}>
          <div className="settings-input-group">
            <label>Avatar Selection</label>
            <div style={{ display: 'flex', gap: 16 }}>
              {['🧑‍✈️', '👩‍💻', '👨‍🚀', '🦁', '🦉'].map((emoji, i) => {
                const id = `avatar${i + 1}`;
                const isActive = profile.avatar === id;
                return (
                  <div 
                    key={id}
                    onClick={() => setProfile({ ...profile, avatar: id })}
                    style={{
                      width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 24, borderRadius: '50%', cursor: 'pointer',
                      background: isActive ? '#FFD400' : 'rgba(255,255,255,0.05)',
                      border: isActive ? '2px solid #fff' : '2px solid transparent'
                    }}
                  >
                    {emoji}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="settings-input-group">
              <label>Full Name</label>
              <input 
                className="settings-input" 
                value={profile.name} 
                onChange={e => setProfile({ ...profile, name: e.target.value })} 
                required 
              />
            </div>
            <div className="settings-input-group">
              <label>Email Address</label>
              <input 
                className="settings-input" 
                type="email" 
                value={profile.email} 
                onChange={e => setProfile({ ...profile, email: e.target.value })} 
                required 
              />
            </div>
          </div>

          <div className="settings-input-group">
            <label>Phone Number</label>
            <input 
              className="settings-input" 
              type="tel" 
              value={profile.phone} 
              onChange={e => setProfile({ ...profile, phone: e.target.value })} 
            />
          </div>

          <div className="settings-input-group">
            <label>Bio</label>
            <textarea 
              className="settings-input" 
              value={profile.bio} 
              onChange={e => setProfile({ ...profile, bio: e.target.value })}
              rows="3"
            />
          </div>

          <button className="settings-btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Requesting OTP...' : 'Save Profile'}
          </button>
        </form>
      </PreferenceCard>

      <PreferenceCard title="Change Password" subtitle="Ensure your account is secure.">
        <form onSubmit={handlePasswordSubmit}>
          <div className="settings-input-group">
            <label>Current Password</label>
            <input 
              type="password" 
              className="settings-input" 
              value={passwordForm.currentPassword}
              onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="settings-input-group">
              <label>New Password</label>
              <input 
                type="password" 
                className="settings-input" 
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
              />
            </div>
            <div className="settings-input-group">
              <label>Confirm Password</label>
              <input 
                type="password" 
                className="settings-input" 
                value={passwordForm.confirmPassword}
                onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required
              />
            </div>
          </div>
          <button className="settings-btn-primary" type="submit" disabled={submitting}>
            Update Password
          </button>
        </form>
      </PreferenceCard>

      {showOtp && (
        <div className="settings-modal-overlay">
          <div className="settings-modal">
            <h3 className="settings-modal-title">Verify OTP</h3>
            <p className="settings-modal-text">Check your console for the 6-digit code.</p>
            <form onSubmit={verifyAndSubmit}>
              <input 
                className="settings-input" 
                style={{ textAlign: 'center', fontSize: 24, letterSpacing: 8, marginBottom: 16 }}
                maxLength={6}
                value={otpCode}
                onChange={e => setOtpCode(e.target.value)}
                autoFocus
              />
              <div className="settings-modal-actions">
                <button type="button" className="settings-nav-btn" style={{ justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }} onClick={() => setShowOtp(false)}>Cancel</button>
                <button type="submit" className="settings-btn-primary" disabled={submitting}>Verify</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
