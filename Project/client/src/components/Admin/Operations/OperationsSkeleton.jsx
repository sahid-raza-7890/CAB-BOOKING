import React from 'react';
import './Operations.css';

const OperationsSkeleton = ({ rows = 3 }) => {
  return (
    <div className="skeleton-state" style={{ flexDirection: 'column', gap: '12px', width: '100%', alignItems: 'stretch' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-box" style={{ height: '20px', width: `${Math.random() * 40 + 60}%` }} />
      ))}
    </div>
  );
};

export default OperationsSkeleton;
