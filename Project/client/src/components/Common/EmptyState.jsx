import React from 'react';
import './Common.css';

export default function EmptyState({ title = 'No Data', message = 'There is nothing to show here.', onRetry = null, retryText = 'Retry' }) {
  return (
    <div className="empty-state" role="region" aria-label={title}>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-message">{message}</p>
      {onRetry && (
        <button className="empty-retry-btn" onClick={onRetry} aria-label={retryText}>
          {retryText}
        </button>
      )}
    </div>
  );
}
