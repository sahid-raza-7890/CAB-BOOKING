import React from 'react';
import { useDriver } from '../DriverContext';

const IncentiveCard = () => {
    const { bonuses } = useDriver();

    if (!bonuses || !bonuses.activeIncentives || bonuses.activeIncentives.length === 0) {
        return (
            <div className="earnings-card">
                <div className="card-header">
                    <h3 className="card-title">Active Quests</h3>
                    <div className="card-icon">
                        <i className="fas fa-gift"></i>
                    </div>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>No active quests at the moment. Check back later!</p>
            </div>
        );
    }

    const quest = bonuses.activeIncentives[0]; // Display the primary active quest

    const currentTrips = quest.currentTrips || 0;
    const targetTrips = quest.targetTrips || 10;
    const progressPercent = Math.min(100, (currentTrips / targetTrips) * 100);

    return (
        <div className="earnings-card">
            <div className="card-header">
                <h3 className="card-title">Active Quest</h3>
                <div className="card-icon">
                    <i className="fas fa-gift"></i>
                </div>
            </div>
            
            <h3 style={{ fontSize: '18px', margin: '0 0 8px 0', color: '#fff' }}>{quest.title}</h3>
            <p style={{ fontSize: '14px', color: '#94a3b8', margin: '0 0 16px 0' }}>{quest.description}</p>
            
            <div className="quest-progress-container">
                <div className="quest-title">
                    <span>{currentTrips} / {targetTrips} Trips</span>
                    <span style={{ color: 'var(--driver-accent)', fontWeight: 'bold' }}>+₹{quest.reward}</span>
                </div>
                <div className="quest-bar-bg">
                    <div className="quest-bar-fill" style={{ width: `${progressPercent}%` }}></div>
                </div>
            </div>
        </div>
    );
};

export default IncentiveCard;
