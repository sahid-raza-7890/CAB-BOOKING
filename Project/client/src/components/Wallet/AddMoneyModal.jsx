import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { addMoney } from '../../services/walletService';

export default function AddMoneyModal({ onClose, onSuccess }) {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const handleTopUp = async () => {
        const val = parseInt(amount);
        if (!val || val <= 0) return alert('Enter a valid amount');
        
        setLoading(true);
        try {
            // Mocking the Razorpay flow success
            await addMoney(val);
            onSuccess();
        } catch (err) {
            console.error(err);
            alert('Failed to add money');
        } finally {
            setLoading(false);
        }
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
                    <h3 className="wal-card-title" style={{ margin: 0 }}>Add Money</h3>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ fontSize: '13px', color: '#888', marginBottom: '8px', display: 'block' }}>Amount (₹)</label>
                    <input 
                        type="number"
                        style={{ width: '100%', padding: '16px', background: 'rgba(0,0,0,0.5)', border: '1px solid #D4AF37', borderRadius: '12px', color: '#fff', fontSize: '24px', outline: 'none', boxSizing: 'border-box' }}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0"
                    />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                    {[500, 1000, 2000].map(val => (
                        <button 
                            key={val}
                            onClick={() => setAmount(val.toString())}
                            style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}
                        >
                            +₹{val}
                        </button>
                    ))}
                </div>

                <button className="wal-btn-gold" onClick={handleTopUp} disabled={loading}>
                    {loading ? 'Processing securely...' : 'Proceed to Pay'}
                </button>
            </motion.div>
        </div>
    );
}
