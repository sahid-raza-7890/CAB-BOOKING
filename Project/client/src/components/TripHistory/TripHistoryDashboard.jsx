import React, { useState, useEffect, useContext, useCallback } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from '../../context/AuthContext';
import tripHistoryService from '../../services/tripHistoryService';
import RideHistoryList from './RideHistoryList';
import FilterPanel from './FilterPanel';
import Skeleton from './Skeleton';
import EmptyState from './EmptyState';

export default function TripHistoryDashboard() {
    const { user, authenticated } = useContext(AuthContext);
    
    const [rides, setRides] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    
    const [filters, setFilters] = useState({
        status: 'Active',
        days: 'All',
        vehicleType: 'All',
        sort: 'newest'
    });

    const fetchHistory = useCallback(async (isLoadMore = false) => {
        try {
            if (isLoadMore) setLoadingMore(true);
            else setLoading(true);

            const res = await tripHistoryService.getRideHistory({
                ...filters,
                page: isLoadMore ? page + 1 : 1,
                limit: 10
            });

            const payload = res.data || res;
            if (isLoadMore) {
                setRides(prev => [...prev, ...(payload.rides || [])]);
                setPage(prev => prev + 1);
            } else {
                setRides(payload.rides || []);
                setPage(1);
            }

            setTotal(payload.total || 0);
            setHasMore((isLoadMore ? page + 1 : 1) < (payload.pages || 1));
        } catch (error) {
            console.error("Failed to fetch ride history", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [filters, page]);

    useEffect(() => {
        if (!authenticated || !user) return;
        fetchHistory();

        // Reusing existing socket.io server connection
        const socket = io('http://localhost:5000');
        socket.emit('register', user.userId || user.id);
        
        socket.on('rideUpdated', () => {
            fetchHistory(); // Refresh quietly
        });

        return () => {
            socket.off('rideUpdated');
            socket.disconnect();
        };
    }, [authenticated, user, filters]); // re-run when filters change

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    return (
        <div className="trip-history-container">
            <div className="trip-history-header">
                <h1><i className="fa-solid fa-clock-rotate-left"></i> Trip History</h1>
            </div>

            <div className="trip-history-layout">
                {/* Main List Column */}
                <div className="trip-list-col">
                    {loading ? (
                        <Skeleton count={4} />
                    ) : rides.length === 0 ? (
                        <EmptyState title="No rides found" message="You have no rides matching the selected filters." />
                    ) : (
                        <>
                            <RideHistoryList rides={rides} />
                            
                            {hasMore && (
                                <button 
                                    className="btn-outline" 
                                    style={{ margin: '1rem auto', display: 'block' }}
                                    onClick={() => fetchHistory(true)}
                                    disabled={loadingMore}
                                >
                                    {loadingMore ? 'Loading...' : 'Load More Rides'}
                                </button>
                            )}
                        </>
                    )}
                </div>

                {/* Filters Sidebar */}
                <div className="trip-filters-col">
                    <FilterPanel filters={filters} onChange={handleFilterChange} totalCount={total} />
                </div>
            </div>
        </div>
    );
}
