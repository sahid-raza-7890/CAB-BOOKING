const API_BASE = 'http://localhost:5000/api/saved-places';

const getToken = () => localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));

const headers = () => ({
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json'
});

const savedPlaceService = {
    getPlaces: async () => {
        const response = await fetch(API_BASE, { headers: headers() });
        if (!response.ok) throw new Error('Failed to fetch saved places');
        return response.json();
    },

    getRecentPlaces: async () => {
        const response = await fetch(`${API_BASE}/recent`, { headers: headers() });
        if (!response.ok) throw new Error('Failed to fetch recent places');
        return response.json();
    },

    createPlace: async (data) => {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to create saved place');
        }
        return response.json();
    },

    updatePlace: async (id, data) => {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'PUT',
            headers: headers(),
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to update saved place');
        }
        return response.json();
    },

    deletePlace: async (id) => {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'DELETE',
            headers: headers()
        });
        if (!response.ok) throw new Error('Failed to delete saved place');
        return response.json();
    },

    setDefault: async (id) => {
        const response = await fetch(`${API_BASE}/${id}/default`, {
            method: 'PUT',
            headers: headers()
        });
        if (!response.ok) throw new Error('Failed to set default place');
        return response.json();
    }
};

export default savedPlaceService;
