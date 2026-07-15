const API_BASE = 'http://localhost:5000/api/notifications';

const getToken = () => localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));

const headers = () => ({
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json'
});

const notificationService = {
    getNotifications: async (params = {}) => {
        const search = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE}?${search}`, { headers: headers() });
        if (!response.ok) throw new Error('Failed to fetch notifications');
        return response.json();
    },

    getUnreadCount: async () => {
        const response = await fetch(`${API_BASE}/unread-count`, { headers: headers() });
        if (!response.ok) throw new Error('Failed to fetch unread count');
        return response.json();
    },

    markAsRead: async (id) => {
        const response = await fetch(`${API_BASE}/${id}/read`, { 
            method: 'PUT',
            headers: headers() 
        });
        if (!response.ok) throw new Error('Failed to mark as read');
        return response.json();
    },

    markAllRead: async () => {
        const response = await fetch(`${API_BASE}/read-all`, { 
            method: 'PUT',
            headers: headers() 
        });
        if (!response.ok) throw new Error('Failed to mark all as read');
        return response.json();
    },

    deleteNotification: async (id) => {
        const response = await fetch(`${API_BASE}/${id}`, { 
            method: 'DELETE',
            headers: headers() 
        });
        if (!response.ok) throw new Error('Failed to delete notification');
        return response.json();
    },

    clearAll: async () => {
        const response = await fetch(`${API_BASE}/clear`, { 
            method: 'DELETE',
            headers: headers() 
        });
        if (!response.ok) throw new Error('Failed to clear notifications');
        return response.json();
    }
};

export default notificationService;
