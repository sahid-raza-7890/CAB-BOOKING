import React from 'react';
import { useDriver } from '../DriverContext';

const WalletCard = () => {
    const { wallet } = useDriver();

    if (!wallet) return null;

    return (
        <div className="earnings-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="card-header">
                <h3 className="card-title">Wallet Balance</h3>
                <div className="card-icon">
                    <i className="fas fa-wallet"></i>
                </div>
            </div>
            
            <h1 className="big-value">₹{wallet.balance.toFixed(2)}</h1>
            <p className="mini-stat-label" style={{ marginBottom: 'auto' }}>Available for instant cash-out</p>
            
            <button className="btn-primary" style={{ 
                width: '100%', 
                marginTop: '24px', 
                backgroundColor: 'transparent', 
                border: '1px solid var(--driver-accent)', 
                color: 'var(--driver-accent)',
                padding: '12px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
            }}>
                Cash Out Now
            </button>
        </div>
    );
};

export default WalletCard;
