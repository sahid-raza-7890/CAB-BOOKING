const BASE_URL = 'http://localhost:5000/api';

class DriverAvailabilityService {
    static getHeaders() {
        const token = localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    }

    static async getAvailability() {
        const response = await fetch(`${BASE_URL}/driver/availability`, { headers: this.getHeaders() });
        if (!response.ok) throw new Error('Failed to fetch availability');
        return response.json();
    }

    static async getDispatchPreferences() {
        const response = await fetch(`${BASE_URL}/driver/availability/preferences`, { headers: this.getHeaders() });
        if (!response.ok) throw new Error('Failed to fetch dispatch preferences');
        return response.json();
    }

    static async goOnline() {
        const response = await fetch(`${BASE_URL}/driver/availability/online`, { method: 'PUT', headers: this.getHeaders() });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.message || 'Failed to go online');
        }
        return response.json();
    }

    static async goOffline() {
        const response = await fetch(`${BASE_URL}/driver/availability/offline`, { method: 'PUT', headers: this.getHeaders() });
        if (!response.ok) throw new Error('Failed to go offline');
        return response.json();
    }

    static async startBreak(data = {}) {
        const response = await fetch(`${BASE_URL}/driver/availability/break`, { 
            method: 'PUT', 
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to start break');
        return response.json();
    }

    static async endBreak() {
        const response = await fetch(`${BASE_URL}/driver/availability/resume`, { method: 'PUT', headers: this.getHeaders() });
        if (!response.ok) throw new Error('Failed to end break');
        return response.json();
    }

    static async updatePreferences(data) {
        const response = await fetch(`${BASE_URL}/driver/availability/preferences`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update preferences');
        return response.json();
    }

    static async updateDestination(data) {
        const response = await fetch(`${BASE_URL}/driver/availability/destination`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update destination');
        return response.json();
    }
}

export default DriverAvailabilityService;
