import React from 'react';
import { motion } from 'framer-motion';

export default function LiveFareEstimator({ estimate, loading }) {
    if (loading) {
        return (
            <div className="ic-card">
                <h3 className="ic-card-title">Fare Estimate</h3>
                <p style={{ color: '#888' }}>Calculating route pricing...</p>
            </div>
        );
    }

    if (!estimate) {
        return (
            <div className="ic-card">
                <h3 className="ic-card-title">Fare Estimate</h3>
                <p style={{ color: '#888', fontSize: '13px' }}>
                    Select a pickup and destination to see live pricing. Outstation fares are dynamically calculated based on distance, state tolls, and driver allowances.
                </p>
            </div>
        );
    }

    const { breakdown, estimatedTotal } = estimate;

    return (
        <motion.div 
            className="ic-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <h3 className="ic-card-title">Fare Breakdown</h3>
            
            <div className="ic-fare-row">
                <span>Base Fare</span>
                <span>₹{breakdown.baseFare}</span>
            </div>
            
            <div className="ic-fare-row">
                <span>Distance Fare</span>
                <span>₹{breakdown.distanceFare}</span>
            </div>
            
            <div className="ic-fare-row">
                <span>Driver Allowance</span>
                <span>₹{breakdown.driverAllowance}</span>
            </div>
            
            <div className="ic-fare-row">
                <span>State Tax (Est.)</span>
                <span>₹{breakdown.stateTax}</span>
            </div>
            
            <div className="ic-fare-row">
                <span>Toll Charges (Est.)</span>
                <span>₹{breakdown.tollCharges}</span>
            </div>
            
            <div className="ic-fare-row">
                <span>Platform Fee</span>
                <span>₹{breakdown.platformFee}</span>
            </div>
            
            <div className="ic-fare-row">
                <span>GST (5%)</span>
                <span>₹{breakdown.gst}</span>
            </div>
            
            <div className="ic-fare-row total">
                <span>Grand Total</span>
                <span style={{ color: '#22c55e' }}>₹{estimatedTotal}</span>
            </div>
        </motion.div>
    );
}
