const BASE_URL = 'http://localhost:5000/api';

class DriverVehicleService {
    static async getVehicles() {
        const res = await fetch(`${BASE_URL}/driver/vehicles`);
        if (!res.ok) throw new Error('Failed to fetch vehicles');
        const response = await res.json();
        const data = response.data?.data ?? response.data ?? [];
        return Array.isArray(data) ? data : [];
    }

    static async addVehicle(payload) {
        const response = await fetch(`${BASE_URL}/driver/vehicles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Failed to add vehicle');
        return response.json();
    }

    static async updateVehicle(id, payload) {
        const response = await fetch(`${BASE_URL}/driver/vehicles/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Failed to update vehicle');
        return response.json();
    }

    static async deleteVehicle(id) {
        const response = await fetch(`${BASE_URL}/driver/vehicles/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete vehicle');
        return response.json();
    }

    static async setActiveVehicle(id) {
        const response = await fetch(`${BASE_URL}/driver/vehicles/${id}/activate`, {
            method: 'PUT'
        });
        if (!response.ok) throw new Error('Failed to activate vehicle');
        return response.json();
    }
}

export default DriverVehicleService;
