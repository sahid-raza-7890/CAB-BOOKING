import React, { useState, useEffect, useContext, useCallback } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from '../../context/AuthContext';
import reviewService from '../../services/reviewService';
import ReviewList from './ReviewList';
import ReviewFilters from './ReviewFilters';
import ReviewSkeleton from './ReviewSkeleton';
import ReviewEmpty from './ReviewEmpty';

export default function ReviewsDashboard() {
    const { user, authenticated } = useContext(AuthContext);
    
    const [reviews, setReviews] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    
    const [filters, setFilters] = useState({
        sort: 'newest'
    });

    const fetchReviews = useCallback(async (isLoadMore = false) => {
        try {
            if (isLoadMore) setLoadingMore(true);
            else setLoading(true);

            const res = await reviewService.getPassengerReviews({
                ...filters,
                page: isLoadMore ? page + 1 : 1,
                limit: 10
            });

            if (isLoadMore) {
                setReviews(prev => [...prev, ...res.data.reviews]);
                setPage(prev => prev + 1);
            } else {
                setReviews(res.data.reviews || []);
                setPage(1);
            }

            setTotal(res.data.total || 0);
            setHasMore((isLoadMore ? page + 1 : 1) < (res.data.pages || 1));
        } catch (error) {
            console.error("Failed to fetch reviews", error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [filters, page]);

    useEffect(() => {
        if (!authenticated || !user) return;
        fetchReviews();

        const socket = io('http://localhost:5000');
        socket.emit('register', user.userId || user.id);
        
        socket.on('reviewUpdated', () => {
            fetchReviews(); // Refresh quietly if one of my reviews was updated/deleted
        });

        return () => {
            socket.off('reviewUpdated');
            socket.disconnect();
        };
    }, [authenticated, user, filters]);

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const handleDelete = async (reviewId) => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            try {
                await reviewService.deleteReview(reviewId);
                fetchReviews(); // Refresh
            } catch (e) {
                alert('Failed to delete review');
            }
        }
    };

    return (
        <div className="reviews-container">
            <div className="reviews-header">
                <h1><i className="fa-solid fa-star"></i> My Reviews</h1>
            </div>

            <div className="reviews-layout">
                {/* Main List Column */}
                <div className="reviews-list-col">
                    {loading ? (
                        <ReviewSkeleton count={4} />
                    ) : reviews.length === 0 ? (
                        <ReviewEmpty />
                    ) : (
                        <>
                            <ReviewList reviews={reviews} onDelete={handleDelete} />
                            
                            {hasMore && (
                                <button 
                                    className="btn-outline" 
                                    style={{ margin: '1rem auto', display: 'block' }}
                                    onClick={() => fetchReviews(true)}
                                    disabled={loadingMore}
                                >
                                    {loadingMore ? 'Loading...' : 'Load More Reviews'}
                                </button>
                            )}
                        </>
                    )}
                </div>

                {/* Filters Sidebar */}
                <div className="reviews-sidebar-col">
                    <ReviewFilters filters={filters} onChange={handleFilterChange} totalCount={total} />
                </div>
            </div>
        </div>
    );
}
