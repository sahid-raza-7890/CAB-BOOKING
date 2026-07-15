import React from 'react';

export default function SafetyTips() {
    const tips = [
        "Verify your driver's license plate before entering.",
        "Always sit in the back seat if riding alone.",
        "Share your trip status with friends or family.",
        "Trust your instincts. End the ride if you feel unsafe."
    ];

    return (
        <div className="glass-panel" style={{ padding: '1rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#e5b05c' }}>
                <i className="fa-solid fa-lightbulb"></i> Safety Tips
            </h3>
            <ul style={{ paddingLeft: '1.2rem', margin: 0, color: '#ccc', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {tips.map((tip, i) => <li key={i}>{tip}</li>)}
            </ul>
        </div>
    );
}
