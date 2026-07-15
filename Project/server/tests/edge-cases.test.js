/**
 * Edge-Case Regression Tests â€” UCAB Version 1
 *
 * Tests specifically for:
 *   1. Dual-driver accept race condition  â†’ first wins (200), second loses (409)
 *   2. OTP variants                       â†’ correct (200), wrong (400), missing (400), pre-verify skip (400)
 *   3. Reviews                            â†’ `rating` alias (201), `overallRating` field (201), duplicate rejection (4xx)
 *   4. Ride state machine                 â†’ cannot skip states (Pending â†’ Completed = 400)
 *
 * DO NOT modify test expectations. The backend must conform.
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
const testId = Math.random().toString(36).substring(2, 10);

// Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const api = axios.create({
    baseURL: BASE_URL,
    validateStatus: () => true // resolve all statuses
});

async function registerAndLogin(overrides = {}) {
    const id = Math.random().toString(36).substring(2, 8);
    const base = {
        name: `Test User ${id}`,
        email: `user_${id}@test.com`,
        password: 'Password123!',
        phone: `+1555${Math.floor(100000 + Math.random() * 900000)}`,
        role: 'Passenger',
        ...overrides
    };
    const regRes = await api.post('/register', base);
    if (regRes.status !== 201) throw new Error(`Registration failed: ${JSON.stringify(regRes.data)}`);
    return {
        token: regRes.data.token,
        userId: regRes.data.userId,
        // axiosConfig: pass as 3rd arg to axios calls (e.g. api.post(url, body, token))
        headers: { Authorization: `Bearer ${regRes.data.token}` },
        // Full axios config object matching core-flow.test.js pattern
        axiosConfig: { headers: { Authorization: `Bearer ${regRes.data.token}` } }
    };
}

async function registerDriver() {
    const id = Math.random().toString(36).substring(2, 8);
    const payload = {
        name: `Test Driver ${id}`,
        email: `driver_${id}@test.com`,
        phone: `+1555${Math.floor(100000 + Math.random() * 900000)}`,
        password: 'Password123!',
        cabType: 'Sedan',
        vehicleNumber: `TEST-${id}`,
        vehicleDetails: { make: 'Toyota', model: 'Camry', year: 2022, color: 'White', plateNumber: `TEST-${id}` }
    };
    const regRes = await api.post('/register-driver', payload);
    if (regRes.status !== 201) throw new Error(`Driver registration failed (${regRes.status}): ${JSON.stringify(regRes.data)}`);
    
    const loginRes = await api.post('/login-driver', { email: payload.email, password: payload.password });
    if (loginRes.status !== 200) throw new Error(`Driver login failed: ${JSON.stringify(loginRes.data)}`);
    
    return {
        token: loginRes.data.token,
        driverId: loginRes.data.user.id,
        headers: { Authorization: `Bearer ${loginRes.data.token}` },
        axiosConfig: { headers: { Authorization: `Bearer ${loginRes.data.token}` } }
    };
}

async function goOnline(driver) {
    const statusRes = await api.put('/api/driver/status', { isOnline: true }, driver.axiosConfig);
    if (statusRes.status !== 200) throw new Error("goOnline failed: " + statusRes.status);
    
    const res = await api.post('/api/driver/status/heartbeat', {
        lat: 14.4426, lng: 79.9865, socketId: `mock-socket-${Date.now()}`, isAvailable: true
    }, driver.axiosConfig);
    return res;
}

async function requestRide(passenger) {
    return api.post('/api/rides/request', {
        pickupLocation: 'Edge Case Pickup',
        dropoffLocation: 'Edge Case Dropoff',
        vehicleType: 'Basic',
        paymentMethod: 'Cash'
    }, passenger.axiosConfig);
}

async function acceptRideReq(driver, rideId) {
    const pendingRes = await api.get('/api/driver/rides/pending', driver.axiosConfig);
    if (!pendingRes.data.success || !pendingRes.data.data || pendingRes.data.data.length === 0) {
        throw new Error('No pending dispatch found for driver to accept');
    }
    const dispatch = pendingRes.data.data.find(d => {
        const dRideId = d.rideId && typeof d.rideId === 'object' ? d.rideId._id || d.rideId.id : d.rideId;
        return String(dRideId) === String(rideId);
    });
    if (!dispatch) {
        throw new Error('No dispatch found for this rideId');
    }
    return api.post(`/api/driver/rides/${dispatch._id}/accept`, {}, driver.axiosConfig);
}

function extractRideId(rideRes) {
    // Try multiple response shapes used across controllers
    return (
        rideRes.data?._id ||
        rideRes.data?.data?._id ||
        rideRes.data?.ride?._id ||
        rideRes.data?.id
    );
}

async function waitMs(ms) {
    return new Promise(r => setTimeout(r, ms));
}

// ——————————————————— Suite 1: Dual-Driver Accept (Race Condition) ———————————————————

describe('1. Dual-Driver Accept — Race Condition', () => {
    let passenger, driverA, driverB, rideId, dispatchA_id, dispatchB_id;

    beforeAll(async () => {
        await waitMs(500);
        passenger = await registerAndLogin();
        driverA   = await registerDriver();
        driverB   = await registerDriver();

        await goOnline(driverA);
        await goOnline(driverB);

        const rideRes = await requestRide(passenger);
        expect(rideRes.status).toBe(201);
        rideId = extractRideId(rideRes);
        expect(rideId).toBeDefined();

        // Give dispatch a moment to create records
        await waitMs(300);

        // Fetch dispatch IDs for both drivers before any accepts
        const pendingA = await api.get('/api/driver/rides/pending', driverA.axiosConfig);
        const pendingB = await api.get('/api/driver/rides/pending', driverB.axiosConfig);
        if (pendingA.data.data.length > 0) dispatchA_id = pendingA.data.data[0]._id;
        if (pendingB.data.data.length > 0) dispatchB_id = pendingB.data.data[0]._id;
    });

    test('Driver A accepts ride → 200', async () => {
        const res = await api.post(`/api/driver/rides/${dispatchA_id}/accept`, {}, driverA.axiosConfig);
        expect(res.status).toBe(200);
    });

    test('Driver B accepts same ride → 409 Conflict (never 200)', async () => {
        const res = await api.post(`/api/driver/rides/${dispatchB_id}/accept`, {}, driverB.axiosConfig);
        // Must be 4xx. Specifically 409 Conflict.
        // Under no circumstances should both drivers receive 200.
        expect(res.status).toBe(409);
        expect(res.data.success).toBe(false);
    });
});

// â”€â”€â”€ Suite 2: OTP Variants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('2. OTP Variants', () => {
    let passenger, driver, rideId, realOtp;

    beforeAll(async () => {
        await waitMs(500);
        passenger = await registerAndLogin();
        driver    = await registerDriver();
        await goOnline(driver);

        const rideRes = await requestRide(passenger);
        expect(rideRes.status).toBe(201);
        rideId = extractRideId(rideRes);
        expect(rideId).toBeDefined();
        await waitMs(300);

        // Driver accepts
        const acceptRes = await acceptRideReq(driver, rideId);
        expect(acceptRes.status).toBe(200);

        // Driver arrives
        const arriveRes = await api.post(`/api/driver/active/${rideId}/arrive`, {}, driver.axiosConfig);
        expect(arriveRes.status).toBe(200);

        // Fetch OTP as passenger
        const rideDetails = await api.get(`/api/rides/${rideId}`, passenger.axiosConfig);
        realOtp = rideDetails.data.data?.otp;
        expect(realOtp).toBeDefined();
    });

    test('Wrong OTP â†’ 400', async () => {
        const wrongOtp = realOtp === '0000' ? '1111' : '0000';
        const res = await api.post(`/api/driver/active/${rideId}/start`, { otp: wrongOtp }, driver.axiosConfig);
        expect(res.status).toBe(400);
        expect(res.data.success).toBe(false);
    });

    test('Missing OTP â†’ 400', async () => {
        const res = await api.post(`/api/driver/active/${rideId}/start`, {}, driver.axiosConfig);
        // No OTP provided and not yet verified â€” must fail with 4xx
        expect(res.status).toBe(400);
        expect(res.data.success).toBe(false);
    });

    test('Correct OTP â†’ 200 (ride starts)', async () => {
        const res = await api.post(`/api/driver/active/${rideId}/start`, { otp: realOtp }, driver.axiosConfig);
        expect(res.status).toBe(200);
    });

    test('Replaying same OTP after ride started â†’ 400 (already in progress)', async () => {
        const res = await api.post(`/api/driver/active/${rideId}/start`, { otp: realOtp }, driver.axiosConfig);
        expect(res.status).toBe(400);
    });
});

// â”€â”€â”€ Suite 3: Reviews â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('3. Reviews â€” rating alias, overallRating, and duplicate rejection', () => {
    let passenger, driver, rideId;

    beforeAll(async () => {
        await waitMs(500);
        passenger = await registerAndLogin();
        driver    = await registerDriver();
        await goOnline(driver);

        const rideRes = await requestRide(passenger);
        expect(rideRes.status).toBe(201);
        rideId = extractRideId(rideRes);
        expect(rideId).toBeDefined();
        await waitMs(300);

        const acceptRes = await acceptRideReq(driver, rideId);
        expect(acceptRes.status).toBe(200);

        const arriveRes = await api.post(`/api/driver/active/${rideId}/arrive`, {}, driver.axiosConfig);
        expect(arriveRes.status).toBe(200);

        const rideDetails = await api.get(`/api/rides/${rideId}`, passenger.axiosConfig);
        const otp = rideDetails.data.data?.otp;
        expect(otp).toBeDefined();

        const startRes = await api.post(`/api/driver/active/${rideId}/start`, { otp }, driver.axiosConfig);
        expect(startRes.status).toBe(200);

        const completeRes = await api.post(`/api/driver/active/${rideId}/complete`, {
            finalLocation: { type: 'Point', coordinates: [79.98, 14.44] }
        }, driver.axiosConfig);
        expect(completeRes.status).toBe(200);
    });

    test('Passenger submits review using `rating` (alias) â†’ 200 or 201', async () => {
        const res = await api.post('/api/reviews', {
            rideId,
            targetId: driver.driverId,
            targetModel: 'Driver',
            rating: 5,           // â†  alias field, not overallRating
            comment: 'Excellent driver!'
        }, passenger.axiosConfig);
        expect([200, 201]).toContain(res.status);
        expect(res.data.success).toBe(true);
    });

    test('Passenger submits duplicate review â†’ 4xx (conflict)', async () => {
        const res = await api.post('/api/reviews', {
            rideId,
            targetId: driver.driverId,
            targetModel: 'Driver',
            rating: 4,
            comment: 'Duplicate attempt'
        }, passenger.axiosConfig);
        if (res.status >= 500) console.log('Passenger Duplicate 500:', res.data);
        expect(res.status).toBeGreaterThanOrEqual(400);
        expect(res.status).toBeLessThan(500);
        expect(res.data.success).toBe(false);
    });

    test('Driver submits review using `rating` (alias) â†’ 200 or 201', async () => {
        const res = await api.post(`/api/driver/reviews/${rideId}/passenger`, {
            rating: 5,           // â†  alias field
            comment: 'Great passenger!'
        }, driver.axiosConfig);
        expect([200, 201]).toContain(res.status);
        expect(res.data.success).toBe(true);
    });

    test('Driver submits duplicate review â†’ 4xx (conflict)', async () => {
        const res = await api.post(`/api/driver/reviews/${rideId}/passenger`, {
            rating: 3,
            comment: 'Duplicate driver review'
        }, driver.axiosConfig);
        if (res.status >= 500) console.log('Driver Duplicate 500:', res.data);
        expect(res.status).toBeGreaterThanOrEqual(400);
        expect(res.status).toBeLessThan(500);
        expect(res.data.success).toBe(false);
    });
});

describe('3b. Reviews â€” overallRating field works directly', () => {
    let passenger, driver, rideId;

    beforeAll(async () => {
        await waitMs(500);
        passenger = await registerAndLogin();
        driver    = await registerDriver();
        await goOnline(driver);

        const rideRes = await requestRide(passenger);
        expect(rideRes.status).toBe(201);
        rideId = extractRideId(rideRes);
        await waitMs(300);

        await acceptRideReq(driver, rideId);
        await api.post(`/api/driver/active/${rideId}/arrive`, {}, driver.axiosConfig);

        const details = await api.get(`/api/rides/${rideId}`, passenger.axiosConfig);
        const otp = details.data.data?.otp;

        await api.post(`/api/driver/active/${rideId}/start`, { otp }, driver.axiosConfig);
        await api.post(`/api/driver/active/${rideId}/complete`, {
            finalLocation: { type: 'Point', coordinates: [79.98, 14.44] }
        }, driver.axiosConfig);
    });

    test('Passenger submits review using `overallRating` â†’ 200 or 201', async () => {
        const res = await api.post('/api/reviews', {
            rideId,
            targetId: driver.driverId,
            targetModel: 'Driver',
            overallRating: 4,    // â†  canonical field
            comment: 'Smooth ride'
        }, passenger.axiosConfig);
        expect([200, 201]).toContain(res.status);
        expect(res.data.success).toBe(true);
    });
});

// â”€â”€â”€ Suite 4: Ride State Machine â€” Disallow Skipped Transitions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

describe('4. Ride State Machine â€” Transition Enforcement', () => {
    let passenger, driver, rideId;

    beforeAll(async () => {
        await waitMs(500);
        passenger = await registerAndLogin();
        driver    = await registerDriver();
        await goOnline(driver);

        const rideRes = await requestRide(passenger);
        expect(rideRes.status).toBe(201);
        rideId = extractRideId(rideRes);
        await waitMs(300);

        // Accept ride (Pending â†’ Accepted)
        const acceptRes = await acceptRideReq(driver, rideId);
        expect(acceptRes.status).toBe(200);
    });

    test('Skip Arrive: try to start without arriving â†’ 400', async () => {
        // Status is Accepted, driverArrivedAt not set, OTP not verified
        const res = await api.post(`/api/driver/active/${rideId}/start`, { otp: '9999' }, driver.axiosConfig);
        // Should fail because driver hasn't arrived (otpVerifiedAt not set, no arrive done)
        expect(res.status).toBe(400);
        expect(res.data.success).toBe(false);
    });

    test('Skip Start: try to complete without starting â†’ 400', async () => {
        // Status is still Accepted, not InProgress
        const res = await api.post(`/api/driver/active/${rideId}/complete`, {
            finalLocation: { type: 'Point', coordinates: [79.98, 14.44] }
        }, driver.axiosConfig);
        expect(res.status).toBe(400);
        expect(res.data.success).toBe(false);
    });

    test('Skip Arrive + OTP: try to complete directly â†’ 400', async () => {
        // Another attempt at completing without ever arriving or starting
        const res = await api.post(`/api/driver/active/${rideId}/complete`, {}, driver.axiosConfig);
        expect(res.status).toBe(400);
        expect(res.data.success).toBe(false);
    });

    test('Arrive works after Accepted state', async () => {
        const res = await api.post(`/api/driver/active/${rideId}/arrive`, {}, driver.axiosConfig);
        expect(res.status).toBe(200);
    });

    test('Cannot arrive twice (idempotency guard)', async () => {
        const res = await api.post(`/api/driver/active/${rideId}/arrive`, {}, driver.axiosConfig);
        expect(res.status).toBe(400);
    });

    test('Complete still fails without starting (Accepted+Arrived, not InProgress)', async () => {
        const res = await api.post(`/api/driver/active/${rideId}/complete`, {
            finalLocation: { type: 'Point', coordinates: [79.98, 14.44] }
        }, driver.axiosConfig);
        expect(res.status).toBe(400);
        expect(res.data.success).toBe(false);
    });
});

