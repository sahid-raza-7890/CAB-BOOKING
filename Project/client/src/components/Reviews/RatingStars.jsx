import React from 'react';

export default function RatingStars({ rating, interactive = false, onHover, onClick }) {
    const stars = [1, 2, 3, 4, 5];

    return (
        <div className="star-rating">
            {stars.map(star => {
                const isFilled = star <= rating;
                const className = interactive 
                    ? `interactive-star ${isFilled ? 'filled' : 'empty'}`
                    : `fa-solid fa-star ${isFilled ? 'filled' : ''}`;
                
                return interactive ? (
                    <i 
                        key={star} 
                        className={`fa-solid fa-star ${className}`}
                        onMouseEnter={() => onHover && onHover(star)}
                        onMouseLeave={() => onHover && onHover(0)}
                        onClick={() => onClick && onClick(star)}
                    ></i>
                ) : (
                    <i key={star} className={className}></i>
                );
            })}
        </div>
    );
}
