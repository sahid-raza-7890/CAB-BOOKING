import React from 'react';

export default function WalletDashboard({ wallet, onAddMoney }) {
    
    const balance = wallet?.balance || 0;
    const locked = wallet?.lockedBalance || 0;
    const available = balance - locked;

    return (
        <div className="wal-card">
            <h2 className="wal-card-title">UCAB Wallet</h2>
            
            <div className="wal-balance-box">
                <div className="wal-balance-label">Available Balance</div>
                <h1 className="wal-balance-amount">₹{available.toFixed(2)}</h1>
                
                {locked > 0 && (
                    <div className="wal-locked-balance">
                        🔒 ₹{locked.toFixed(2)} locked in pending transactions
                    </div>
                )}
            </div>

            <button className="wal-btn-gold" onClick={onAddMoney}>
                + Add Money
            </button>
            <button className="wal-btn-dark">
                View Reward Coins
            </button>
        </div>
    );
}
