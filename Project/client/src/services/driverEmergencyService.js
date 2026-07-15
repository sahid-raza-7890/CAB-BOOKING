const BASE_URL = 'http://localhost:5000/api';

class DriverEmergencyService {
    static async triggerSOS(payload = {}) {
        const response = await fetch(`${BASE_URL}/driver/emergency/sos`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Failed to trigger SOS');
        return response.json();
    }

    static async cancelSOS() {
        const response = await fetch(`${BASE_URL}/driver/emergency/cancel`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        if (!response.ok) throw new Error('Failed to cancel SOS');
        return response.json();
    }

    static async shareLocation(payload) {
        const response = await fetch(`${BASE_URL}/driver/emergency/location`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Failed to share location');
        return response.json();
    }
}

export default DriverEmergencyService;
