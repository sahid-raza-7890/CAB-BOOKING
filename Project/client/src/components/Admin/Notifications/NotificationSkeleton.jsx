import React from 'react';

const NotificationSkeleton = () => {
  return (
    <div className="glass-panel" style={{ padding: '0' }}>
      {[1, 2, 3].map(i => (
        <div key={i} className="list-item">
          <div style={{ flex: 1 }}>
            <div className="skeleton-pulse" style={{ height: '20px', width: '200px', marginBottom: '8px' }}></div>
            <div className="skeleton-pulse" style={{ height: '14px', width: '150px' }}></div>
          </div>
          <div className="skeleton-pulse" style={{ height: '32px', width: '80px', borderRadius: '16px' }}></div>
        </div>
      ))}
    </div>
  );
};

export default NotificationSkeleton;
