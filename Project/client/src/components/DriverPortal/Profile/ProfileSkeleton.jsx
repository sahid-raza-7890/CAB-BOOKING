import React from 'react';

export const ProfileSkeleton = () => (
    <div className="profile-dashboard">
        <div className="skeleton-pulse" style={{ height: '80px', borderRadius: '12px', marginBottom: '24px' }}></div>
        <div className="profile-grid">
            <div className="profile-panel" style={{ height: '300px' }}>
                <div className="skeleton-pulse" style={{ height: '24px', width: '40%', marginBottom: '24px' }}></div>
                <div className="skeleton-pulse" style={{ height: '100px', borderRadius: '12px', marginBottom: '16px' }}></div>
                <div className="skeleton-pulse" style={{ height: '100px', borderRadius: '12px' }}></div>
            </div>
            <div className="profile-panel" style={{ height: '300px' }}>
                <div className="skeleton-pulse" style={{ height: '24px', width: '40%', marginBottom: '24px' }}></div>
                <div className="skeleton-pulse" style={{ height: '60px', borderRadius: '12px', marginBottom: '16px' }}></div>
                <div className="skeleton-pulse" style={{ height: '60px', borderRadius: '12px', marginBottom: '16px' }}></div>
                <div className="skeleton-pulse" style={{ height: '60px', borderRadius: '12px' }}></div>
            </div>
        </div>
    </div>
);

export const ProfileEmpty = ({ message }) => (
    <div className="profile-panel" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <div className="analytics-icon" style={{ width: '80px', height: '80px', fontSize: '32px', marginBottom: '16px' }}>
            <i className="fas fa-folder-open"></i>
        </div>
        <h3 style={{ fontSize: '20px', margin: '0 0 8px 0', color: '#fff' }}>No Data Found</h3>
        <p style={{ color: '#94a3b8', margin: 0 }}>{message || 'Nothing to display here yet.'}</p>
    </div>
);
