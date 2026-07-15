import React, { useState, useEffect } from 'react';
import DriverDashboardService from '../../../services/driverDashboardService';
import '../DriverPortal.css';

export default function Wallet() {
    const [walletData, setWalletData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isWithdrawModalOpen, setWithdrawModalOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');

    useEffect(() => {
        const fetchWallet = async () => {
            try {
                const [walletSummary, txns] = await Promise.all([
                    DriverDashboardService.getWalletSummary().catch(() => ({ balance: 0, lockedBalance: 0 })),
                    DriverDashboardService.getTransactions().catch(() => [])
                ]);
                setWalletData(walletSummary);
                setTransactions(txns);
            } catch (err) {
                console.error("Failed to load wallet", err);
            } finally {
                setLoading(false);
            }
        };
        fetchWallet();
    }, []);

    const handleWithdraw = async (e) => {
        e.preventDefault();
        try {
            await fetch('http://localhost:5000/api/driver/wallet/withdraw', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({ amount: Number(withdrawAmount) })
            });
            setWithdrawModalOpen(false);
            setWithdrawAmount('');
            const walletSummary = await DriverDashboardService.getWalletSummary();
            setWalletData(walletSummary);
        } catch (err) {
            console.error("Failed withdrawal", err);
        }
    };

    if (loading) return <div className="dp-root" style={{ padding: '20px' }}>Loading wallet...</div>;

    const balance = walletData?.balance || 0;
    const lockedBalance = walletData?.lockedBalance || 0;
    const withdrawable = Math.max(0, balance - lockedBalance);
    const safeTransactions = Array.isArray(transactions) ? transactions : [];

    return (
        <div className="dp-content">
            <h2 className="dp-section-title" style={{ fontSize: '24px', marginBottom: '16px' }}>My Wallet</h2>
            
            <div className="dp-kpi-grid" style={{ marginBottom: '24px' }}>
                <div className="dp-kpi-card">
                    <div className="dp-kpi-top">
                        <div className="dp-kpi-icon">💰</div>
                        <div className="dp-kpi-label">Current Balance</div>
                    </div>
                    <div className="dp-kpi-value">₹{balance.toLocaleString()}</div>
                </div>
                <div className="dp-kpi-card">
                    <div className="dp-kpi-top">
                        <div className="dp-kpi-icon">🔒</div>
                        <div className="dp-kpi-label">Locked Balance</div>
                    </div>
                    <div className="dp-kpi-value">₹{lockedBalance.toLocaleString()}</div>
                </div>
                <div className="dp-kpi-card">
                    <div className="dp-kpi-top">
                        <div className="dp-kpi-icon">✅</div>
                        <div className="dp-kpi-label">Withdrawable</div>
                    </div>
                    <div className="dp-kpi-value">₹{withdrawable.toLocaleString()}</div>
                    <button 
                        className="dp-action-btn" 
                        style={{ marginTop: '12px', width: 'auto', padding: '6px 14px', fontSize: '12px', background: 'rgba(255,210,31,0.15)', color: '#FFD21F', fontWeight: 'bold' }}
                        onClick={() => setWithdrawModalOpen(true)}
                        disabled={withdrawable <= 0}
                    >
                        Request Withdrawal
                    </button>
                </div>
            </div>

            <div className="dp-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div className="dp-card-header">
                    <span className="dp-card-title">Realtime Transaction History</span>
                </div>
                <div className="dp-feed" style={{ overflowY: 'auto', flex: 1 }}>
                    {safeTransactions.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No transactions found</div>
                    ) : safeTransactions.map(txn => (
                        <div key={txn.id || txn._id} className="dp-feed-item">
                            <div className="dp-feed-icon" style={{ background: txn.type === 'credit' ? 'rgba(0,210,106,0.12)' : 'rgba(255,75,75,0.12)', color: txn.type === 'credit' ? '#00D26A' : '#FF4B4B' }}>
                                {txn.type === 'credit' ? '↓' : '↑'}
                            </div>
                            <div className="dp-feed-text">
                                <div className="dp-feed-title">{txn.description || 'Transaction'}</div>
                                <div className="dp-feed-sub">{new Date(txn.createdAt || txn.date).toLocaleString()}</div>
                            </div>
                            <div style={{ fontWeight: '800', color: txn.type === 'credit' ? '#00D26A' : '#fff' }}>
                                {txn.type === 'credit' ? '+' : '-'}₹{txn.amount}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isWithdrawModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="dp-card" style={{ padding: '24px', width: '340px' }}>
                        <h3 className="dp-section-title" style={{ marginBottom: '16px', fontSize: '16px' }}>Withdraw Funds</h3>
                        <form onSubmit={handleWithdraw}>
                            <input 
                                type="number" 
                                value={withdrawAmount} 
                                onChange={e => setWithdrawAmount(e.target.value)}
                                placeholder="Enter amount to withdraw"
                                style={{
                                    width: '100%', padding: '12px', background: '#111', 
                                    border: '1px solid rgba(255,255,255,0.1)', color: '#fff', 
                                    borderRadius: '8px', marginBottom: '20px',
                                    outline: 'none', fontFamily: 'Inter, sans-serif'
                                }}
                                max={withdrawable}
                                required
                            />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="button" onClick={() => setWithdrawModalOpen(false)} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#ccc', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                                <button type="submit" style={{ flex: 1, padding: '10px', background: '#FFD21F', border: 'none', color: '#000', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer' }}>Confirm</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
