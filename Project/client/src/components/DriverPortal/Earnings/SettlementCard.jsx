import React from 'react';
import { useDriver } from '../DriverContext';

const SettlementCard = () => {
    const { settlements } = useDriver();

    if (!settlements || settlements.length === 0) return null;

    const activeSettlement = settlements[0]; // Assuming sorted desc

    return (
        <div className="earnings-card">
            <div className="card-header">
                <h3 className="card-title">Current Settlement</h3>
                <div className="card-icon">
                    <i className="fas fa-file-invoice-dollar"></i>
                </div>
            </div>
            
            <h1 className="big-value" style={{ color: '#fff', fontSize: '32px' }}>₹{activeSettlement.finalAmount.toFixed(2)}</h1>
            <p className="mini-stat-label">Pending Payout (Closes Sunday)</p>

            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#94a3b8' }}>Gross Fares</span>
                    <span>₹{activeSettlement.grossAmount.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#ff4444' }}>UCAB Commission</span>
                    <span style={{ color: '#ff4444' }}>-₹{activeSettlement.commission.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: '#00ff88' }}>Bonuses</span>
                    <span style={{ color: '#00ff88' }}>+₹{activeSettlement.incentives.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
};

export default SettlementCard;
