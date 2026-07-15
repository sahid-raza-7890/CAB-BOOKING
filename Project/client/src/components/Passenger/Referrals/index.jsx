import React, { useState, useEffect } from 'react';
import { passengerApiService } from '../../../services/passengerApiService';
import '../Profile/Profile.css';

const Referrals = () => {
  const [referralData, setReferralData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shareMessage, setShareMessage] = useState('');

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const data = await passengerApiService.getReferralDashboard();
      setReferralData(data);
    } catch (err) {
      setError(err.message || 'Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      setShareMessage('');
      await passengerApiService.shareReferralCode({ code: referralData?.referralCode });
      setShareMessage('Referral code shared successfully!');
    } catch (err) {
      setError(err.message || 'Failed to share code');
    }
  };

  if (loading) {
    return <div className="pp-container pp-loading">Loading referrals...</div>;
  }

  return (
    <div className="pp-container">
      <div className="pp-card pp-glass">
        <div className="pp-header">
          <h2 className="pp-title">Invite & Earn</h2>
          <p style={{ color: '#94A3B8' }}>Invite friends and earn rewards!</p>
        </div>
        
        {error && <div className="pp-alert pp-error">{error}</div>}
        {shareMessage && <div className="pp-alert pp-success">{shareMessage}</div>}
        
        {referralData ? (
          <>
            <div style={{ textAlign: 'center', margin: '2rem 0' }}>
              <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Your Referral Code</h3>
              <div style={{ 
                background: 'rgba(255, 210, 31, 0.1)', 
                border: '1px dashed #FFD21F', 
                padding: '1rem', 
                fontSize: '1.5rem', 
                fontWeight: 'bold',
                color: '#FFD21F',
                borderRadius: '8px',
                letterSpacing: '2px'
              }}>
                {referralData.referralCode || 'N/A'}
              </div>
            </div>

            <div className="pp-grid-2" style={{ marginBottom: '2rem' }}>
              <div className="pp-card" style={{ padding: '1rem', marginBottom: 0, textAlign: 'center' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#94A3B8' }}>Friends Invited</h4>
                <div style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 'bold' }}>
                  {referralData.totalInvites || 0}
                </div>
              </div>
              <div className="pp-card" style={{ padding: '1rem', marginBottom: 0, textAlign: 'center' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#94A3B8' }}>Rewards Earned</h4>
                <div style={{ fontSize: '1.5rem', color: '#10B981', fontWeight: 'bold' }}>
                  ${referralData.totalRewards || 0}
                </div>
              </div>
            </div>

            <button 
              className="pp-btn pp-btn-primary" 
              onClick={handleShare}
            >
              Share Code
            </button>
          </>
        ) : (
          <p style={{ textAlign: 'center', color: '#94A3B8' }}>Referral program is currently unavailable.</p>
        )}
      </div>
    </div>
  );
};

export default Referrals;
