import React, { useState } from 'react';
import BadgeComponent from './BadgeComponent';
import { getUserBadges } from '../../utils/BadgeManager';

const TrustDashboard = () => {
    // Mock user stats for demonstrating the badge system
    const [userStats] = useState({
        totalRides: 12,
        nightRides: 3,
        ecoRides: 6
    });

    const unlockedBadges = getUserBadges(userStats);

    return (
        <div className="grid grid-cols-1 gap-6">
            <h2 className="text-xl font-bold mb-2">Trust & Loyalty</h2>
            {/* Safety Ticker */}
            <div className="premium-glass p-6 text-center rounded-2xl">
                <h3 className="text-[#FFD700] font-bold text-2xl">99.9% Safe</h3>
                <p className="text-sm text-gray-400 mt-1">Rides completed securely</p>
            </div>
            {/* Carbon Offset */}
            <div className="premium-glass p-6 text-center rounded-2xl">
                <h3 className="text-[#FFD700] font-bold text-2xl">450kg CO2</h3>
                <p className="text-sm text-gray-400 mt-1">Saved by EV fleet today</p>
            </div>
            {/* Elite Tier */}
            <div className="premium-glass p-6 text-center rounded-2xl">
                <h3 className="text-[#FFD700] font-bold text-2xl">Gold Member</h3>
                <p className="text-sm text-gray-400 mt-1 mb-3">250 points to Platinum</p>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#FFD700] w-3/4"></div>
                </div>
            </div>
            
            {/* User Badges */}
            <BadgeComponent badges={unlockedBadges} />
        </div>
    );
};
export default TrustDashboard;
