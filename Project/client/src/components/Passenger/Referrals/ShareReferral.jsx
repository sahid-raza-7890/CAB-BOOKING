import React from 'react';
import { referralService } from '../../services/referralService';

const ShareReferral = ({ code }) => {
    
    const referralLink = `${window.location.origin}/signup?ref=${code}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(referralLink);
        alert('Referral link copied to clipboard!');
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(code);
        alert('Referral code copied to clipboard!');
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Join UCAB',
                    text: `Use my referral code ${code} to get ₹15 off your first ride!`,
                    url: referralLink,
                });
            } catch (err) {
                console.error("Native share failed", err);
            }
        } else {
            try {
                await referralService.shareReferral();
                alert('Referral shared via API successfully!');
            } catch (e) {
                console.error(e);
            }
        }
    };

    return (
        <div className="glass-panel">
            <h2>Your Invite Code</h2>
            <p>Share this code with friends. You both get ₹15 when they complete their first ride!</p>
            
            <div className="referral-code-box">
                <span>{code}</span>
                <button className="btn-outline" onClick={handleCopyCode}>Copy Code</button>
            </div>
            
            <div className="referral-link-box" style={{ display: 'flex', gap: '10px', marginTop: '1rem', marginBottom: '1rem' }}>
                <input type="text" value={referralLink} readOnly style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', color: '#000' }} />
                <button className="btn-outline" onClick={handleCopyLink}>Copy Link</button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
                <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(referralLink)}`} 
                    alt="Referral QR Code" 
                />
            </div>
            
            <button className="btn-primary" style={{ width: '100%' }} onClick={handleShare}>
                Share with Friends
            </button>
        </div>
    );
};

export default ShareReferral;
