const API_BASE = 'http://localhost:5000/api/support';

const getToken = () => localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));

const headers = () => ({
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json'
});

const supportService = {
    getTickets: async () => {
        const response = await fetch(API_BASE, { headers: headers() });
        if (!response.ok) throw new Error('Failed to fetch tickets');
        return response.json();
    },

    getTicket: async (id) => {
        const response = await fetch(`${API_BASE}/${id}`, { headers: headers() });
        if (!response.ok) throw new Error('Failed to fetch ticket');
        return response.json();
    },

    createTicket: async (data) => {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create ticket');
        return response.json();
    },

    replyTicket: async (id, message) => {
        const response = await fetch(`${API_BASE}/${id}/reply`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({ message })
        });
        if (!response.ok) throw new Error('Failed to post reply');
        return response.json();
    },

    closeTicket: async (id) => {
        const response = await fetch(`${API_BASE}/${id}/close`, {
            method: 'PUT',
            headers: headers()
        });
        if (!response.ok) throw new Error('Failed to close ticket');
        return response.json();
    }
};

export default supportService;
