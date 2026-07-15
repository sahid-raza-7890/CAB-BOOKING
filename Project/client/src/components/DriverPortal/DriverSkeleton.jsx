import React from 'react';

const DriverSkeleton = () => {
    return (
        <div className="dashboard-grid">
            <div className="dashboard-card col-span-12 skeleton-pulse" style={{ height: '100px' }}></div>
            <div className="dashboard-card col-span-4 skeleton-pulse" style={{ height: '150px' }}></div>
            <div className="dashboard-card col-span-4 skeleton-pulse" style={{ height: '150px' }}></div>
            <div className="dashboard-card col-span-4 skeleton-pulse" style={{ height: '150px' }}></div>
            <div className="dashboard-card col-span-8 skeleton-pulse" style={{ height: '300px' }}></div>
            <div className="dashboard-card col-span-4 skeleton-pulse" style={{ height: '300px' }}></div>
        </div>
    );
};

export default DriverSkeleton;
