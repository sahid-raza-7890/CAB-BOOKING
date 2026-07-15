import React from 'react';
import EmptyState from './EmptyState';

export default function SavedPlaceList({ places, onEdit, onDelete, onSetDefault }) {
    if (!places || places.length === 0) {
        return <EmptyState title="No saved places yet" message="Add your home, work, or favorite spots for quicker booking." />;
    }

    const getTypeIcon = (type, customIcon) => {
        switch(type) {
            case 'Home': return 'fa-house';
            case 'Work': return 'fa-briefcase';
            case 'Favorite': return 'fa-heart';
            default: return customIcon || 'fa-location-dot';
        }
    };

    return (
        <div className="place-list-wrapper">
            {places.map(place => (
                <div key={place._id} className="place-card">
                    <div className="place-info">
                        <div className="place-icon">
                            <i className={`fa-solid ${getTypeIcon(place.type, place.icon)}`}></i>
                        </div>
                        <div className="place-details">
                            <h4>
                                {place.label} 
                                {place.isDefault && <span className="default-badge">Default</span>}
                            </h4>
                            <p>{place.address}</p>
                        </div>
                    </div>
                    <div className="place-actions">
                        {!place.isDefault && (
                            <button className="action-btn" title="Set as Default" onClick={() => onSetDefault(place._id)}>
                                <i className="fa-solid fa-star"></i>
                            </button>
                        )}
                        <button className="action-btn" title="Edit" onClick={() => onEdit(place)}>
                            <i className="fa-solid fa-pen"></i>
                        </button>
                        <button className="action-btn delete" title="Delete" onClick={() => onDelete(place._id)}>
                            <i className="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
