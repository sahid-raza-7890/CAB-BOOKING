import React, { useState, useEffect } from 'react';
import Skeleton from './Common/Skeleton';

function NotificationSettings({ triggerToast }) {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pushStatus, setPushStatus] = useState('default');

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    whatsapp: false,
    push: false
  });

  useEffect(() => {
    // Sync browser push state
    if ('Notification' in window) {
      setPushStatus(Notification.permission);
    }

    const fetchNotificationSettings = async () => {
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
          throw new Error("Failed to fetch notification settings");
        }
        const data = await response.json();
        setNotifications(data.notifications || { email: true, sms: false, whatsapp: false, push: false });
      } catch (err) {
        console.error(err);
        triggerToast("Failed to fetch notification settings.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchNotificationSettings();
  }, [triggerToast]);

  const handleSaveNotifications = async (e) => {
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
          notifications
        })
      });

      const data = await response.json();
      if (response.ok) {
        triggerToast("Notification settings updated successfully!", "success");
      } else {
        triggerToast(data.error || "Failed to update notification settings", "error");
      }
    } catch (err) {
      triggerToast("Server connection failed.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const requestPushPermission = async () => {
    if (!('Notification' in window)) {
      triggerToast("This browser does not support push notifications.", "error");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPushStatus(permission);

      if (permission === 'granted') {
        setNotifications(prev => ({ ...prev, push: true }));
        triggerToast("Push notifications enabled!", "success");
      } else if (permission === 'denied') {
        setNotifications(prev => ({ ...prev, push: false }));
        triggerToast("Push permission denied. Enable in browser settings.", "error");
      } else {
        triggerToast("Push permission dismissed.", "info");
      }
    } catch (error) {
      triggerToast("Error requesting push permission.", "error");
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
    toggleWrapper: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 0',
      borderBottom: '1px solid var(--card-border)'
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
    pushButton: (status) => ({
      padding: '10px 16px',
      backgroundColor: status === 'granted' ? '#10b981' : status === 'denied' ? '#ef4444' : '#4f46e5',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      fontWeight: 'bold',
      cursor: status === 'denied' ? 'not-allowed' : 'pointer',
      fontSize: '13px',
      transition: 'background-color 0.2s ease'
    })
  };

  if (loading) {
    return <div style={{ padding: 20 }}><Skeleton height="400px" /></div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      <section className="premium-glass" style={styles.cardSection}>
        <h3 style={styles.title}>🔔 Notification Preferences</h3>
        
        {/* Email Alerts Toggle */}
        <div style={styles.toggleWrapper}>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '15px' }}>Email Notifications</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
              Receive booking receipts, support updates, and monthly summaries.
            </div>
          </div>
          <input 
            type="checkbox" 
            checked={notifications.email}
            onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
          />
        </div>

        {/* SMS Alerts Toggle */}
        <div style={styles.toggleWrapper}>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '15px' }}>SMS Alerts</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
              Get driver arrival alerts, live trip updates, and dispatcher news.
            </div>
          </div>
          <input 
            type="checkbox" 
            checked={notifications.sms}
            onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
          />
        </div>

        {/* WhatsApp Alerts Toggle */}
        <div style={styles.toggleWrapper}>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '15px' }}>WhatsApp Alerts</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
              Opt-in to get trip status links and receipts directly in WhatsApp.
            </div>
          </div>
          <input 
            type="checkbox" 
            checked={notifications.whatsapp}
            onChange={(e) => setNotifications({ ...notifications, whatsapp: e.target.checked })}
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
          />
        </div>

        {/* Push Notification Toggle and API Controller */}
        <div style={{ ...styles.toggleWrapper, borderBottom: 'none', paddingBottom: 0 }}>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '15px' }}>Web Browser Push Notifications</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
              Enable push alerts in the browser for driver arrival reminders.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {pushStatus !== 'granted' && (
              <button 
                type="button" 
                onClick={requestPushPermission}
                disabled={pushStatus === 'denied'}
                style={styles.pushButton(pushStatus)}
              >
                {pushStatus === 'denied' ? 'Permission Denied' : 'Enable Push Alerts'}
              </button>
            )}
            {pushStatus === 'granted' && (
              <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '13px' }}>
                🟢 Enabled in Browser
              </span>
            )}
            <input 
              type="checkbox" 
              checked={notifications.push}
              disabled={pushStatus !== 'granted'}
              onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
              style={{ width: '20px', height: '20px', cursor: pushStatus === 'granted' ? 'pointer' : 'not-allowed' }}
            />
          </div>
        </div>

        <button 
          onClick={handleSaveNotifications} 
          disabled={submitting} 
          style={{ ...styles.button, marginTop: '10px' }}
        >
          {submitting ? 'Saving Notifications...' : 'Save Notification Settings'}
        </button>
      </section>
    </div>
  );
}

export default NotificationSettings;
