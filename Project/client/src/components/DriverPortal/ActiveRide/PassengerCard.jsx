import React from 'react';

const PassengerCard = ({ passenger, activeRide }) => {
    if (!passenger) return null;

    const passengerName = typeof passenger === 'object' && passenger.name ? passenger.name : 'Passenger';
    const initial = passengerName.charAt(0).toUpperCase();
    const rating = typeof passenger === 'object' && passenger.rating ? passenger.rating.toFixed(2) : 'New';

    return (
        <div className="passenger-card">
            <div className="passenger-avatar">
                {initial}
            </div>
            <div className="passenger-info">
                <h4 className="passenger-name">{passengerName}</h4>
                <div className="passenger-rating">
                    <i className="fas fa-star"></i>
                    <span>{rating}</span>
                </div>
            </div>
            <div className="passenger-actions">
                <button className="action-btn" aria-label="Call Passenger">
                    <i className="fas fa-phone-alt"></i>
                </button>
                <button className="action-btn" aria-label="Message Passenger">
                    <i className="fas fa-comment-alt"></i>
                </button>
            </div>
        </div>
    );
};

export default PassengerCard;
