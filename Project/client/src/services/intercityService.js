// Directly use localStorage to mirror rideService pattern

const API_BASE = 'http://localhost:5000/api/rides/intercity';

const getToken = () => localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));

const headers = () => ({
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json'
});

export const getIntercityFareEstimate = async (payload) => {
    const res = await fetch(`${API_BASE}/fare-estimate`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to fetch intercity fare estimate');
    return res.json();
};
