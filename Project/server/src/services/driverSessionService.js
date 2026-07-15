const DriverSession = require('../models/DriverSession');

class DriverSessionService {
    static async getSession(driverId) {
        let session = await DriverSession.findOne({ driverId });
        if (!session) {
            session = new DriverSession({ driverId });
            await session.save();
        }
        return session;
    }

    static async goOnline(driverId, socketId = null) {
        const session = await this.getSession(driverId);
        session.isOnline = true;
        session.isAvailable = true;
        if (socketId) session.socketId = socketId;
        if (!session.shiftStartedAt) session.shiftStartedAt = new Date();
        session.lastSeen = new Date();
        await session.save();
        return session;
    }

    static async goOffline(driverId) {
        const session = await this.getSession(driverId);
        session.isOnline = false;
        session.isAvailable = false;
        // Keep shiftStartedAt for a while, or clear it if it's the end of shift
        session.lastSeen = new Date();
        await session.save();
        return session;
    }

    static async updateLocation(driverId, lat, lng, heading = null, speed = null) {
        const session = await this.getSession(driverId);
        session.currentLocation = {
            type: 'Point',
            coordinates: [lng, lat]
        };
        if (heading !== null) session.heading = heading;
        if (speed !== null) session.speed = speed;
        session.lastSeen = new Date();
        await session.save();
        return session;
    }

    static async heartbeat(driverId, payload = {}) {
        const session = await this.getSession(driverId);
        


        if (payload.lat && payload.lng) {
            session.currentLocation = {
                type: 'Point',
                coordinates: [payload.lng, payload.lat]
            };
        }
        
        if (payload.heading !== undefined) session.heading = payload.heading;
        if (payload.speed !== undefined) session.speed = payload.speed;
        if (payload.batteryLevel !== undefined) session.batteryLevel = payload.batteryLevel;
        if (payload.isAvailable !== undefined) session.isAvailable = payload.isAvailable;
        if (payload.socketId) session.socketId = payload.socketId;

        session.lastSeen = new Date();
        await session.save();
        return session;
    }

    static async updateAvailability(driverId, isAvailable) {
        const session = await this.getSession(driverId);
        session.isAvailable = isAvailable;
        await session.save();
        return session;
    }

    static async joinDispatchZone(driverId, zoneId) {
        // Placeholder for geospatial grouping if we track zones in the session
        const session = await this.getSession(driverId);
        session.metadata = { ...session.metadata, currentZone: zoneId };
        await session.save();
        return session;
    }

    static async leaveDispatchZone(driverId) {
        const session = await this.getSession(driverId);
        if (session.metadata?.currentZone) {
            delete session.metadata.currentZone;
        }
        await session.save();
        return session;
    }

    static async endSession(driverId) {
        const session = await this.getSession(driverId);
        session.isOnline = false;
        session.isAvailable = false;
        session.socketId = null;
        session.shiftStartedAt = null;
        session.lastSeen = new Date();
        await session.save();
        return session;
    }

    // --- Admin Dashboard Aggregations ---
    static async getAdminActiveDriversCount() {
        return await DriverSession.countDocuments({ isOnline: true });
    }
}

module.exports = DriverSessionService;
