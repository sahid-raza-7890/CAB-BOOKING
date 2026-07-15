import React from 'react';
import { useDriver } from '../DriverContext';
import TripHistoryCard from './TripHistoryCard';
import TripHistoryEmpty from './TripHistoryEmpty';

const TripHistoryList = () => {
    const { tripHistory, tripFilters, setTripFilters, loading } = useDriver();

    const handleSearch = (e) => {
        setTripFilters({ ...tripFilters, search: e.target.value, page: 1 });
    };

    const handleStatusFilter = (e) => {
        setTripFilters({ ...tripFilters, status: e.target.value, page: 1 });
    };

    const hasSearch = tripFilters.search !== '' || tripFilters.status !== '';

    return (
        <div className="history-card" style={{ padding: '20px' }}>
            <h3 className="section-title" style={{ marginBottom: '16px' }}>Trip History</h3>
            
            <div className="filter-bar">
                <input 
                    type="text" 
                    className="search-input" 
                    placeholder="Search locations or passenger..." 
                    value={tripFilters.search}
                    onChange={handleSearch}
                />
                <select className="filter-select" value={tripFilters.status} onChange={handleStatusFilter}>
                    <option value="">All Statuses</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>

            {loading ? (
                <div className="trip-list">
                    {[1, 2, 3].map(i => <div key={i} className="skeleton-pulse skeleton-card" style={{ height: '80px' }}></div>)}
                </div>
            ) : tripHistory.length === 0 ? (
                <TripHistoryEmpty hasSearch={hasSearch} />
            ) : (
                <div className="trip-list">
                    {tripHistory.map(ride => (
                        <TripHistoryCard key={ride._id} ride={ride} />
                    ))}
                </div>
            )}
            
            {/* Pagination controls would go here (e.g. Next/Prev buttons) */}
        </div>
    );
};

export default TripHistoryList;
