import React, { useState, useEffect } from 'react';
import { passengerApiService } from '../../../services/passengerApiService';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await passengerApiService.getReviews();
      setReviews(data.data || data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    background: 'rgba(30, 41, 59, 0.7)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 210, 31, 0.2)',
    borderRadius: '16px',
    padding: '2rem',
    width: '100%',
    maxWidth: '600px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    margin: '0 auto'
  };

  if (loading) return <div style={containerStyle}>Loading reviews...</div>;

  return (
    <div style={containerStyle}>
      <h2 style={{ color: '#FFD21F', textAlign: 'center', marginBottom: '1.5rem' }}>My Reviews</h2>
      
      {error && <div style={{ color: '#EF4444', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

      {reviews.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#94A3B8' }}>You haven't left any reviews yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {reviews.map((review) => (
            <div 
              key={review._id || review.id} 
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '1rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h4 style={{ margin: 0, color: '#fff' }}>Ride: {review.rideId}</h4>
                <div style={{ color: '#FFD21F', fontWeight: 'bold' }}>
                  {'★'.repeat(Math.round(review.rating || 5)) + '☆'.repeat(5 - Math.round(review.rating || 5))}
                </div>
              </div>
              <p style={{ margin: 0, color: '#94A3B8', fontSize: '0.9rem', fontStyle: 'italic' }}>
                "{review.comment || 'No comment provided.'}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;
