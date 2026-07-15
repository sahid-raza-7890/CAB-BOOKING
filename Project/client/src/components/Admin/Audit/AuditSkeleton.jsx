import React from 'react';
import './Audit.css';

const AuditSkeleton = ({ rows = 5 }) => {
  return (
    <div>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="ucab-skeleton-row"></div>
      ))}
    </div>
  );
};

export default AuditSkeleton;
