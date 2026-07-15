import React from 'react';
import './Common.css';

export default function Skeleton({ width = '100%', height = '20px', style = {} }) {
  return (
    <div 
      className="skeleton-loader" 
      style={{ width, height, ...style }}
      role="status"
      aria-label="Loading..."
    />
  );
}
