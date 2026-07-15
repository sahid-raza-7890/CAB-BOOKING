import React from 'react';
import { useDriver } from '../DriverContext';
import EarningsOverview from './EarningsOverview';
import WalletCard from './WalletCard';
import SettlementCard from './SettlementCard';
import IncentiveCard from './IncentiveCard';
import TransactionHistory from './TransactionHistory';
import IncomeChart from './IncomeChart';
import AnalyticsCard from './AnalyticsCard';
import DashboardSkeleton from './DashboardSkeleton';
import DashboardEmpty from './DashboardEmpty';
import './DriverDashboard.css';

const DriverDashboardHome = () => {
    const { dashboard, loading } = useDriver();

    if (loading) {
        return <DashboardSkeleton />;
    }

    if (!dashboard) {
        return (
            <div className="earnings-card" style={{ textAlign: 'center', padding: '40px' }}>
                <i className="fas fa-exclamation-triangle" style={{ fontSize: '48px', color: '#ff4444', marginBottom: '16px' }}></i>
                <h3>Unable to load dashboard</h3>
                <p style={{ color: '#94a3b8' }}>Please check your connection and try again.</p>
            </div>
        );
    }

    // Check if driver has any earnings yet
    const hasData = dashboard.today?.trips > 0 || dashboard.week?.trips > 0 || dashboard.month?.trips > 0;

    if (!hasData && (!dashboard.wallet || dashboard.wallet.balance === 0)) {
        return <DashboardEmpty />;
    }

    return (
        <div className="driver-earnings-dashboard">
            <div className="dashboard-row">
                <div className="dashboard-col dashboard-col-8">
                    <EarningsOverview />
                    <IncomeChart />
                    <AnalyticsCard />
                </div>
                <div className="dashboard-col dashboard-col-4">
                    <WalletCard />
                    <SettlementCard />
                    <IncentiveCard />
                    <TransactionHistory />
                </div>
            </div>
        </div>
    );
};

export default DriverDashboardHome;
