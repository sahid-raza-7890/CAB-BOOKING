import React, { useState, useEffect } from 'react';
import PrivacySettings from './PrivacySettings';
import NotificationSettings from './NotificationSettings';
import PreferenceSettings from './PreferenceSettings';

function Settings() {
  const [activeTab, setActiveTab] = useState('account');
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // OTP Verification Modal States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // --- State for Account & Profile Tab ---
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    preferredLanguage: 'English',
    avatar: 'avatar1' // Mock avatar selections
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // --- State for Payments & Billing Tab ---
  const [paymentSettings, setPaymentSettings] = useState({
    paymentMethods: [],
    billingAddress: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    }
  });

  // State for Adding a New Card
  const [newCard, setNewCard] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  const triggerToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3500);
  };

  // --- Fetch Initial Data (Optimized state hydration tracking activeTab) ---
  useEffect(() => {
    const fetchSettingsData = async () => {
      const token = (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));
      if (!token) return;

      try {
        if (activeTab === 'account') {
          setLoading(true);
          const profileRes = await fetch('http://localhost:5000/api/users/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const profileData = await profileRes.json();
          if (profileRes.ok) {
            setProfile({
              name: profileData.name || '',
              email: profileData.email || '',
              phone: profileData.phone || '',
              bio: profileData.bio || '',
              preferredLanguage: profileData.preferredLanguage || 'English',
              avatar: profileData.avatar || 'avatar1'
            });
          }
          setLoading(false);
        } else if (activeTab === 'billing') {
          setLoading(true);
          const paymentRes = await fetch('http://localhost:5000/api/users/payment-settings', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const paymentData = await paymentRes.json();
          if (paymentRes.ok) {
            setPaymentSettings({
              paymentMethods: paymentData.paymentMethods || [],
              billingAddress: {
                street: paymentData.billingAddress?.street || '',
                city: paymentData.billingAddress?.city || '',
                state: paymentData.billingAddress?.state || '',
                postalCode: paymentData.billingAddress?.postalCode || '',
                country: paymentData.billingAddress?.country || ''
              }
            });
          }
          setLoading(false);
        }
      } catch (err) {
        triggerToast("Failed to fetch settings from server.", "error");
        setLoading(false);
      }
    };

    fetchSettingsData();
  }, [activeTab]);

  // --- Handle Profile Update (OTP-Triggered Flow) ---
  const handleProfileSubmitTrigger = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const token = (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));

    try {
      const response = await fetch('http://localhost:5000/api/otp/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (response.ok) {
        triggerToast("Verification code generated! Check server console log.", "success");
        setShowOtpModal(true);
      } else {
        triggerToast(data.error || "Failed to send verification code", "error");
      }
    } catch (err) {
      triggerToast("Server connection error requesting OTP.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpVerifyAndSubmit = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      triggerToast("Verification code must be exactly 6 digits.", "error");
      return;
    }

    setVerifyingOtp(true);
    const token = (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));

    try {
      // 1. Verify OTP
      const verifyRes = await fetch('http://localhost:5000/api/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code: otpCode })
      });
      const verifyData = await verifyRes.json();

      if (verifyRes.ok && verifyData.verified) {
        // 2. OTP Verified, proceed with Profile PUT update
        const response = await fetch('http://localhost:5000/api/users/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            bio: profile.bio,
            preferredLanguage: profile.preferredLanguage
          })
        });

        const data = await response.json();
        if (response.ok) {
          localStorage.setItem('ucab_user_name', profile.name); // Keep navbar synced
          triggerToast("Profile details updated successfully!", "success");
          setShowOtpModal(false);
          setOtpCode('');
        } else {
          triggerToast(data.error || "Failed to update profile", "error");
        }
      } else {
        triggerToast(verifyData.error || "Invalid or expired verification code", "error");
      }
    } catch (err) {
      triggerToast("Server connection error during verification.", "error");
    } finally {
      setVerifyingOtp(false);
    }
  };

  // --- Handle Password Change ---
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      triggerToast("Passwords do not match!", "error");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      triggerToast("Password must be at least 6 characters.", "error");
      return;
    }

    setSubmitting(true);
    const token = (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));

    try {
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await response.json();
      if (response.ok) {
        triggerToast("Password changed successfully!", "success");
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        triggerToast(data.error || "Password change failed", "error");
      }
    } catch (err) {
      triggerToast("Server connection error.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Handle Billing Address Update ---
  const handleBillingSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const token = (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));

    try {
      const response = await fetch('http://localhost:5000/api/users/payment-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          billingAddress: paymentSettings.billingAddress
        })
      });

      const data = await response.json();
      if (response.ok) {
        triggerToast("Billing address updated successfully!", "success");
      } else {
        triggerToast(data.error || "Failed to update billing details", "error");
      }
    } catch (err) {
      triggerToast("Server connection error.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Handle Add Card ---
  const handleAddCard = async (e) => {
    e.preventDefault();
    const cleanNum = newCard.cardNumber.replace(/\s+/g, '');
    if (cleanNum.length < 15 || cleanNum.length > 16) {
      triggerToast("Please enter a valid credit card number.", "error");
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(newCard.expiryDate)) {
      triggerToast("Expiry date must be in MM/YY format.", "error");
      return;
    }

    setSubmitting(true);
    const token = (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));

    // Detect card brand
    let brand = 'Visa';
    if (cleanNum.startsWith('5') || cleanNum.startsWith('2')) brand = 'Mastercard';
    if (cleanNum.startsWith('3')) brand = 'Amex';

    const maskedNum = `•••• •••• •••• ${cleanNum.slice(-4)}`;
    const cardObject = {
      cardholderName: newCard.cardholderName,
      cardNumber: maskedNum,
      expiryDate: newCard.expiryDate,
      cardBrand: brand,
      isDefault: paymentSettings.paymentMethods.length === 0
    };

    const updatedMethods = [...paymentSettings.paymentMethods, cardObject];

    try {
      const response = await fetch('http://localhost:5000/api/users/payment-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paymentMethods: updatedMethods
        })
      });

      const data = await response.json();
      if (response.ok) {
        setPaymentSettings(prev => ({ ...prev, paymentMethods: data.paymentMethods }));
        setNewCard({ cardholderName: '', cardNumber: '', expiryDate: '', cvv: '' });
        triggerToast("Card added successfully!", "success");
      } else {
        triggerToast(data.error || "Failed to add card", "error");
      }
    } catch (err) {
      triggerToast("Server connection error.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Remove Card ---
  const handleRemoveCard = async (indexToRemove) => {
    if (!window.confirm("Are you sure you want to delete this payment method?")) return;
    setSubmitting(true);
    const token = (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));
    const updatedMethods = paymentSettings.paymentMethods.filter((_, idx) => idx !== indexToRemove);

    try {
      const response = await fetch('http://localhost:5000/api/users/payment-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ paymentMethods: updatedMethods })
      });

      const data = await response.json();
      if (response.ok) {
        setPaymentSettings(prev => ({ ...prev, paymentMethods: data.paymentMethods }));
        triggerToast("Card removed successfully.", "info");
      } else {
        triggerToast(data.error || "Failed to remove card", "error");
      }
    } catch (err) {
      triggerToast("Server connection error.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Set Card as Default ---
  const handleSetDefaultCard = async (targetIndex) => {
    setSubmitting(true);
    const token = (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));
    const updatedMethods = paymentSettings.paymentMethods.map((card, idx) => ({
      ...card,
      isDefault: idx === targetIndex
    }));

    try {
      const response = await fetch('http://localhost:5000/api/users/payment-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ paymentMethods: updatedMethods })
      });

      const data = await response.json();
      if (response.ok) {
        setPaymentSettings(prev => ({ ...prev, paymentMethods: data.paymentMethods }));
        triggerToast("Default payment card updated.", "success");
      } else {
        triggerToast(data.error || "Failed to update default card", "error");
      }
    } catch (err) {
      triggerToast("Server connection error.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Card Brand Logo / Icon Helper ---
  const getCardIcon = (brand) => {
    if (brand === 'Mastercard') return '💳 🟠 🔴';
    if (brand === 'Amex') return '💳 🔵';
    return '💳 🟢';
  };

  // --- Dynamic Color Styles matching dark/light mode ---
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'row',
      gap: '30px',
      width: '100%',
      maxWidth: '1100px',
      margin: '0 auto',
      padding: '40px 20px',
      boxSizing: 'border-box',
      minHeight: '80vh',
      color: 'var(--text-main)',
      flexWrap: 'wrap'
    },
    sidebar: {
      flex: '1 1 250px',
      padding: '20px',
      alignSelf: 'flex-start',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    contentPanel: {
      flex: '3 1 600px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    },
    tabButton: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '14px 20px',
      borderRadius: '10px',
      border: 'none',
      backgroundColor: isActive ? 'var(--primary-accent)' : 'transparent',
      color: isActive ? 'var(--primary-text)' : 'var(--text-main)',
      fontWeight: 'bold',
      fontSize: '15px',
      cursor: 'pointer',
      textAlign: 'left',
      transition: 'all 0.2s ease-in-out',
    }),
    cardSection: {
      padding: '30px',
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '8px',
      border: '1px solid var(--card-border)',
      backgroundColor: 'var(--bg-color)',
      color: 'var(--text-main)',
      fontSize: '14px',
      marginTop: '6px',
      boxSizing: 'border-box',
      outline: 'none',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
    },
    label: {
      fontSize: '13px',
      fontWeight: '700',
      color: 'var(--text-muted)',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    button: {
      padding: '12px 24px',
      backgroundColor: 'var(--primary-accent)',
      color: 'var(--primary-text)',
      border: 'none',
      borderRadius: '8px',
      fontWeight: 'bold',
      cursor: 'pointer',
      fontSize: '15px',
      transition: 'all 0.2s ease'
    },
    avatarGrid: {
      display: 'flex',
      gap: '15px',
      marginTop: '10px',
      marginBottom: '20px'
    },
    avatarOption: (isSelected) => ({
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      backgroundColor: isSelected ? 'var(--primary-accent)' : 'var(--card-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      cursor: 'pointer',
      border: isSelected ? '3px solid var(--primary-accent)' : '3px solid transparent',
      boxShadow: isSelected ? '0 0 10px rgba(40, 167, 69, 0.4)' : 'none',
      transition: 'all 0.2s ease'
    }),
    creditCard: (brand) => ({
      background: brand === 'Mastercard' 
        ? 'linear-gradient(135deg, #FF5F6D 0%, #FFC371 100%)'
        : brand === 'Amex'
        ? 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
        : 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      color: '#ffffff',
      padding: '24px',
      borderRadius: '16px',
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '180px',
      position: 'relative',
      overflow: 'hidden'
    })
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', color: 'var(--text-main)' }}>
        <h3>Loading your Settings profile...</h3>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Toast Notification */}
      {toast.show && (
        <div style={{
          position: 'fixed', bottom: '20px', right: '20px', padding: '15px 25px', borderRadius: '8px', 
          color: 'var(--primary-text)', fontWeight: 'bold', zIndex: 1001, 
          backgroundColor: toast.type === 'success' ? 'var(--primary-accent)' : '#dc3545',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
        }}>
          {toast.message}
        </div>
      )}

      {/* 🛠️ SIDEBAR NAVIGATION */}
      <aside className="premium-glass" style={styles.sidebar}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 'bold' }}>⚙️ Settings Hub</h3>
        <button 
          onClick={() => setActiveTab('account')} 
          style={styles.tabButton(activeTab === 'account')}
        >
          👤 Account & Profile
        </button>
        <button 
          onClick={() => setActiveTab('billing')} 
          style={styles.tabButton(activeTab === 'billing')}
        >
          💳 Payments & Billing
        </button>
        <button 
          onClick={() => window.location.href='/settings/security'} 
          style={styles.tabButton(false)}
        >
          🔐 Safety & Security
        </button>
        <button 
          onClick={() => setActiveTab('privacy')} 
          style={styles.tabButton(activeTab === 'privacy')}
        >
          🛡️ Privacy & Safety
        </button>
        <button 
          onClick={() => setActiveTab('notifications')} 
          style={styles.tabButton(activeTab === 'notifications')}
        >
          🔔 Notifications
        </button>
        <button 
          onClick={() => setActiveTab('preferences')} 
          style={styles.tabButton(activeTab === 'preferences')}
        >
          🌐 Site Preferences
        </button>
      </aside>

      {/* 🛠️ DETAILS PANEL */}
      <div style={styles.contentPanel}>
        {activeTab === 'account' && (
          <>
            {/* Account Details Card */}
            <section className="premium-glass" style={styles.cardSection}>
              <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '22px' }}>Personal Profile Information</h3>
              <form onSubmit={handleProfileSubmitTrigger}>
                
                {/* Avatar Selection */}
                <div style={{ marginBottom: '20px' }}>
                  <span style={styles.label}>Select Avatar</span>
                  <div style={styles.avatarGrid}>
                    {['🧑‍✈️', '👩‍💻', '👨‍🚀', '🦁', '🦉'].map((emoji, index) => {
                      const id = `avatar${index + 1}`;
                      return (
                        <div 
                          key={id} 
                          onClick={() => setProfile({ ...profile, avatar: id })} 
                          style={styles.avatarOption(profile.avatar === id)}
                        >
                          {emoji}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                  <div>
                    <label style={styles.label}>Full Name</label>
                    <input 
                      type="text" 
                      value={profile.name} 
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })} 
                      required 
                      style={styles.input} 
                    />
                  </div>
                  <div>
                    <label style={styles.label}>Email Address</label>
                    <input 
                      type="email" 
                      value={profile.email} 
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })} 
                      required 
                      style={styles.input} 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={styles.label}>Phone Number</label>
                    <input 
                      type="tel" 
                      value={profile.phone} 
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })} 
                      placeholder="+1 (555) 000-0000" 
                      style={styles.input} 
                    />
                  </div>
                  <div>
                    <label style={styles.label}>Preferred Language</label>
                    <select 
                      value={profile.preferredLanguage} 
                      onChange={(e) => setProfile({ ...profile, preferredLanguage: e.target.value })} 
                      style={styles.input}
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Español</option>
                      <option value="French">Français</option>
                      <option value="Hindi">हिन्दी</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={styles.label}>Bio / Description</label>
                  <textarea 
                    rows="3" 
                    value={profile.bio} 
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })} 
                    placeholder="Tell us a bit about yourself..." 
                    style={{ ...styles.input, resize: 'vertical' }} 
                  />
                </div>

                <button type="submit" disabled={submitting} style={styles.button}>
                  {submitting ? 'Saving Changes...' : 'Save Profile Details'}
                </button>
              </form>
            </section>

            {/* Password Management Card */}
            <section className="premium-glass" style={styles.cardSection}>
              <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '22px' }}>Security & Password</h3>
              <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={styles.label}>Current Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••"
                    value={passwordForm.currentPassword} 
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} 
                    required 
                    style={styles.input} 
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={styles.label}>New Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={passwordForm.newPassword} 
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} 
                      required 
                      style={styles.input} 
                    />
                  </div>
                  <div>
                    <label style={styles.label}>Confirm New Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      value={passwordForm.confirmPassword} 
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} 
                      required 
                      style={styles.input} 
                    />
                  </div>
                </div>

                <button type="submit" disabled={submitting} style={{ ...styles.button, backgroundColor: '#475569', color: 'white', alignSelf: 'flex-start' }}>
                  Update Password Securely
                </button>
              </form>
            </section>
          </>
        )}

        {activeTab === 'billing' && (
          <>
            {/* Saved Payment Methods Section */}
            <section className="premium-glass" style={styles.cardSection}>
              <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '22px' }}>Saved Payment Methods</h3>
              
              {paymentSettings.paymentMethods.length === 0 ? (
                <div style={{ padding: '30px', border: '1px dashed var(--card-border)', borderRadius: '12px', textAlign: 'center', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  You don't have any payment methods saved yet. Add one below to enable fast checkout!
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                  {paymentSettings.paymentMethods.map((method, index) => (
                    <div key={index} style={styles.creditCard(method.cardBrand)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{method.cardBrand}</span>
                        <span style={{ fontSize: '24px' }}>{getCardIcon(method.cardBrand)}</span>
                      </div>
                      
                      <div style={{ fontSize: '20px', letterSpacing: '2px', margin: '20px 0 10px 0' }}>
                        {method.cardNumber}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <div>
                          <div style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.8 }}>Cardholder</div>
                          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{method.cardholderName}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.8 }}>Expires</div>
                          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{method.expiryDate}</div>
                        </div>
                      </div>

                      {/* Card Action Controls */}
                      <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '8px' }}>
                        {!method.isDefault && (
                          <button 
                            onClick={() => handleSetDefaultCard(index)} 
                            style={{ border: 'none', background: 'rgba(255,255,255,0.2)', color: 'white', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}
                            title="Set as Default"
                          >
                            Set Default
                          </button>
                        )}
                        {method.isDefault && (
                          <span style={{ backgroundColor: 'rgba(255,255,255,0.3)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>
                            ★ Default
                          </span>
                        )}
                        <button 
                          onClick={() => handleRemoveCard(index)} 
                          style={{ border: 'none', background: 'rgba(220,53,69,0.8)', color: 'white', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold' }}
                          title="Remove Card"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Method Form */}
              <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '25px' }}>
                <h4 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>💳 Add a New Card</h4>
                <form onSubmit={handleAddCard} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px' }}>
                    <div>
                      <label style={styles.label}>Cardholder Name</label>
                      <input 
                        type="text" 
                        placeholder="John Doe" 
                        value={newCard.cardholderName} 
                        onChange={(e) => setNewCard({ ...newCard, cardholderName: e.target.value })} 
                        required 
                        style={styles.input} 
                      />
                    </div>
                    <div>
                      <label style={styles.label}>Card Number</label>
                      <input 
                        type="text" 
                        placeholder="4111 2222 3333 4444" 
                        value={newCard.cardNumber} 
                        onChange={(e) => {
                          // Simple formatting for credit card separation
                          let v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                          let matches = v.match(/\d{4,16}/g);
                          let match = matches && matches[0] || '';
                          let parts = [];
                          for (let i = 0, len = match.length; i < len; i += 4) {
                            parts.push(match.substring(i, i + 4));
                          }
                          setNewCard({ ...newCard, cardNumber: parts.length > 0 ? parts.join(' ') : v });
                        }} 
                        required 
                        style={styles.input} 
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <label style={styles.label}>Expiration Date</label>
                      <input 
                        type="text" 
                        placeholder="MM/YY" 
                        maxLength="5"
                        value={newCard.expiryDate} 
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, '');
                          if (val.length > 2) {
                            val = `${val.slice(0, 2)}/${val.slice(2, 4)}`;
                          }
                          setNewCard({ ...newCard, expiryDate: val });
                        }} 
                        required 
                        style={styles.input} 
                      />
                    </div>
                    <div>
                      <label style={styles.label}>CVV / Security Code</label>
                      <input 
                        type="password" 
                        placeholder="•••" 
                        maxLength="4"
                        value={newCard.cvv} 
                        onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value.replace(/\D/g, '') })} 
                        required 
                        style={styles.input} 
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={submitting} style={{ ...styles.button, width: '100%', marginTop: '5px' }}>
                    {submitting ? 'Saving Card...' : 'Verify & Add Card'}
                  </button>
                </form>
              </div>
            </section>

            {/* Billing Address Details Section */}
            <section className="premium-glass" style={styles.cardSection}>
              <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '22px' }}>Billing Address</h3>
              <form onSubmit={handleBillingSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={styles.label}>Street Address</label>
                  <input 
                    type="text" 
                    placeholder="123 RideSharing Way, Suite 100" 
                    value={paymentSettings.billingAddress.street} 
                    onChange={(e) => setPaymentSettings({
                      ...paymentSettings,
                      billingAddress: { ...paymentSettings.billingAddress, street: e.target.value }
                    })} 
                    required 
                    style={styles.input} 
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={styles.label}>City</label>
                    <input 
                      type="text" 
                      placeholder="Bengaluru" 
                      value={paymentSettings.billingAddress.city} 
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings,
                        billingAddress: { ...paymentSettings.billingAddress, city: e.target.value }
                      })} 
                      required 
                      style={styles.input} 
                    />
                  </div>
                  <div>
                    <label style={styles.label}>State / Region</label>
                    <input 
                      type="text" 
                      placeholder="CA" 
                      value={paymentSettings.billingAddress.state} 
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings,
                        billingAddress: { ...paymentSettings.billingAddress, state: e.target.value }
                      })} 
                      required 
                      style={styles.input} 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '25px' }}>
                  <div>
                    <label style={styles.label}>Postal / ZIP Code</label>
                    <input 
                      type="text" 
                      placeholder="94107" 
                      value={paymentSettings.billingAddress.postalCode} 
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings,
                        billingAddress: { ...paymentSettings.billingAddress, postalCode: e.target.value }
                      })} 
                      required 
                      style={styles.input} 
                    />
                  </div>
                  <div>
                    <label style={styles.label}>Country</label>
                    <input 
                      type="text" 
                      placeholder="United States" 
                      value={paymentSettings.billingAddress.country} 
                      onChange={(e) => setPaymentSettings({
                        ...paymentSettings,
                        billingAddress: { ...paymentSettings.billingAddress, country: e.target.value }
                      })} 
                      required 
                      style={styles.input} 
                    />
                  </div>
                </div>

                <button type="submit" disabled={submitting} style={{ ...styles.button, backgroundColor: '#0ea5e9', color: '#ffffff' }}>
                  {submitting ? 'Updating Billing...' : 'Update Address'}
                </button>
              </form>
            </section>
          </>
        )}

        {activeTab === 'privacy' && (
          <PrivacySettings triggerToast={triggerToast} />
        )}

        {activeTab === 'notifications' && (
          <NotificationSettings triggerToast={triggerToast} />
        )}

        {activeTab === 'preferences' && (
          <PreferenceSettings triggerToast={triggerToast} />
        )}
      </div>

      {/* 🛡️ OTP VERIFICATION MODAL OVERLAY */}
      {showOtpModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.75)', // Deep slate overlay
          backdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 2000, padding: '20px', boxSizing: 'border-box'
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '450px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>🛡️</div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '24px', color: 'var(--text-main)' }}>Security Verification</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.5', marginBottom: '25px' }}>
              We have generated a 6-digit verification code. Please check the backend server console to retrieve your code.
            </p>
            
            <form onSubmit={handleOtpVerifyAndSubmit}>
              <div style={{ marginBottom: '25px' }}>
                <input 
                  type="text" 
                  maxLength="6"
                  placeholder="000000" 
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleOtpVerifyAndSubmit(e);
                    }
                  }}
                  style={{
                    letterSpacing: '12px',
                    fontSize: '28px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '2px solid var(--card-border)',
                    backgroundColor: 'var(--bg-color)',
                    color: 'var(--text-main)',
                    width: '100%',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <button 
                  type="button" 
                  onClick={() => { setShowOtpModal(false); setOtpCode(''); }}
                  style={{
                    flex: 1, padding: '14px', borderRadius: '10px', border: '1px solid var(--card-border)',
                    backgroundColor: 'transparent', color: 'var(--text-main)', fontWeight: 'bold', cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={verifyingOtp}
                  style={{
                    flex: 1, padding: '14px', borderRadius: '10px', border: 'none',
                    backgroundColor: 'var(--primary-accent)', color: 'var(--primary-text)', fontWeight: 'bold', cursor: 'pointer'
                  }}
                >
                  {verifyingOtp ? 'Verifying...' : 'Verify & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
