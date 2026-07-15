import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function WithdrawModal({ onClose, onSuccess }) {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const handleWithdraw = async () => {
        // Driver withdrawal flow would go here
        alert('Withdrawal request submitted for Admin approval.');
        onSuccess();
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div 
                className="wal-card"
                style={{ width: '100%', maxWidth: '400px' }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <h3 className="wal-card-title" style={{ margin: 0 }}>Withdraw Funds</h3>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ fontSize: '13px', color: '#888', marginBottom: '8px', display: 'block' }}>Amount to Withdraw (₹)</label>
                    <input 
                        type="number"
                        style={{ width: '100%', padding: '16px', background: 'rgba(0,0,0,0.5)', border: '1px solid #D4AF37', borderRadius: '12px', color: '#fff', fontSize: '24px', outline: 'none', boxSizing: 'border-box' }}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                    />
                </div>

                <button className="wal-btn-gold" onClick={handleWithdraw} disabled={loading}>
                    {loading ? 'Processing...' : 'Request Withdrawal'}
                </button>
            </motion.div>
        </div>
    );
}
