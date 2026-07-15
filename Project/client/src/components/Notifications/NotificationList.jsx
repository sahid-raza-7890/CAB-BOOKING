import React from 'react';
import NotificationCard from './NotificationCard';
import NotificationEmpty from './NotificationEmpty';
import NotificationSkeleton from './NotificationSkeleton';

export default function NotificationList({ notifications, loading, hasMore, onLoadMore, onMarkRead, onDelete }) {
    
    const handleScroll = (e) => {
        const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
        if (bottom && hasMore && !loading) {
            onLoadMore();
        }
    };

    if (loading && notifications.length === 0) {
        return (
            <div className="notification-list">
                {[1, 2, 3, 4, 5].map(n => <NotificationSkeleton key={n} />)}
            </div>
        );
    }

    if (!loading && notifications.length === 0) {
        return <NotificationEmpty />;
    }

    return (
        <div className="notification-list" onScroll={handleScroll}>
            {notifications.map(notification => (
                <NotificationCard 
                    key={notification._id} 
                    notification={notification} 
                    onMarkRead={onMarkRead}
                    onDelete={onDelete}
                />
            ))}
            {loading && <NotificationSkeleton />}
        </div>
    );
}
