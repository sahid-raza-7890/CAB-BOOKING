const BASE_URL = 'http://localhost:5000/api';

class DriverSupportService {
    static async getTickets() {
        const res = await fetch(`${BASE_URL}/driver/support`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        if (!res.ok) throw new Error('Failed to fetch support tickets');
        const response = await res.json();
        const data = response.data?.data ?? response.data ?? [];
        return Array.isArray(data) ? data : [];
    }

    static async getTicket(id) {
        const response = await fetch(`${BASE_URL}/driver/support/${id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch ticket');
        return response.json();
    }

    static async createTicket(payload) {
        const response = await fetch(`${BASE_URL}/driver/support`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Failed to create ticket');
        return response.json();
    }

    static async replyToTicket(id, message) {
        const response = await fetch(`${BASE_URL}/driver/support/${id}/reply`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ message })
        });
        if (!response.ok) throw new Error('Failed to reply to ticket');
        return response.json();
    }

    static async closeTicket(id) {
        const response = await fetch(`${BASE_URL}/driver/support/${id}/close`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        if (!response.ok) throw new Error('Failed to close ticket');
        return response.json();
    }
}

export default DriverSupportService;
