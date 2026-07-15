const BASE_URL = 'http://localhost:5000/api';

class DriverReviewService {
    static async getReviews(options = {}) {
        const params = new URLSearchParams(options).toString();
        const res = await fetch(`${BASE_URL}/driver/reviews?${params}`);
        if (!res.ok) throw new Error('Failed to fetch reviews');
        const response = await res.json();
        const data = response.data?.data ?? response.data ?? [];
        return Array.isArray(data) ? data : [];
    }

    static async getReview(id) {
        const response = await fetch(`${BASE_URL}/driver/reviews/${id}`);
        if (!response.ok) throw new Error('Failed to fetch review details');
        return response.json();
    }

    static async getSummary() {
        const response = await fetch(`${BASE_URL}/driver/reviews/summary`);
        if (!response.ok) throw new Error('Failed to fetch review summary');
        return response.json();
    }

    static async submitPassengerReview(rideId, payload) {
        const response = await fetch(`${BASE_URL}/driver/reviews/${rideId}/passenger`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Failed to submit passenger review');
        return response.json();
    }
}

export default DriverReviewService;
