export class DriverActiveRideService {
    static async arriveAtPickup(rideId, token) {
        const response = await fetch(`http://localhost:5000/api/driver/active/${rideId}/arrive`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({})
        });
        if (!response.ok) throw new Error('Failed to arrive');
        return response.json();
    }

    static async verifyOTP(rideId, otp, token) {
        const response = await fetch(`http://localhost:5000/api/driver/active/${rideId}/verify-otp`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ otp })
        });
        if (!response.ok) throw new Error('Failed to verify OTP');
        return response.json();
    }

    static async startRide(rideId, token) {
        const response = await fetch(`http://localhost:5000/api/driver/active/${rideId}/start`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });
        if (!response.ok) throw new Error('Failed to start ride');
        return response.json();
    }

    static async updateLocation(rideId, location, token) {
        const response = await fetch(`http://localhost:5000/api/driver/active/${rideId}/location`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ location })
        });
        if (!response.ok) throw new Error('Failed to update location');
        return response.json();
    }

    static async completeRide(rideId, token) {
        const response = await fetch(`http://localhost:5000/api/driver/active/${rideId}/complete`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({})
        });
        if (!response.ok) throw new Error('Failed to complete ride');
        return response.json();
    }

    static async cancelRide(rideId, reason, token) {
        const response = await fetch(`http://localhost:5000/api/driver/active/${rideId}/cancel`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ reason })
        });
        if (!response.ok) throw new Error('Failed to cancel ride');
        return response.json();
    }

    static async getActiveRide(token) {
        const response = await fetch('http://localhost:5000/api/driver/active', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) return { success: false };
        return response.json();
    }
}
