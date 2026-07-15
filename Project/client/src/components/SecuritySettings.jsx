import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function SecuritySettings() {
    const { theme } = useTheme();
    const [pin, setPin] = useState('');
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState('');

    const [settings, setSettings] = useState({
        locationTracking: 'While Using',
        driverRatingFilter: 4.5,
        adBlock: true
    });

    const verifyPin = async (e) => {
        e.preventDefault();
        // Mock verification, ideally hits /api/users/verify-pin
        if (pin === '1234') {
            setVerified(true);
            setError('');
        } else {
            setError('Invalid PIN. Default is 1234.');
        }
    };

    const handleToggle = (key) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    if (!verified) {
        return (
            <div style={{ padding: '40px 20px', maxWidth: 400, margin: '0 auto' }}>
                <div className="premium-glass">
                    <h2 style={{ color: 'var(--text-main)' }}>Security Verification</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Enter your 4-digit PIN to access Security Settings.</p>
                    <form onSubmit={verifyPin} style={{ marginTop: 20 }}>
                        <input
                            type="password"
                            maxLength={4}
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            style={{
                                width: '100%', padding: '12px', borderRadius: 8,
                                background: 'var(--bg-color)', color: 'var(--text-main)',
                                border: '1px solid var(--card-border)', textAlign: 'center', fontSize: 24, letterSpacing: 8
                            }}
                        />
                        {error && <div style={{ color: '#ef4444', fontSize: 12, marginTop: 8 }}>{error}</div>}
                        <button type="submit" style={{
                            width: '100%', padding: '12px', borderRadius: 8, marginTop: 16,
                            background: 'var(--primary-accent)', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer'
                        }}>Verify</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '40px 20px', maxWidth: 600, margin: '0 auto' }}>
            <h1 style={{ color: 'var(--text-main)' }}>Safety & Privacy</h1>
            
            <div className="premium-glass" style={{ marginTop: 20 }}>
                <h3 style={{ color: 'var(--text-main)', marginBottom: 16 }}>Location Access</h3>
                <select
                    value={settings.locationTracking}
                    onChange={(e) => setSettings({ ...settings, locationTracking: e.target.value })}
                    style={{
                        width: '100%', padding: '10px', borderRadius: 8,
                        background: 'var(--bg-color)', color: 'var(--text-main)',
                        border: '1px solid var(--card-border)'
                    }}
                >
                    <option value="Always">Always Allow</option>
                    <option value="While Using">While Using the App</option>
                    <option value="Never">Never</option>
                </select>
            </div>

            <div className="premium-glass" style={{ marginTop: 20 }}>
                <h3 style={{ color: 'var(--text-main)', marginBottom: 16 }}>Driver Rating Filter</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 12 }}>Only match with drivers rated above this score.</p>
                <input
                    type="range"
                    min="3.0" max="5.0" step="0.1"
                    value={settings.driverRatingFilter}
                    onChange={(e) => setSettings({ ...settings, driverRatingFilter: parseFloat(e.target.value) })}
                    style={{ width: '100%' }}
                />
                <div style={{ textAlign: 'right', color: 'var(--text-main)', fontWeight: 'bold' }}>{settings.driverRatingFilter} ⭐</div>
            </div>

            <div className="premium-glass" style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ color: 'var(--text-main)' }}>Privacy / Ad-Block</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>Block third-party tracking scripts during rides.</p>
                </div>
                <button
                    onClick={() => handleToggle('adBlock')}
                    style={{
                        padding: '8px 16px', borderRadius: 20,
                        background: settings.adBlock ? 'var(--primary-accent)' : 'var(--card-border)',
                        color: settings.adBlock ? '#fff' : 'var(--text-main)', border: 'none', cursor: 'pointer', fontWeight: 'bold'
                    }}
                >
                    {settings.adBlock ? 'ON' : 'OFF'}
                </button>
            </div>
        </div>
    );
}
