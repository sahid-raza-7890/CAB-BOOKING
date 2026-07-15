import React, { useState, useEffect } from 'react';
import { fetchEarningsSummary, fetchEarningsHistory, fetchIncentives } from '../../../services/driverEarningsService';
import '../DriverPortal.css';

function BarChart({ data, color }) {
    const safeData = Array.isArray(data) ? data : [];
    if (safeData.length === 0) return null;
    const max = Math.max(...safeData.map(d => d.value));
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    return (
        <div className="dp-revenue-chart">
            <div className="dp-chart-bars">
                {safeData.map((d, i) => (
                    <div key={i} className="dp-chart-bar" style={{
                        height: `${(d.value / max) * 100}%`,
                        background: i === safeData.length - 1 ? color : `${color}55`,
                    }} title={`₹${d.value.toLocaleString()}`} />
                ))}
            </div>
            <div className="dp-chart-labels">
                {safeData.map((d, i) => <div key={i} className="dp-chart-label">{days[i]}</div>)}
            </div>
        </div>
    );
}

export default function Earnings() {
    const [summary, setSummary] = useState(null);
    const [history, setHistory] = useState([]);
    const [incentives, setIncentives] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [sumRes, histRes, incRes] = await Promise.all([
                    fetchEarningsSummary().catch(() => ({ today: 0, week: 0, month: 0 })),
                    fetchEarningsHistory().catch(() => []),
                    fetchIncentives().catch(() => [])
                ]);
                setSummary(sumRes);
                
                // Process history for bar chart (assuming daily data for the week)
                const histData = Array.isArray(histRes) ? histRes : [];
                // Default to 7 days if empty
                const chartData = histData.length ? histData : [
                    { value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }, { value: 0 }
                ];
                setHistory(chartData.slice(0, 7));
                
                setIncentives(Array.isArray(incRes) ? incRes : []);
            } catch (err) {
                console.error("Failed to load earnings", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) return <div className="dp-root" style={{ padding: '20px' }}>Loading earnings...</div>;

    const safeIncentives = Array.isArray(incentives) ? incentives : [];

    return (
        <div className="dp-content">
            <h2 className="dp-section-title" style={{ fontSize: '24px', marginBottom: '16px' }}>Earnings & Bonuses</h2>
            
            <div className="dp-kpi-grid" style={{ marginBottom: '24px' }}>
                <div className="dp-kpi-card">
                    <div className="dp-kpi-top">
                        <div className="dp-kpi-icon">📅</div>
                        <div className="dp-kpi-label">Today</div>
                    </div>
                    <div className="dp-kpi-value">₹{(summary?.today || 0).toLocaleString()}</div>
                </div>
                <div className="dp-kpi-card">
                    <div className="dp-kpi-top">
                        <div className="dp-kpi-icon">📈</div>
                        <div className="dp-kpi-label">This Week</div>
                    </div>
                    <div className="dp-kpi-value">₹{(summary?.week || 0).toLocaleString()}</div>
                </div>
                <div className="dp-kpi-card">
                    <div className="dp-kpi-top">
                        <div className="dp-kpi-icon">🗓️</div>
                        <div className="dp-kpi-label">This Month</div>
                    </div>
                    <div className="dp-kpi-value">₹{(summary?.month || 0).toLocaleString()}</div>
                </div>
                <div className="dp-kpi-card">
                    <div className="dp-kpi-top">
                        <div className="dp-kpi-icon">🎁</div>
                        <div className="dp-kpi-label">Active Bonuses</div>
                    </div>
                    <div className="dp-kpi-value">{safeIncentives.length}</div>
                </div>
            </div>

            <div className="dp-row2">
                <div className="dp-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div className="dp-card-header">
                        <span className="dp-card-title">Weekly Breakdown</span>
                    </div>
                    <div style={{ flex: 1, padding: '16px' }}>
                        <BarChart data={history} color="#00D26A" />
                    </div>
                </div>

                <div className="dp-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div className="dp-card-header">
                        <span className="dp-card-title">Available Bonuses & Incentives</span>
                    </div>
                    <div className="dp-feed" style={{ overflowY: 'auto', flex: 1 }}>
                        {safeIncentives.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No active bonuses</div>
                        ) : safeIncentives.map(inc => (
                            <div key={inc.id || inc._id} className="dp-feed-item">
                                <div className="dp-feed-icon" style={{ background: 'rgba(255,210,31,0.12)', color: '#FFD21F' }}>
                                    🎁
                                </div>
                                <div className="dp-feed-text">
                                    <div className="dp-feed-title">{inc.title || 'Special Bonus'}</div>
                                    <div className="dp-feed-sub">{inc.description || 'Complete required trips'}</div>
                                </div>
                                <div style={{ fontWeight: '800', color: '#FFD21F' }}>
                                    ₹{inc.amount}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
