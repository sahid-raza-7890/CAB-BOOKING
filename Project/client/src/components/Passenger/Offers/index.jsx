import React, { useState, useEffect } from 'react';
import { passengerApiService } from '../../../services/passengerApiService';
import '../Profile/Profile.css';

const Offers = () => {
  const [activeOffers, setActiveOffers] = useState([]);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [offersData, couponsData] = await Promise.all([
        passengerApiService.getActiveOffers().catch(() => []),
        passengerApiService.getAvailableCoupons().catch(() => [])
      ]);
      
      // Some APIs might return objects with a "data" array or the array directly
      setActiveOffers(Array.isArray(offersData) ? offersData : offersData?.data || []);
      setAvailableCoupons(Array.isArray(couponsData) ? couponsData : couponsData?.data || []);
    } catch (err) {
      setError('Failed to load offers and coupons');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="pp-container pp-loading">Loading offers...</div>;
  }

  return (
    <div className="pp-container">
      <div className="pp-card pp-glass" style={{ maxWidth: '800px' }}>
        <div className="pp-header">
          <h2 className="pp-title">Offers & Promos</h2>
          <p style={{ color: '#94A3B8' }}>Available coupons and special deals for your rides.</p>
        </div>
        
        {error && <div className="pp-alert pp-error">{error}</div>}
        
        <div className="pp-grid-2">
          {/* Active Offers Section */}
          <div>
            <h3 style={{ color: '#fff', borderBottom: '1px solid rgba(255,210,31,0.2)', paddingBottom: '0.5rem' }}>Special Offers</h3>
            {activeOffers.length === 0 ? (
              <p style={{ color: '#94A3B8', fontStyle: 'italic' }}>No active offers right now.</p>
            ) : (
              <ul className="pp-list">
                {activeOffers.map((offer, idx) => (
                  <li key={idx} className="pp-list-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#FFD21F' }}>{offer.title}</h4>
                    <p style={{ margin: '0 0 0.5rem 0', color: '#fff', fontSize: '0.9rem' }}>{offer.description}</p>
                    <span className="pp-badge">Valid until: {new Date(offer.expiryDate).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Coupons Section */}
          <div>
            <h3 style={{ color: '#fff', borderBottom: '1px solid rgba(255,210,31,0.2)', paddingBottom: '0.5rem' }}>Your Coupons</h3>
            {availableCoupons.length === 0 ? (
              <p style={{ color: '#94A3B8', fontStyle: 'italic' }}>No coupons available.</p>
            ) : (
              <ul className="pp-list">
                {availableCoupons.map((coupon, idx) => (
                  <li key={idx} className="pp-list-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                    <div className="pp-flex-between" style={{ width: '100%', marginBottom: '0.5rem' }}>
                      <h4 style={{ margin: 0, color: '#10B981', letterSpacing: '1px' }}>{coupon.code}</h4>
                      <span className="pp-badge">{coupon.discountPercentage}% OFF</span>
                    </div>
                    <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.85rem' }}>
                      Max discount: ${coupon.maxDiscountAmount} | Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Offers;
