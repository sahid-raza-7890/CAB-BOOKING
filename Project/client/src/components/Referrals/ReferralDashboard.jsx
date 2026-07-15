import React, { useState, useEffect } from 'react';
import { referralService } from '../../services/referralService';
import ReferralSkeleton from './ReferralSkeleton';
import ReferralStats from './ReferralStats';
import ReferralHistory from './ReferralHistory';
import InviteFriends from './InviteFriends';
import ShareReferral from './ShareReferral';
import RewardProgress from './RewardProgress';
import ReferralCard from './ReferralCard';
import './Referral.css';

const ReferralDashboard = () => {
    const [data, setData] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            const dashboardData = await referralService.getDashboard();
            const historyData = await referralService.getHistory();
            setData(dashboardData);
            setHistory(historyData.history || []);
        } catch (error) {
            console.error("Failed to load referral data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    if (loading || !data) return <ReferralSkeleton />;

    const { code, stats } = data;

    return (
        <div className="referral-container">
            <div className="referral-header">
                <h1>Invite Friends & Earn</h1>
                <p>Share your unique code. Earn ₹15 for every friend who completes a ride!</p>
            </div>

            <div className="referral-stats-grid" style={{ marginBottom: '1rem' }}>
                <ReferralCard title="Earn Cash" description="Get ₹15 directly in your Wallet" icon="💸" />
                <ReferralCard title="Share Easy" description="One-click sharing with friends" icon="🔗" />
            </div>

            <ReferralStats stats={stats} />

            <div className="referral-actions-grid">
                <ShareReferral code={code.code} />
                <InviteFriends onApplySuccess={loadData} />
            </div>

            <div className="referral-actions-grid" style={{ gridTemplateColumns: '1fr' }}>
                {stats.pending > 0 && <RewardProgress pendingCount={stats.pending} />}
                <ReferralHistory history={history} />
            </div>
        </div>
    );
};

export default ReferralDashboard;
