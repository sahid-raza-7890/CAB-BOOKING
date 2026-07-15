import React from 'react';

const ReferralCard = ({ title, description, icon }) => {
    return (
        <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textAlign: 'left' }}>
            <div style={{ fontSize: '2.5rem' }}>{icon}</div>
            <div>
                <h3 style={{ color: '#ffd700', marginBottom: '0.3rem' }}>{title}</h3>
                <p style={{ fontSize: '0.9rem', color: '#ccc' }}>{description}</p>
            </div>
        </div>
    );
};

export default ReferralCard;
