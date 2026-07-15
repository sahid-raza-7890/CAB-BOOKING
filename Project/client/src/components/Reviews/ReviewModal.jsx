import React, { useState } from 'react';
import { motion } from 'framer-motion';
import reviewService from '../../services/reviewService';
import RatingStars from './RatingStars';
import CategoryRatings from './CategoryRatings';
import ReviewTags from './ReviewTags';

export default function ReviewModal({ rideId, driver, existingReview, onClose }) {
    const [overallRating, setOverallRating] = useState(existingReview?.overallRating || 0);
    const [hoverRating, setHoverRating] = useState(0);
    
    const [ratings, setRatings] = useState(existingReview?.ratings || {
        driving: 5, cleanliness: 5, behavior: 5, punctuality: 5, vehicleCondition: 5
    });
    
    const [reviewText, setReviewText] = useState(existingReview?.review || '');
    const [tags, setTags] = useState(existingReview?.tags || []);
    const [isAnonymous, setIsAnonymous] = useState(existingReview?.isAnonymous || false);
    
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (overallRating === 0) {
            setError("Please provide an overall rating first.");
            return;
        }

        const payload = {
            rideId,
            overallRating,
            ratings,
            review: reviewText,
            tags,
            isAnonymous
        };

        try {
            setSaving(true);
            if (existingReview) {
                await reviewService.editReview(existingReview._id, payload);
            } else {
                await reviewService.submitReview(payload);
            }
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to submit review');
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <motion.div 
                className="modal-content"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h2 style={{ margin: 0, color: '#e5b05c', fontSize: '1.25rem' }}>
                        {existingReview ? 'Edit Review' : 'Rate Your Ride'}
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.2rem' }}>
                        <i className="fa-solid fa-times"></i>
                    </button>
                </div>

                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {error && <div style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px' }}>{error}</div>}

                    {driver && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center', marginBottom: '1rem' }}>
                            <div className="driver-avatar" style={{ width: 60, height: 60, fontSize: '1.5rem' }}>
                                <i className="fa-solid fa-user"></i>
                            </div>
                            <div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{driver.name}</div>
                                <div style={{ color: '#888' }}>Driver</div>
                            </div>
                        </div>
                    )}

                    <div style={{ textAlign: 'center' }}>
                        <h3 style={{ margin: '0 0 1rem 0' }}>Overall Rating</h3>
                        <RatingStars 
                            rating={hoverRating || overallRating} 
                            interactive={true} 
                            onHover={setHoverRating} 
                            onClick={setOverallRating} 
                        />
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '0.5rem 0' }}></div>

                    <div>
                        <h4 style={{ margin: '0 0 1rem 0', color: '#ccc' }}>Detailed Ratings</h4>
                        <CategoryRatings ratings={ratings} onChange={setRatings} />
                    </div>

                    <ReviewTags tags={tags} onChange={setTags} />

                    <div>
                        <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: '#ccc' }}>Written Review (Optional)</label>
                        <textarea 
                            className="form-control" 
                            rows="4" 
                            placeholder="Tell us about your experience..."
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                        ></textarea>
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: '#ccc', fontSize: '0.9rem' }}>
                        <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />
                        Submit anonymously (driver won't see your name)
                    </label>

                </div>

                <div className="modal-footer">
                    <button className="btn-outline" onClick={onClose} disabled={saving}>Cancel</button>
                    <button className="btn-primary" onClick={handleSubmit} disabled={saving || overallRating === 0}>
                        {saving ? 'Saving...' : (existingReview ? 'Update Review' : 'Submit Review')}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
