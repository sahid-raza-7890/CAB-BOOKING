const getHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw { status: response.status, message: error.error || error.message || 'An error occurred' };
    }
    return response.json();
};

export const passengerApiService = {
    // Dashboard
    getDashboard: async () => {
        const res = await fetch('http://localhost:5000/api/passenger-dashboard', { headers: getHeaders() });
        return handleResponse(res);
    },

    // Profile
    getProfile: async () => {
        const res = await fetch('http://localhost:5000/api/users/profile', { headers: getHeaders() });
        return handleResponse(res);
    },
    updateProfile: async (data) => {
        const res = await fetch('http://localhost:5000/api/users/profile', {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    },

    // Wallet
    getWallet: async () => {
        const res = await fetch('http://localhost:5000/api/wallet', { headers: getHeaders() });
        return handleResponse(res);
    },
    addFunds: async (amount) => {
        const res = await fetch('http://localhost:5000/api/wallet/add', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ amount })
        });
        return handleResponse(res);
    },

    // SOS / Safety
    triggerSOS: async (data) => {
        const res = await fetch('http://localhost:5000/api/safety/sos', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    },

    // Lost and Found
    reportLostItem: async (data) => {
        const res = await fetch('http://localhost:5000/api/lost-items', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    },
    getLostItems: async () => {
        const res = await fetch('http://localhost:5000/api/lost-items', { headers: getHeaders() });
        return handleResponse(res);
    },

    // Favorite Drivers
    getFavoriteDrivers: async () => {
        const res = await fetch('http://localhost:5000/api/favorite-drivers', { headers: getHeaders() });
        return handleResponse(res);
    },
    addFavoriteDriver: async (driverId) => {
        const res = await fetch('http://localhost:5000/api/favorite-drivers', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ driverId })
        });
        return handleResponse(res);
    },
    removeFavoriteDriver: async (id) => {
        const res = await fetch(`http://localhost:5000/api/favorite-drivers/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return handleResponse(res);
    },

    // Receipts
    getReceipts: async () => {
        const res = await fetch('http://localhost:5000/api/receipts', { headers: getHeaders() });
        return handleResponse(res);
    },
    getReceipt: async (id) => {
        const res = await fetch(`http://localhost:5000/api/receipts/${id}`, { headers: getHeaders() });
        return handleResponse(res);
    },

    // Notifications
    getNotifications: async () => {
        const res = await fetch('http://localhost:5000/api/notifications', { headers: getHeaders() });
        return handleResponse(res);
    },
    markNotificationRead: async (id) => {
        const res = await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
            method: 'PUT',
            headers: getHeaders()
        });
        return handleResponse(res);
    },

    // Reviews
    getReviews: async () => {
        const res = await fetch('http://localhost:5000/api/reviews', { headers: getHeaders() });
        return handleResponse(res);
    },
    submitReview: async (data) => {
        const res = await fetch('http://localhost:5000/api/reviews', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    },

    // Settings / Preferences
    getPreferences: async () => {
        const res = await fetch('http://localhost:5000/api/preferences', { headers: getHeaders() });
        return handleResponse(res);
    },
    updatePreferences: async (data) => {
        const res = await fetch('http://localhost:5000/api/preferences', {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    },

    // Saved Places
    getSavedPlaces: async () => {
        const res = await fetch('http://localhost:5000/api/saved-places', { headers: getHeaders() });
        return handleResponse(res);
    },
    createSavedPlace: async (data) => {
        const res = await fetch('http://localhost:5000/api/saved-places', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    },
    updateSavedPlace: async (id, data) => {
        const res = await fetch(`http://localhost:5000/api/saved-places/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    },
    deleteSavedPlace: async (id) => {
        const res = await fetch(`http://localhost:5000/api/saved-places/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        return handleResponse(res);
    },

    // Referrals
    getReferralDashboard: async () => {
        const res = await fetch('http://localhost:5000/api/referrals', { headers: getHeaders() });
        return handleResponse(res);
    },
    shareReferralCode: async (data) => {
        const res = await fetch('http://localhost:5000/api/referrals/share', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    },

    // Offers & Coupons
    getActiveOffers: async () => {
        const res = await fetch('http://localhost:5000/api/offers/active', { headers: getHeaders() });
        return handleResponse(res);
    },
    getAvailableCoupons: async () => {
        const res = await fetch('http://localhost:5000/api/coupons/available', { headers: getHeaders() });
        return handleResponse(res);
    }
};
