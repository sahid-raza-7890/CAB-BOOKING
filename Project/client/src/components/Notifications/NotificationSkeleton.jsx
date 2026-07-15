import React from 'react';

export default function NotificationSkeleton() {
    return (
        <div className="skeleton-card">
            <div className="skeleton-icon"></div>
            <div style={{ flex: 1 }}>
                <div className="skeleton-line"></div>
                <div className="skeleton-line short"></div>
            </div>
        </div>
    );
}
