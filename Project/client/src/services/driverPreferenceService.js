const BASE_URL = 'http://localhost:5000/api';

class DriverPreferenceService {
    static async getPreferences() {
        const response = await fetch(`${BASE_URL}/driver/preferences`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch preferences');
        return response.json();
    }

    static async updatePreferences(payload) {
        const response = await fetch(`${BASE_URL}/driver/preferences`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Failed to update preferences');
        return response.json();
    }

    static async updateTheme(theme) {
        const response = await fetch(`${BASE_URL}/driver/preferences/theme`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ theme })
        });
        if (!response.ok) throw new Error('Failed to update theme');
        return response.json();
    }

    static async updateLanguage(language) {
        const response = await fetch(`${BASE_URL}/driver/preferences/language`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ language })
        });
        if (!response.ok) throw new Error('Failed to update language');
        return response.json();
    }

    static async updateNotifications(payload) {
        const response = await fetch(`${BASE_URL}/driver/preferences/notifications`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Failed to update notifications');
        return response.json();
    }

    static async updatePrivacy(payload) {
        const response = await fetch(`${BASE_URL}/driver/preferences/privacy`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Failed to update privacy settings');
        return response.json();
    }

    static async updateNavigation(payload) {
        const response = await fetch(`${BASE_URL}/driver/preferences/navigation`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Failed to update navigation settings');
        return response.json();
    }

    static async updateRides(payload) {
        const response = await fetch(`${BASE_URL}/driver/preferences/rides`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Failed to update ride preferences');
        return response.json();
    }

    static async updateAvailability(payload) {
        const response = await fetch(`${BASE_URL}/driver/preferences/availability`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Failed to update availability preferences');
        return response.json();
    }

    static async updateSecurity(payload) {
        const response = await fetch(`${BASE_URL}/driver/preferences/security`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Failed to update security settings');
        return response.json();
    }

    static async updateMapProvider(mapProvider) {
        const response = await fetch(`${BASE_URL}/driver/preferences/map`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ mapProvider })
        });
        if (!response.ok) throw new Error('Failed to update map provider');
        return response.json();
    }

    static async updateVoiceNavigation(voiceNavigation) {
        const response = await fetch(`${BASE_URL}/driver/preferences/voice`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ voiceNavigation })
        });
        if (!response.ok) throw new Error('Failed to update voice navigation');
        return response.json();
    }

    static async resetPreferences() {
        const response = await fetch(`${BASE_URL}/driver/preferences/reset`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        if (!response.ok) throw new Error('Failed to reset preferences');
        return response.json();
    }
}

export default DriverPreferenceService;
