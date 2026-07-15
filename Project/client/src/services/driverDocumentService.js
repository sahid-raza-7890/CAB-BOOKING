const BASE_URL = 'http://localhost:5000/api';

class DriverDocumentService {
    static async getDocuments() {
        const res = await fetch(`${BASE_URL}/driver/documents`);
        if (!res.ok) throw new Error('Failed to fetch documents');
        const response = await res.json();
        const data = response.data?.data ?? response.data ?? [];
        return Array.isArray(data) ? data : [];
    }

    static async getDocument(id) {
        const response = await fetch(`${BASE_URL}/driver/documents/${id}`);
        if (!response.ok) throw new Error('Failed to fetch document');
        return response.json();
    }

    static async uploadDocument(payload) {
        const response = await fetch(`${BASE_URL}/driver/documents`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Failed to upload document');
        return response.json();
    }

    static async deleteDocument(id) {
        const response = await fetch(`${BASE_URL}/driver/documents/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete document');
        return response.json();
    }

    static async getComplianceStatus() {
        const response = await fetch(`${BASE_URL}/driver/documents/compliance`);
        if (!response.ok) throw new Error('Failed to fetch compliance status');
        return response.json();
    }
}

export default DriverDocumentService;
