import React, { useState, useEffect } from 'react';

function PrivacySettings({ triggerToast }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [trustedContacts, setTrustedContacts] = useState([]);
  const [newContact, setNewContact] = useState('');
  const [communicationMasking, setCommunicationMasking] = useState(false);
  const [cookieConsent, setCookieConsent] = useState({
    essential: true,
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    const fetchPrivacySettings = async () => {
      const token = (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response = await fetch('http://localhost:5000/api/users/preferences', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error("Failed to fetch privacy settings");
        }
        const data = await response.json();
        setTrustedContacts(data.trustedContacts || []);
        setCommunicationMasking(data.communicationMasking || false);
        setCookieConsent(data.cookieConsent || { essential: true, analytics: false, marketing: false });
      } catch (err) {
        console.error(err);
        triggerToast("Failed to fetch privacy settings.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchPrivacySettings();
  }, [triggerToast]);

  const handleSavePrivacy = async (e) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    const token = (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));

    try {
      const response = await fetch('http://localhost:5000/api/users/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          trustedContacts,
          communicationMasking,
          cookieConsent
        })
      });

      const data = await response.json();
      if (response.ok) {
        triggerToast("Privacy settings updated successfully!", "success");
      } else {
        triggerToast(data.error || "Failed to update privacy settings", "error");
      }
    } catch (err) {
      triggerToast("Server connection failed.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Trusted Contacts CRUD ---
  const handleAddContact = (e) => {
    e.preventDefault();
    const formatted = newContact.trim();
    if (!formatted) return;
    
    // Simple validation (must contain numbers and be of typical length)
    if (!/^\+?[0-9\s\-()]{7,15}$/.test(formatted)) {
      triggerToast("Please enter a valid phone number.", "error");
      return;
    }

    if (trustedContacts.includes(formatted)) {
      triggerToast("Contact already exists in list.", "error");
      return;
    }

    setTrustedContacts([...trustedContacts, formatted]);
    setNewContact('');
    triggerToast("Contact added to list (save changes to persist).", "info");
  };

  const handleRemoveContact = (contactToRemove) => {
    setTrustedContacts(trustedContacts.filter(c => c !== contactToRemove));
    triggerToast("Contact removed from list (save changes to persist).", "info");
  };

  const styles = {
    cardSection: {
      padding: '30px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    },
    title: {
      marginTop: 0,
      marginBottom: 0,
      fontSize: '22px',
      color: 'var(--text-main)'
    },
    label: {
      fontSize: '13px',
      fontWeight: '700',
      color: 'var(--text-muted)',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    input: {
      padding: '12px 16px',
      borderRadius: '8px',
      border: '1px solid var(--card-border)',
      backgroundColor: 'var(--bg-color)',
      color: 'var(--text-main)',
      fontSize: '14px',
      outline: 'none',
      flex: 1
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
    addButton: {
      padding: '12px 20px',
      backgroundColor: '#475569',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      fontWeight: 'bold',
      cursor: 'pointer',
      fontSize: '14px'
    },
    contactItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 16px',
      backgroundColor: 'var(--bg-color)',
      border: '1px solid var(--card-border)',
      borderRadius: '8px',
      fontSize: '14px',
      color: 'var(--text-main)'
    },
    removeBtn: {
      background: 'none',
      border: 'none',
      color: '#dc3545',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer'
    },
    toggleWrapper: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 0',
      borderBottom: '1px solid var(--card-border)'
    },
    checkboxWrapper: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 0'
    }
  };

  if (loading) {
    return <div style={{ color: 'var(--text-main)' }}>Loading Privacy Settings...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* 🛡️ Privacy Controls Card */}
      <section className="premium-glass" style={styles.cardSection}>
        <h3 style={styles.title}>🛡️ Privacy & Safety Options</h3>
        
        {/* VoIP Masking Toggle */}
        <div style={styles.toggleWrapper}>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '15px' }}>Communication Masking</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
              Mask phone numbers when calling drivers for secure VoIP calls.
            </div>
          </div>
          <input 
            type="checkbox" 
            checked={communicationMasking}
            onChange={(e) => setCommunicationMasking(e.target.checked)}
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
          />
        </div>

        {/* CRUD list for Trusted Contacts */}
        <div>
          <span style={styles.label}>Trusted Contacts</span>
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '4px 0 12px 0' }}>
            Add phone numbers of contacts who can track your rides in real-time.
          </div>

          <form onSubmit={handleAddContact} style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <input 
              type="tel" 
              placeholder="+1 (555) 000-0000"
              value={newContact}
              onChange={(e) => setNewContact(e.target.value)}
              style={styles.input}
            />
            <button type="submit" style={styles.addButton}>Add Contact</button>
          </form>

          {trustedContacts.length === 0 ? (
            <div style={{ padding: '15px', border: '1px dashed var(--card-border)', borderRadius: '8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              No trusted contacts added yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
              {trustedContacts.map((contact, index) => (
                <div key={index} style={styles.contactItem}>
                  <span>📞 {contact}</span>
                  <button type="button" onClick={() => handleRemoveContact(contact)} style={styles.removeBtn} title="Remove contact">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cookie Consent Checkboxes */}
        <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '20px' }}>
          <span style={styles.label}>Cookie & Data Policy Settings</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '10px' }}>
            
            <div style={styles.checkboxWrapper}>
              <input type="checkbox" checked disabled style={{ cursor: 'not-allowed' }} />
              <div>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Essential Cookies</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '10px' }}>(Required for system login)</span>
              </div>
            </div>

            <div style={styles.checkboxWrapper}>
              <input 
                type="checkbox" 
                checked={cookieConsent.analytics}
                onChange={(e) => setCookieConsent({ ...cookieConsent, analytics: e.target.checked })}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontSize: '14px', fontWeight: '500' }}>Performance & Analytics Cookies</span>
            </div>

            <div style={styles.checkboxWrapper}>
              <input 
                type="checkbox" 
                checked={cookieConsent.marketing}
                onChange={(e) => setCookieConsent({ ...cookieConsent, marketing: e.target.checked })}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontSize: '14px', fontWeight: '500' }}>Marketing & Tracking Cookies</span>
            </div>
          </div>
        </div>

        <button 
          onClick={handleSavePrivacy} 
          disabled={submitting} 
          style={{ ...styles.button, alignSelf: 'flex-start', marginTop: '10px' }}
        >
          {submitting ? 'Saving Privacy...' : 'Save Privacy Settings'}
        </button>
      </section>
    </div>
  );
}

export default PrivacySettings;
