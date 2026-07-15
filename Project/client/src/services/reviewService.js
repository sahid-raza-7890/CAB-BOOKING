const API_BASE = 'http://localhost:5000/api/reviews';

const getToken = () => localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));

const headers = () => ({
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json'
});

const reviewService = {
    submitReview: async (reviewData) => {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify(reviewData)
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to submit review');
        }
        return response.json();
    },

    getPassengerReviews: async (queryParams = {}) => {
        const query = new URLSearchParams(queryParams).toString();
        const response = await fetch(`${API_BASE}?${query}`, { headers: headers() });
        if (!response.ok) throw new Error('Failed to fetch reviews');
        return response.json();
    },

    getReviewByRideId: async (rideId) => {
        const response = await fetch(`${API_BASE}/ride/${rideId}`, { headers: headers() });
        if (!response.ok) throw new Error('Failed to fetch review');
        return response.json();
    },

    editReview: async (reviewId, reviewData) => {
        const response = await fetch(`${API_BASE}/${reviewId}`, {
            method: 'PUT',
            headers: headers(),
            body: JSON.stringify(reviewData)
        });
        if (!response.ok) throw new Error('Failed to update review');
        return response.json();
    },

    deleteReview: async (reviewId) => {
        const response = await fetch(`${API_BASE}/${reviewId}`, {
            method: 'DELETE',
            headers: headers()
        });
        if (!response.ok) throw new Error('Failed to delete review');
        return response.json();
    },

    reportReview: async (reviewId) => {
        const response = await fetch(`${API_BASE}/${reviewId}/report`, {
            method: 'POST',
            headers: headers()
        });
        if (!response.ok) throw new Error('Failed to report review');
        return response.json();
    }
};

export default reviewService;
