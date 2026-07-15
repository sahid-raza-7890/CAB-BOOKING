const API_BASE = 'http://localhost:5000/api/safety';

const getToken = () => localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));

const headers = () => ({
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json'
});

const safetyService = {
    getAlerts: async () => {
        const response = await fetch(API_BASE, { headers: headers() });
        if (!response.ok) throw new Error('Failed to fetch safety alerts');
        return response.json();
    },

    getAlert: async (alertId) => {
        const response = await fetch(`${API_BASE}/${alertId}`, { headers: headers() });
        if (!response.ok) throw new Error('Failed to fetch alert details');
        return response.json();
    },

    createAlert: async (alertData) => {
        const response = await fetch(`${API_BASE}/alert`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify(alertData)
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to trigger safety alert');
        }
        return response.json();
    },

    cancelAlert: async (alertId) => {
        const response = await fetch(`${API_BASE}/${alertId}/cancel`, {
            method: 'PUT',
            headers: headers()
        });
        if (!response.ok) throw new Error('Failed to cancel alert');
        return response.json();
    },

    resolveAlert: async (alertId) => {
        const response = await fetch(`${API_BASE}/${alertId}/resolve`, {
            method: 'PUT',
            headers: headers()
        });
        if (!response.ok) throw new Error('Failed to resolve alert');
        return response.json();
    },

    shareLiveRide: async (rideId, contacts) => {
        const response = await fetch(`${API_BASE}/share`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({ rideId, contacts })
        });
        if (!response.ok) throw new Error('Failed to share live ride');
        return response.json();
    }
};

export default safetyService;
