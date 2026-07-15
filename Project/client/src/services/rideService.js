const API_BASE = 'http://localhost:5000/api/rides';

const getToken = () => localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));

const headers = () => ({
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json'
});

export const getActiveRide = async () => {
    const res = await fetch(`${API_BASE}/my/active`, { headers: headers() });
    if (!res.ok) throw new Error('Failed to fetch active ride');
    const json = await res.json();
    return json.data || json;
};

export const getMyRides = async (params = {}) => {
    const search = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/my?${search}`, { headers: headers() });
    if (!res.ok) throw new Error('Failed to fetch rides');
    const json = await res.json();
    return json.data || json;
};

export const getRideDetails = async (rideId) => {
    const res = await fetch(`${API_BASE}/${rideId}`, { headers: headers() });
    if (!res.ok) throw new Error('Failed to fetch ride details');
    const json = await res.json();
    return json.data || json;
};

export const cancelRide = async (rideId, reason) => {
    const res = await fetch(`${API_BASE}/${rideId}/cancel`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify({ reason })
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to cancel ride');
    }
    return res.json();
};

export const rateRide = async (rideId, ratingData) => {
    const res = await fetch(`${API_BASE}/${rideId}/rating`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(ratingData)
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to submit rating');
    }
    return res.json();
};

export const getReceipt = async (rideId) => {
    const res = await fetch(`${API_BASE}/${rideId}/receipt`, { headers: headers() });
    if (!res.ok) throw new Error('Failed to fetch receipt');
    return res.json();
};
