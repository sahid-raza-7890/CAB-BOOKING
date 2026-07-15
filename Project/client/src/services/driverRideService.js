// Assuming global fetch intercepted by api.js handles Authorization headers.
// However, wait, in DriverContext.jsx, I passed the Authorization header explicitly. 
// I'll use standard fetch with explicit token for safety or assume it's passed.
// I will create an API class for driver rides.

export class DriverRideService {
    static async getPendingRequests(token) {
        const res = await fetch('http://localhost:5000/api/driver/rides/pending', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!res.ok) throw new Error('Failed to fetch pending requests');
        const response = await res.json();
        const data = response.data?.data ?? response.data ?? [];
        return Array.isArray(data) ? data : [];
    }

    static async acceptRide(dispatchId, token) {
        const response = await fetch(`http://localhost:5000/api/driver/rides/${dispatchId}/accept`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to accept ride');
        return response.json();
    }

    static async rejectRide(dispatchId, token) {
        const response = await fetch(`http://localhost:5000/api/driver/rides/${dispatchId}/reject`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) throw new Error('Failed to reject ride');
        return response.json();
    }
}
