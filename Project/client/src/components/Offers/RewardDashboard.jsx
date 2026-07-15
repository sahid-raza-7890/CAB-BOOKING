import React from 'react';

export default function RewardDashboard({ account, history }) {
    const tier = account?.tier || 'Bronze';
    const points = account?.totalPoints || 0;

    return (
        <div className="off-card">
            <h2 className="off-title">UCAB Rewards</h2>
            
            <div className="off-reward-box">
                <div className={`off-tier-badge ${tier}`}>{tier} Member</div>
                <h1 className="off-points">{points}</h1>
                <div className="off-points-label">Available Points</div>
            </div>

            <div style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '12px', color: '#fff' }}>Recent Activity</h3>
                {(!history || history.length === 0) ? (
                    <div style={{ color: '#888', fontSize: '13px' }}>No reward history yet.</div>
                ) : (
                    <div>
                        {history.slice(0, 5).map(h => (
                            <div className="off-history-item" key={h._id}>
                                <div>
                                    <div className="off-history-desc">{h.description}</div>
                                    <div className="off-history-date">{new Date(h.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div className={`off-history-pts ${h.type}`}>
                                    {h.type === 'Earned' ? '+' : '-'}{h.points}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
