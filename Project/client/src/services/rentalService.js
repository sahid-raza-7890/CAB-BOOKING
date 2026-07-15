const API_BASE = 'http://localhost:5000/api/rides/rentals';

const getToken = () => localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));

const headers = () => ({
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json'
});

export const getRentalFareEstimate = async (payload) => {
    const res = await fetch(`${API_BASE}/fare-estimate`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to fetch rental fare estimate');
    return res.json();
};
