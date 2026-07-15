export const getScheduledRides = async () => {
    const token = localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));
    const response = await fetch('http://localhost:5000/api/rides/scheduled', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch scheduled rides');
    return await response.json();
};

export const cancelScheduledRide = async (rideId) => {
    const token = localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));
    const response = await fetch(`http://localhost:5000/api/rides/scheduled/${rideId}/cancel`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to cancel scheduled ride');
    return await response.json();
};
