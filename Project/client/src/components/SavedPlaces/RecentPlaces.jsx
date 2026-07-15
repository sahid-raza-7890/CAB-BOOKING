import React from 'react';
import EmptyState from './EmptyState';

export default function RecentPlaces({ places, onSaveAsFavorite }) {
    if (!places || places.length === 0) {
        return <EmptyState title="No recent places" message="Your recent ride destinations will appear here." />;
    }

    return (
        <div className="recent-places-list">
            {places.map(place => (
                <div key={place._id} className="place-card" style={{ padding: '0.75rem 1rem' }}>
                    <div className="place-info">
                        <div className="place-icon" style={{ background: 'rgba(255,255,255,0.05)', color: '#888', width: '32px', height: '32px', fontSize: '0.9rem' }}>
                            <i className="fa-solid fa-clock-rotate-left"></i>
                        </div>
                        <div className="place-details">
                            <h4 style={{ fontSize: '0.9rem' }}>{place.address.split(',')[0]}</h4>
                            <p style={{ fontSize: '0.75rem' }}>{place.address}</p>
                        </div>
                    </div>
                    <div className="place-actions">
                        <button 
                            className="action-btn" 
                            title="Save as Favorite" 
                            onClick={() => onSaveAsFavorite({ ...place, type: 'Custom' })}
                        >
                            <i className="fa-solid fa-star"></i>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
