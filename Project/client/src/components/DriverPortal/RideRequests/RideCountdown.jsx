import React, { useState, useEffect } from 'react';

const RideCountdown = ({ expiresAt, onExpire }) => {
    const [progress, setProgress] = useState(100);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const calculateProgress = () => {
            const now = new Date().getTime();
            const end = new Date(expiresAt).getTime();
            // Assuming default 30s lifespan for calculating % visually
            const start = end - 30000;
            
            const remaining = end - now;
            
            if (remaining <= 0) {
                setProgress(0);
                setTimeLeft(0);
                if (onExpire) onExpire();
                return false;
            }

            const percentage = (remaining / 30000) * 100;
            setProgress(percentage);
            setTimeLeft(Math.ceil(remaining / 1000));
            return true;
        };

        if (calculateProgress()) {
            const interval = setInterval(calculateProgress, 1000);
            return () => clearInterval(interval);
        }
    }, [expiresAt, onExpire]);

    return (
        <>
            <div className="countdown-bar" style={{ width: `${progress}%`, background: progress < 25 ? '#ef4444' : '#fbbf24' }}></div>
            <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.5)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', color: progress < 25 ? '#ef4444' : '#fbbf24' }}>
                {timeLeft}s
            </div>
        </>
    );
};

export default RideCountdown;
