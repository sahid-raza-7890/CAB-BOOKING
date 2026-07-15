const getToken = () => localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));

const parseJwt = (token) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

const getApiBase = () => {
    const token = getToken();
    if (!token) return 'http://localhost:5000/api/preferences';
    const decoded = parseJwt(token);
    if (decoded && decoded.role === 'Driver') {
        return 'http://localhost:5000/api/driver/preferences';
    }
    return 'http://localhost:5000/api/preferences';
};

const headers = () => ({
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json'
});

export const userPreferenceService = {
    getPreferences: async () => {
        const token = getToken();
        if (!token) return null; // Not logged in
        
        const decoded = parseJwt(token);
        // Admin portal has no preference endpoint, skip to avoid 403 in console
        if (decoded && decoded.role === 'Admin') return null; 

        const res = await fetch(`${getApiBase()}/`, { headers: headers() });
        if (res.status === 401 || res.status === 403) return null; // Token expired or invalid
        if (!res.ok) throw new Error('Failed to fetch preferences');
        const json = await res.json();
        return json.data;
    },
    
    updatePreferences: async (data) => {
        const res = await fetch(`${getApiBase()}/`, {
            method: 'PUT',
            headers: headers(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update preferences');
        const json = await res.json();
        return json.data;
    },
    
    updateTheme: async (theme) => {
        const res = await fetch(`${getApiBase()}/theme`, {
            method: 'PUT',
            headers: headers(),
            body: JSON.stringify({ theme })
        });
        if (!res.ok) throw new Error('Failed to update theme');
        const json = await res.json();
        return json.data;
    },
    
    updateLanguage: async (language) => {
        const res = await fetch(`${getApiBase()}/language`, {
            method: 'PUT',
            headers: headers(),
            body: JSON.stringify({ language })
        });
        if (!res.ok) throw new Error('Failed to update language');
        const json = await res.json();
        return json.data;
    },
    
    updateNotifications: async (data) => {
        const res = await fetch(`${getApiBase()}/notifications`, {
            method: 'PUT',
            headers: headers(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update notifications');
        const json = await res.json();
        return json.data;
    },
    
    updatePrivacy: async (data) => {
        const res = await fetch(`${getApiBase()}/privacy`, {
            method: 'PUT',
            headers: headers(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update privacy');
        const json = await res.json();
        return json.data;
    },
    
    updateRidePreferences: async (data) => {
        const res = await fetch(`${getApiBase()}/ride`, {
            method: 'PUT',
            headers: headers(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update ride preferences');
        const json = await res.json();
        return json.data;
    },

    updateSecurity: async (data) => {
        const res = await fetch(`${getApiBase()}/security`, {
            method: 'PUT',
            headers: headers(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update security');
        const json = await res.json();
        return json.data;
    },
    
    resetPreferences: async () => {
        const res = await fetch(`${getApiBase()}/reset`, {
            method: 'POST',
            headers: headers()
        });
        if (!res.ok) throw new Error('Failed to reset preferences');
        const json = await res.json();
        return json.data;
    }
};

export default userPreferenceService;
