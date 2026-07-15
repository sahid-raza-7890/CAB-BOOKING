import React from 'react';

export default function QuestProgress({ incentives }) {
    if (!incentives || incentives.length === 0) {
        return <div style={{ color: '#888', padding: '20px' }}>No active quests at the moment.</div>;
    }

    return (
        <div className="de-quest-grid">
            {incentives.map(inc => (
                <div key={inc._id} className="de-quest-card">
                    <div className="de-quest-title">{inc.title}</div>
                    <div style={{ fontSize: '13px', color: '#a0a0a0', marginBottom: '16px' }}>
                        {inc.description}
                    </div>
                    <div className="de-quest-reward">₹{inc.reward} Bonus</div>
                    
                    {/* Simulated Progress Bar */}
                    <div style={{ background: 'rgba(255,255,255,0.1)', height: '8px', borderRadius: '4px', marginBottom: '16px', overflow: 'hidden' }}>
                        <div style={{ 
                            width: inc.claimed ? '100%' : '30%', 
                            background: inc.claimed ? '#22c55e' : '#D4AF37', 
                            height: '100%' 
                        }}></div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#888' }}>
                            {inc.claimed ? 'Goal Reached' : `Target: ${inc.targetTrips} Trips`}
                        </span>
                        
                        {inc.claimed ? (
                            <span style={{ color: '#22c55e', fontWeight: 'bold' }}>Unlocked</span>
                        ) : (
                            <button className="de-btn" style={{ padding: '6px 12px', fontSize: '12px' }}>Track</button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
