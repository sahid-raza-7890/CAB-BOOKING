const API_BASE = 'http://localhost:5000/api/referrals';

const getToken = () => localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));

const headers = () => ({
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json'
});

export const referralService = {
    getDashboard: async () => {
        const res = await fetch(`${API_BASE}/`, { headers: headers() });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to fetch referral dashboard');
        }
        const json = await res.json();
        return json.data !== undefined ? json.data : json; // ResponseFormatter wraps in json.data
    },
    
    getHistory: async () => {
        const res = await fetch(`${API_BASE}/history`, { headers: headers() });
        if (!res.ok) throw new Error('Failed to fetch referral history');
        const json = await res.json();
        return json.data !== undefined ? json.data : json;
    },
    
    getCode: async () => {
        const res = await fetch(`${API_BASE}/code`, { headers: headers() });
        if (!res.ok) throw new Error('Failed to fetch referral code');
        const json = await res.json();
        return json.data !== undefined ? json.data : json;
    },
    
    applyReferral: async (code) => {
        const res = await fetch(`${API_BASE}/apply`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({ code })
        });
        const json = await res.json();
        if (!res.ok) {
            // Throw an object so the frontend can read err.response.data.error if it wants, 
            // but our UI expects err.response?.data?.error OR err.message.
            throw new Error(json.error || json.message || 'Failed to apply code');
        }
        return json.data !== undefined ? json.data : json;
    },

    shareReferral: async () => {
        const res = await fetch(`${API_BASE}/share`, {
            method: 'POST',
            headers: headers()
        });
        if (!res.ok) throw new Error('Failed to share referral');
        const json = await res.json();
        return json.data !== undefined ? json.data : json;
    }
};

export default referralService;
