import React, { useState, useEffect } from 'react';
import { useDriver } from '../DriverContext';
import referralService from '../../../services/referralService';

export default function Referrals() {
    const { user } = useDriver();
    const [dashboard, setDashboard] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchReferrals();
    }, []);

    const fetchReferrals = async () => {
        try {
            const dash = await referralService.getDashboard();
            const hist = await referralService.getHistory();
            setDashboard(dash);
            setHistory(Array.isArray(hist) ? hist : (hist?.history || []));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (!dashboard?.referralCode) return;
        navigator.clipboard.writeText(dashboard.referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return <div className="pp-glass-panel">Loading...</div>;
    }

    return (
        <div className="pp-glass-panel">
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '16px' }}>Referrals & Rewards</h2>
            <div style={{ padding: '24px', background: 'var(--badge-bg)', borderRadius: '12px', border: '1px solid var(--primary-accent)', textAlign: 'center' }}>
                <h3 style={{ color: 'var(--primary-accent)', marginBottom: '12px' }}>Invite Drivers, Earn Rewards</h3>
                <p style={{ color: 'var(--text-main)', marginBottom: '24px' }}>When a driver you refer completes their first milestone, you both get a bonus.</p>
                
                <div style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--card-bg)', padding: '12px 24px', borderRadius: '8px', border: '1px dashed var(--primary-accent)' }}>
                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-main)', letterSpacing: '2px' }}>
                        {dashboard?.referralCode || 'NO-CODE-YET'}
                    </span>
                </div>
                
                <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button className="pp-btn" onClick={handleCopy} style={{ padding: '12px 32px' }}>
                        {copied ? 'Copied!' : 'Copy Code'}
                    </button>
                    <button className="ucab-btn secondary" onClick={() => referralService.shareReferral()} style={{ padding: '12px 32px' }}>
                        <i className="fas fa-share-alt"></i> Share
                    </button>
                </div>
            </div>

            <div style={{ marginTop: '32px', display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1, padding: '20px', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--card-border)', textAlign: 'center' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-muted)' }}>Total Referrals</h4>
                    <span style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-main)' }}>{dashboard?.stats?.totalReferrals || 0}</span>
                </div>
                <div style={{ flex: 1, padding: '20px', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--card-border)', textAlign: 'center' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-muted)' }}>Earned</h4>
                    <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>${dashboard?.stats?.totalEarned || 0}</span>
                </div>
            </div>

            <div style={{ marginTop: '32px' }}>
                <h3 style={{ fontSize: '18px', color: 'var(--text-main)', marginBottom: '16px' }}>Your Referrals History</h3>
                
                {history.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
                        No referrals yet. Share your code to get started!
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {history.map((h, i) => (
                            <div key={i} style={{ padding: '16px', background: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-main)' }}>{h.referredUserName || 'User'}</h4>
                                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{new Date(h.date || h.createdAt).toLocaleDateString()}</span>
                                </div>
                                <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', background: h.status === 'Completed' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: h.status === 'Completed' ? '#10b981' : '#f59e0b' }}>
                                    {h.status || 'Pending'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
