import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriver } from './DriverContext';

const DriverHeader = () => {
    const { isOnline, toggleOnlineStatus, driver, isOnBreak, toggleBreak, availability } = useDriver();
    const navigate = useNavigate();
    const [showBreakMenu, setShowBreakMenu] = useState(false);
    const [breakTimeRemaining, setBreakTimeRemaining] = useState('');

    useEffect(() => {
        let interval;
        if (isOnBreak && availability?.breakEndsAt) {
            const endTime = new Date(availability.breakEndsAt).getTime();
            const updateTimer = () => {
                const now = new Date().getTime();
                const diff = Math.max(0, Math.floor((endTime - now) / 1000));
                if (diff === 0) {
                    setBreakTimeRemaining('00:00');
                    clearInterval(interval);
                } else {
                    const m = Math.floor(diff / 60).toString().padStart(2, '0');
                    const s = (diff % 60).toString().padStart(2, '0');
                    setBreakTimeRemaining(`${m}:${s}`);
                }
            };
            updateTimer();
            interval = setInterval(updateTimer, 1000);
        } else if (isOnBreak && !availability?.breakEndsAt) {
            setBreakTimeRemaining('Open');
        }
        return () => clearInterval(interval);
    }, [isOnBreak, availability?.breakEndsAt]);

    const handleBreakSelect = (type, mins) => {
        toggleBreak(type, mins);
        setShowBreakMenu(false);
    };

    return (
        <header className="dp-header">
            <div className="dp-search-wrap">
                <span style={{color: '#555'}}>🔍</span>
                <input placeholder="Search driver actions..." />
                <span className="dp-kbd">Ctrl+K</span>
            </div>

            <div className="dp-hdr-stats">
                <div className="dp-hdr-stat">
                    <span className="dp-hdr-stat-label">Status</span>
                    <span className="dp-hdr-stat-val" style={{ color: isOnline ? '#00D26A' : '#FF4B4B' }}>
                        {isOnline ? (isOnBreak ? 'On Break' : 'Online') : 'Offline'}
                    </span>
                </div>
                <div className="dp-hdr-stat">
                    <span className="dp-hdr-stat-label">Driver</span>
                    <span className="dp-hdr-stat-val">{driver?.name || 'Driver'}</span>
                </div>
            </div>

            <div className="dp-hdr-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button 
                    className="dp-socket-badge" 
                    onClick={toggleOnlineStatus} 
                    style={{ background: isOnline ? 'rgba(0,210,106,0.1)' : 'rgba(255,75,75,0.1)', borderColor: isOnline ? 'rgba(0,210,106,0.25)' : 'rgba(255,75,75,0.25)', color: isOnline ? '#00D26A' : '#FF4B4B', cursor: 'pointer' }}
                >
                    <div className="dp-socket-dot" style={{ background: isOnline ? '#00D26A' : '#FF4B4B' }} />
                    {isOnline ? 'Go Offline' : 'Go Online'}
                </button>
                
                {isOnline && !isOnBreak && (
                    <div style={{ position: 'relative' }}>
                        <button 
                            className="dp-socket-badge" 
                            onClick={() => setShowBreakMenu(!showBreakMenu)}
                            style={{ background: 'rgba(251,191,36,0.1)', borderColor: 'rgba(251,191,36,0.25)', color: '#fbbf24', cursor: 'pointer' }}
                        >
                            ☕ Take a Break
                        </button>
                        {showBreakMenu && (
                            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '8px', zIndex: 100, minWidth: '150px' }}>
                                <div style={{ padding: '8px', cursor: 'pointer', color: '#cbd5e1' }} onClick={() => handleBreakSelect('Short Rest', 15)}>Short Rest (15m)</div>
                                <div style={{ padding: '8px', cursor: 'pointer', color: '#cbd5e1' }} onClick={() => handleBreakSelect('Meal Break', 30)}>Meal Break (30m)</div>
                                <div style={{ padding: '8px', cursor: 'pointer', color: '#cbd5e1' }} onClick={() => handleBreakSelect('Open Break', null)}>Open Break</div>
                            </div>
                        )}
                    </div>
                )}

                {isOnBreak && (
                    <button 
                        className="dp-socket-badge" 
                        onClick={() => toggleBreak()}
                        style={{ background: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.25)', color: '#3b82f6', cursor: 'pointer' }}
                    >
                        ☕ Resume ({breakTimeRemaining})
                    </button>
                )}

                <button className="dp-icon-btn" title="Notifications" onClick={() => navigate('/driver/notifications')}>
                    🔔
                    <span className="dp-notif-dot">0</span>
                </button>
                <button className="dp-avatar-btn" onClick={() => navigate('/driver/profile')}>
                    {driver?.name ? driver.name.charAt(0).toUpperCase() : 'D'}
                </button>
            </div>
        </header>
    );
};

export default DriverHeader;
