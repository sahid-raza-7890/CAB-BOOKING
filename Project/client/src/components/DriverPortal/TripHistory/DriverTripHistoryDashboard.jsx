import React, { useEffect } from 'react';
import { useDriver } from '../DriverContext';
import DriverTripHistoryService from '../../../services/driverTripHistoryService';
import TripHistoryList from './TripHistoryList';
import TripDetails from './TripDetails';
import TripAnalytics from './TripAnalytics';
import TripHistorySkeleton from './TripHistorySkeleton';
import './TripHistory.css';

const DriverTripHistoryDashboard = () => {
    const { 
        tripHistory, 
        setTripHistory, 
        tripFilters, 
        setTripAnalytics, 
        loading, 
        user, 
        token 
    } = useDriver();

    const [isInitialLoad, setIsInitialLoad] = React.useState(true);

    useEffect(() => {
        const fetchHistoryAndAnalytics = async () => {
            if (!token) return;
            try {
                const [historyRes, analyticsRes] = await Promise.all([
                    DriverTripHistoryService.getHistory(tripFilters),
                    DriverTripHistoryService.getAnalytics()
                ]);
                
                if (historyRes.success) {
                    setTripHistory(historyRes.rides);
                }
                
                if (analyticsRes.success) {
                    setTripAnalytics(analyticsRes.data);
                }
            } catch (error) {
                console.error("Failed to fetch trip history or analytics", error);
            } finally {
                setIsInitialLoad(false);
            }
        };

        fetchHistoryAndAnalytics();
    }, [tripFilters, token, setTripHistory, setTripAnalytics]);

    if (loading || isInitialLoad) {
        return <TripHistorySkeleton />;
    }

    return (
        <div className="trip-history-dashboard">
            <TripAnalytics />
            <div className="history-grid">
                <TripHistoryList />
                <TripDetails />
            </div>
        </div>
    );
};

export default DriverTripHistoryDashboard;
