import React, { useState } from 'react';
import { referralService } from '../../services/referralService';

const InviteFriends = ({ onApplySuccess }) => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleApply = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await referralService.applyReferral(code);
            setSuccess('Referral code applied successfully!');
            setCode('');
            if (onApplySuccess) onApplySuccess();
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to apply code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel">
            <h2>Have an Invite Code?</h2>
            <p>Enter your friend's code below to start earning your reward.</p>
            
            <form onSubmit={handleApply} style={{ marginTop: '1.5rem' }}>
                <input 
                    type="text" 
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. UCAB-XYZ123" 
                    required
                    style={{
                        width: '100%',
                        padding: '1rem',
                        marginBottom: '1rem',
                        borderRadius: '8px',
                        border: '1px solid #444',
                        background: '#222',
                        color: '#fff',
                        textTransform: 'uppercase'
                    }}
                />
                
                {error && <div style={{ color: '#ff4444', marginBottom: '1rem' }}>{error}</div>}
                {success && <div style={{ color: '#00C851', marginBottom: '1rem' }}>{success}</div>}

                <button type="submit" className="btn-outline" style={{ width: '100%' }} disabled={loading}>
                    {loading ? 'Applying...' : 'Apply Code'}
                </button>
            </form>
        </div>
    );
};

export default InviteFriends;
