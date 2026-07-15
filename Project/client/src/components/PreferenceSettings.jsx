import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

function PreferenceSettings({ triggerToast }) {
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [preferredLanguage, setPreferredLanguage] = useState('English');
  const [region, setRegion] = useState('US');
  const { i18n } = useTranslation();

  useEffect(() => {
    const fetchPreferenceSettings = async () => {
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
          throw new Error("Failed to fetch preferences");
        }
        const data = await response.json();
        setPreferredLanguage(data.preferredLanguage || 'English');
        setRegion(data.region || 'US');
      } catch (err) {
        console.error(err);
        triggerToast("Failed to fetch preferences.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchPreferenceSettings();
  }, [triggerToast]);

  const handleToggleTheme = async (newTheme) => {
    toggleTheme(newTheme); // Triggers DOM and localStorage updates globally
    
    // Save instantly to backend for premium user experience
    const token = (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));
    try {
      await fetch('http://localhost:5000/api/users/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ theme: newTheme })
      });
      triggerToast(`Theme switched to ${newTheme} mode!`, "success");
    } catch (err) {
      console.error("Theme replication to backend failed.");
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
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
          preferredLanguage,
          region,
          theme
        })
      });

      const data = await response.json();
      if (response.ok) {
        if (i18n && i18n.changeLanguage) {
          let code = 'en';
          if (preferredLanguage === 'Spanish' || preferredLanguage === 'es') code = 'es';
          if (preferredLanguage === 'French' || preferredLanguage === 'fr') code = 'fr';
          if (preferredLanguage === 'Hindi' || preferredLanguage === 'hi') code = 'hi';
          i18n.changeLanguage(code);
        }
        triggerToast("Site preferences saved successfully!", "success");
      } else {
        triggerToast(data.error || "Failed to update preferences", "error");
      }
    } catch (err) {
      triggerToast("Server connection failed.", "error");
    } finally {
      setSubmitting(false);
    }
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
      width: '100%',
      padding: '12px 16px',
      borderRadius: '8px',
      border: '1px solid var(--card-border)',
      backgroundColor: 'var(--bg-color)',
      color: 'var(--text-main)',
      fontSize: '14px',
      marginTop: '6px',
      boxSizing: 'border-box',
      outline: 'none'
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
      transition: 'all 0.2s ease',
      alignSelf: 'flex-start'
    },
    themeSelector: {
      display: 'flex',
      gap: '15px',
      marginTop: '10px'
    },
    themeBtn: (isSelected) => ({
      flex: 1,
      padding: '15px',
      borderRadius: '10px',
      border: isSelected ? '2px solid var(--primary-accent)' : '1px solid var(--card-border)',
      backgroundColor: isSelected ? 'var(--bg-color)' : 'var(--card-bg)',
      color: 'var(--text-main)',
      fontWeight: 'bold',
      fontSize: '14px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      transition: 'all 0.2s ease'
    }),
    legalLink: {
      color: 'var(--primary-accent)',
      textDecoration: 'none',
      fontWeight: '600',
      fontSize: '14px'
    }
  };

  if (loading) {
    return <div style={{ color: 'var(--text-main)' }}>Loading Site Preferences...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Preferences Settings Form */}
      <section className="premium-glass" style={styles.cardSection}>
        <h3 style={styles.title}>🌐 Display & Preferences</h3>
        
        <form onSubmit={handleSavePreferences} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Language and Region selection */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={styles.label}>Language</label>
              <select 
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                style={styles.input}
              >
                <option value="English">English</option>
                <option value="Spanish">Español</option>
                <option value="French">Français</option>
                <option value="Hindi">हिन्दी</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Region / Currency</label>
              <select 
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                style={styles.input}
              >
                <option value="US">United States (INR)</option>
                <option value="IN">India (INR)</option>
                <option value="EU">European Union (EUR)</option>
                <option value="UK">United Kingdom (GBP)</option>
              </select>
            </div>
          </div>

          {/* Theme Selection Toggle */}
          <div>
            <span style={styles.label}>Appearance Mode</span>
            <div style={styles.themeSelector}>
              <button 
                type="button"
                onClick={() => handleToggleTheme('light')}
                style={styles.themeBtn(theme === 'light')}
              >
                ☀️ Light Theme
              </button>
              <button 
                type="button"
                onClick={() => handleToggleTheme('dark')}
                style={styles.themeBtn(theme === 'dark')}
              >
                🌙 Night Theme
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={submitting} 
            style={styles.button}
          >
            {submitting ? 'Saving Preferences...' : 'Save Preferences'}
          </button>
        </form>

        {/* Legal & Compliance Section */}
        <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <span style={styles.label}>Legal & Compliance Info</span>
          <div style={{ display: 'flex', gap: '25px', marginTop: '5px' }}>
            <a href="#/privacy-policy" style={styles.legalLink} onClick={(e) => { e.preventDefault(); triggerToast("Privacy Policy loaded (mock redirect).", "info"); }}>
              📄 Privacy Policy
            </a>
            <a href="#/terms-of-service" style={styles.legalLink} onClick={(e) => { e.preventDefault(); triggerToast("Terms of Service loaded (mock redirect).", "info"); }}>
              ⚖️ Terms of Service
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default PreferenceSettings;
