const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

describe('System Health and API Docs', () => {
    test('GET /health responds with 200 OK', async () => {
        const response = await axios.get(`${BASE_URL}/health`);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('status', 'UP');
    });

    test('GET /ready responds with 200 OK or 503', async () => {
        try {
            const response = await axios.get(`${BASE_URL}/ready`);
            expect(response.status).toBe(200);
            expect(response.data).toHaveProperty('status', 'READY');
        } catch (error) {
            expect(error.response.status).toBe(503);
            expect(error.response.data).toHaveProperty('status');
        }
    });

    test('GET /metrics responds with Prometheus format', async () => {
        const response = await axios.get(`${BASE_URL}/metrics`);
        expect(response.status).toBe(200);
        expect(response.data).toContain('ucab_process_uptime');
    });

    test('GET /api-docs/ loads Swagger UI', async () => {
        const response = await axios.get(`${BASE_URL}/api-docs/`);
        expect(response.status).toBe(200);
        expect(response.data).toContain('Swagger UI');
    });
});
