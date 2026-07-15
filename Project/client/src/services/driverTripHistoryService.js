const BASE_URL = 'http://localhost:5000/api';

class DriverTripHistoryService {
    static async getHistory(options = {}) {
        const params = new URLSearchParams(options).toString();
        const res = await fetch(`${BASE_URL}/driver/history?${params}`);
        if (!res.ok) throw new Error('Failed to fetch history');
        const response = await res.json();
        const data = response.data?.data ?? response.data ?? [];
        return Array.isArray(data) ? data : [];
    }

    static async getRide(id) {
        const response = await fetch(`${BASE_URL}/driver/history/${id}`);
        if (!response.ok) throw new Error('Failed to fetch ride details');
        return response.json();
    }

    static async getInvoice(id) {
        const response = await fetch(`${BASE_URL}/driver/history/${id}/invoice`);
        if (!response.ok) throw new Error('Failed to fetch invoice');
        return response.json();
    }

    static async getAnalytics() {
        const response = await fetch(`${BASE_URL}/driver/history/analytics`);
        if (!response.ok) throw new Error('Failed to fetch analytics');
        return response.json();
    }
}

export default DriverTripHistoryService;
