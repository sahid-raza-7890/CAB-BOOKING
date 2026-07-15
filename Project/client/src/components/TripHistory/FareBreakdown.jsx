import React from 'react';

export default function FareBreakdown({ fareBreakdown, total, paymentMethod }) {
    if (!fareBreakdown) {
        return (
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#e5b05c' }}>Payment Summary</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#ccc' }}>Total Charged</span>
                    <span style={{ fontWeight: 'bold' }}>₹{total?.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#ccc' }}>Payment Method</span>
                    <span><i className={`fa-solid ${paymentMethod === 'Cash' ? 'fa-money-bill' : 'fa-credit-card'}`}></i> {paymentMethod}</span>
                </div>
            </div>
        );
    }

    return (
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#e5b05c' }}>Receipt</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: '#ccc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Base Fare</span>
                    <span>₹{fareBreakdown.baseFare?.toFixed(2) || '0.00'}</span>
                </div>
                {fareBreakdown.distanceFare > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Distance Fare</span>
                        <span>₹{fareBreakdown.distanceFare.toFixed(2)}</span>
                    </div>
                )}
                {fareBreakdown.timeFare > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Time Fare</span>
                        <span>₹{fareBreakdown.timeFare.toFixed(2)}</span>
                    </div>
                )}
                {fareBreakdown.waitingCharge > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Waiting Time</span>
                        <span>₹{fareBreakdown.waitingCharge.toFixed(2)}</span>
                    </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Taxes & Fees</span>
                    <span>₹{fareBreakdown.taxes?.toFixed(2) || (fareBreakdown.platformFee || 0).toFixed(2)}</span>
                </div>
                
                {fareBreakdown.coupon > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                        <span>Discount</span>
                        <span>-${fareBreakdown.coupon.toFixed(2)}</span>
                    </div>
                )}

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '0.5rem 0' }}></div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', color: '#fff', fontWeight: 'bold' }}>
                    <span>Total Charged</span>
                    <span>₹{total?.toFixed(2) || fareBreakdown.total?.toFixed(2)}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                    <span>Payment Method</span>
                    <span><i className={`fa-solid ${paymentMethod === 'Cash' ? 'fa-money-bill' : 'fa-credit-card'}`}></i> {paymentMethod}</span>
                </div>
            </div>
        </div>
    );
}
