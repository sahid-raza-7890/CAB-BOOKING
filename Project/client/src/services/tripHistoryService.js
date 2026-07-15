const API_BASE = 'http://localhost:5000/api/history';

const getToken = () => localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));

const headers = () => ({
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json'
});

const tripHistoryService = {
    getRideHistory: async (queryParams = {}) => {
        const query = new URLSearchParams(queryParams).toString();
        const response = await fetch(`${API_BASE}?${query}`, { headers: headers() });
        if (!response.ok) throw new Error('Failed to fetch ride history');
        return response.json();
    },

    getRideDetails: async (rideId) => {
        const response = await fetch(`${API_BASE}/${rideId}`, { headers: headers() });
        if (!response.ok) throw new Error('Failed to fetch ride details');
        return response.json();
    },

    generateInvoice: async (rideId) => {
        const response = await fetch(`${API_BASE}/${rideId}/invoice`, { headers: headers() });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to generate invoice');
        }
        return response.json();
    },

    rebookRide: async (rideId) => {
        const response = await fetch(`${API_BASE}/${rideId}/rebook`, {
            method: 'POST',
            headers: headers()
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to rebook ride');
        }
        return response.json();
    },

    attachSupportTicket: async (rideId, ticketData) => {
        const response = await fetch(`${API_BASE}/${rideId}/support`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify(ticketData)
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to submit support ticket');
        }
        return response.json();
    }
};

export default tripHistoryService;
