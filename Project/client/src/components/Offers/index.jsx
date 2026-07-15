import React, { useState, useEffect } from 'react';
import './Offers.css';
import OffersDashboard from './OffersDashboard';
import RewardDashboard from './RewardDashboard';
import { fetchAvailableCoupons, fetchLoyaltyStatus, fetchRewardHistory } from '../../services/offerService';

export default function OffersModule() {
    const [coupons, setCoupons] = useState([]);
    const [loyaltyAccount, setLoyaltyAccount] = useState(null);
    const [rewardHistory, setRewardHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const cData = await fetchAvailableCoupons();
                setCoupons(cData.coupons || []);

                const lData = await fetchLoyaltyStatus();
                setLoyaltyAccount(lData.account);

                const hData = await fetchRewardHistory();
                setRewardHistory(hData.history || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return <div style={{ color: '#fff', padding: '40px', textAlign: 'center' }}>Loading Offers & Rewards...</div>;
    }

    return (
        <div className="off-container">
            <div className="off-main-col">
                <OffersDashboard coupons={coupons} />
            </div>
            <div className="off-right-col">
                <RewardDashboard account={loyaltyAccount} history={rewardHistory} />
            </div>
        </div>
    );
}
