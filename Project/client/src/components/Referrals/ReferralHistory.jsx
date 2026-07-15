import React from 'react';
import ReferralEmpty from './ReferralEmpty';

const ReferralHistory = ({ history }) => {
    if (!history || history.length === 0) {
        return (
            <div className="glass-panel" style={{ gridColumn: '1 / -1' }}>
                <h2>Referral History</h2>
                <ReferralEmpty />
            </div>
        );
    }

    return (
        <div className="glass-panel" style={{ gridColumn: '1 / -1' }}>
            <h2>Referral History</h2>
            <div className="history-list" style={{ marginTop: '1.5rem' }}>
                {history.map((item, index) => (
                    <div key={index} className="history-item">
                        <div>
                            <strong>{item.referredUserId?.name || 'A Friend'}</strong>
                            <div style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '0.3rem' }}>
                                Joined {new Date(item.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div className={`status-badge ${item.status.toLowerCase()}`}>
                                {item.status}
                            </div>
                            {item.status === 'Rewarded' && (
                                <div style={{ color: '#ffd700', fontWeight: 'bold', marginTop: '0.5rem' }}>
                                    +${item.reward}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReferralHistory;
