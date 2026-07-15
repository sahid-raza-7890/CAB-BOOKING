import React from 'react';
import ReviewCard from './ReviewCard';

export default function ReviewList({ reviews, onDelete }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reviews.map(review => (
                <ReviewCard 
                    key={review._id} 
                    review={review} 
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}
