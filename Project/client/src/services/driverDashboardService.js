const BASE_URL = 'http://localhost:5000/api';

class DriverDashboardService {

    static async fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
        const token = localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'));
        const headers = { ...options.headers };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeoutMs);
        try {
            const response = await fetch(url, { ...options, headers, signal: controller.signal });
            clearTimeout(id);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            clearTimeout(id);
            if (error.name === 'AbortError') throw new Error('Request timed out');
            throw error;
        }
    }

    static async getDashboard() {
        return this.fetchWithTimeout(`${BASE_URL}/driver/dashboard`);
    }

    static async updateProfile(payload) {
        const response = await fetch(`${BASE_URL}/driver/profile`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken') || (localStorage.getItem('authToken') || localStorage.getItem('ucab_token'))}`
            },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Failed to update profile');
        return response.json();
    }

    static async getTodaySummary() {
        const res = await this.fetchWithTimeout(`${BASE_URL}/driver/dashboard/today`);
        return res.data ?? res;
    }

    static async getWeeklySummary() {
        const res = await this.fetchWithTimeout(`${BASE_URL}/driver/dashboard/week`);
        return res.data ?? res;
    }

    static async getMonthlySummary() {
        const res = await this.fetchWithTimeout(`${BASE_URL}/driver/dashboard/month`);
        return res.data ?? res;
    }

    static async getWalletSummary() {
        const res = await this.fetchWithTimeout(`${BASE_URL}/driver/dashboard/wallet`);
        return res.data ?? res;
    }

    static async getSettlements() {
        const response = await this.fetchWithTimeout(`${BASE_URL}/driver/dashboard/settlements`);
        const data = response.data?.data ?? response.data ?? [];
        return Array.isArray(data) ? data : [];
    }

    static async getIncentives() {
        const response = await this.fetchWithTimeout(`${BASE_URL}/driver/dashboard/incentives`);
        const data = response.data?.data ?? response.data ?? [];
        return Array.isArray(data) ? data : [];
    }

    static async getTransactions() {
        const response = await this.fetchWithTimeout(`${BASE_URL}/driver/dashboard/transactions`);
        const data = response.data?.data ?? response.data ?? [];
        return Array.isArray(data) ? data : [];
    }
}

export default DriverDashboardService;
