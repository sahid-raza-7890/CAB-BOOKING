import React from 'react';
import { motion } from 'framer-motion';

export default function LiveFareEstimator({ estimate, loading }) {
    if (loading) {
        return (
            <div className="rn-card">
                <h3 className="rn-card-title">Fare Estimate</h3>
                <p style={{ color: '#888' }}>Calculating package pricing...</p>
            </div>
        );
    }

    if (!estimate) {
        return (
            <div className="rn-card">
                <h3 className="rn-card-title">Fare Estimate</h3>
                <p style={{ color: '#888', fontSize: '13px' }}>
                    Select a rental package and vehicle category to see live pricing.
                </p>
            </div>
        );
    }

    const { breakdown, estimatedTotal, overtimeRate, extraDistanceRate } = estimate;

    return (
        <motion.div 
            className="rn-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <h3 className="rn-card-title">Rental Package Breakdown</h3>
            
            <div className="rn-fare-row">
                <span>Package Fare</span>
                <span>₹{breakdown.packageFare}</span>
            </div>
            
            <div className="rn-fare-row">
                <span>Platform Fee</span>
                <span>₹{breakdown.platformFee}</span>
            </div>
            
            <div className="rn-fare-row">
                <span>GST (5%)</span>
                <span>₹{breakdown.gst}</span>
            </div>
            
            <div className="rn-fare-row total">
                <span>Grand Total</span>
                <span style={{ color: '#22C55E' }}>₹{estimatedTotal}</span>
            </div>

            <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(34,197,94,0.05)', borderRadius: '12px', border: '1px solid rgba(34,197,94,0.2)' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#22C55E' }}>Overlimit Charges</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#aaa', marginBottom: '8px' }}>
                    <span>Extra Distance</span>
                    <span>₹{extraDistanceRate}/km</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#aaa' }}>
                    <span>Extra Time</span>
                    <span>₹{overtimeRate}/hr</span>
                </div>
            </div>
        </motion.div>
    );
}
