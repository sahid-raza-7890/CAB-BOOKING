import React from 'react';

export default function OffersDashboard({ coupons }) {
    
    return (
        <div className="off-card" style={{ flex: 1 }}>
            <h2 className="off-title">Available Coupons</h2>
            
            {(!coupons || coupons.length === 0) ? (
                <div style={{ color: '#888', padding: '40px', textAlign: 'center' }}>
                    No coupons available right now.
                </div>
            ) : (
                <div className="off-coupon-grid">
                    {coupons.map(coupon => (
                        <div className="off-coupon" key={coupon._id}>
                            <div className="off-coupon-code">{coupon.code}</div>
                            <div className="off-coupon-desc">
                                {coupon.type === 'Percentage' 
                                    ? `Get ${coupon.value}% off your next ride.` 
                                    : `Flat ₹${coupon.value} off.`
                                }
                            </div>
                            <div className="off-coupon-footer">
                                <span>Min fare: ₹{coupon.minFare}</span>
                                <span>Valid till: {new Date(coupon.expiryDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
