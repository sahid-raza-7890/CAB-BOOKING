const BASE_URL = 'http://localhost:5000/api';

class DriverNotificationService {
    static async getNotifications(params = {}) {
        const query = new URLSearchParams(params).toString();
        const res = await fetch(`${BASE_URL}/driver/notifications?${query}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        if (!res.ok) throw new Error('Failed to fetch notifications');
        const response = await res.json();
        const data = response.data?.data ?? response.data ?? [];
        return Array.isArray(data) ? data : [];
    }

    static async getUnreadNotifications() {
        const res = await fetch(`${BASE_URL}/driver/notifications/unread`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        if (!res.ok) throw new Error('Failed to fetch unread notifications');
        const response = await res.json();
        const data = response.data?.data ?? response.data ?? [];
        return Array.isArray(data) ? data : [];
    }

    static async markAsRead(id) {
        const response = await fetch(`${BASE_URL}/driver/notifications/${id}/read`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        if (!response.ok) throw new Error('Failed to mark notification as read');
        return response.json();
    }

    static async markAllAsRead() {
        const response = await fetch(`${BASE_URL}/driver/notifications/read-all`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        if (!response.ok) throw new Error('Failed to mark all as read');
        return response.json();
    }

    static async deleteNotification(id) {
        const response = await fetch(`${BASE_URL}/driver/notifications/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        if (!response.ok) throw new Error('Failed to delete notification');
        return response.json();
    }

    static async clearAllNotifications() {
        const response = await fetch(`${BASE_URL}/driver/notifications`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        if (!response.ok) throw new Error('Failed to clear notifications');
        return response.json();
    }
}

export default DriverNotificationService;
