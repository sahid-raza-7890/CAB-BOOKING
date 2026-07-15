const DriverSession = require('../models/DriverSession');
const Driver = require('../models/Driver');
const DriverVehicle = require('../models/DriverVehicle');

class DriverAvailabilityService {
    static async getAvailability(driverId) {
        let session = await DriverSession.findOne({ driverId });
        if (!session) {
            session = await DriverSession.create({ driverId });
        }
        return session;
    }

    static async goOnline(driverId, io) {
        // Enforce compliance and active vehicle
        const driver = await Driver.findById(driverId);
        if (!driver) throw new Error('Driver not found');
        if (driver.status === 'Suspended') throw new Error('Account suspended');
        if (!driver.isVerified) throw new Error('Verification incomplete. Please upload required documents.');

        const activeVehicle = await DriverVehicle.findOne({ driverId, isActive: true });
        if (!activeVehicle) throw new Error('No active vehicle found. Please select an active vehicle.');
        if (activeVehicle.status !== 'Approved') throw new Error('Active vehicle is not yet approved.');

        const session = await this.getAvailability(driverId);
        session.isOnline = true;
        session.isAvailable = !session.isOnBreak;
        if (!session.shiftStartedAt) session.shiftStartedAt = new Date();
        session.lastAvailabilityChange = new Date();
        
        await session.save();

        if (io) {
            io.to(`driver_${driverId}`).emit('driverOnline', { driverId });
            io.to(`driver_${driverId}`).emit('availabilityUpdated', { session });
        }

        return session;
    }

    static async goOffline(driverId, io) {
        const session = await this.getAvailability(driverId);
        session.isOnline = false;
        session.isAvailable = false;
        session.shiftStartedAt = null;
        session.isOnBreak = false; // Reset break state if they go fully offline
        session.lastAvailabilityChange = new Date();
        
        await session.save();

        if (io) {
            io.to(`driver_${driverId}`).emit('driverOffline', { driverId });
            io.to(`driver_${driverId}`).emit('availabilityUpdated', { session });
        }

        return session;
    }

    static async startBreak(driverId, payload, io) {
        const session = await this.getAvailability(driverId);
        if (!session.isOnline) throw new Error('Driver must be online to take a break');

        session.isOnBreak = true;
        session.isAvailable = false;
        session.breakType = payload.breakType || 'Open Break';
        
        if (payload.durationMinutes) {
            session.breakEndsAt = new Date(Date.now() + payload.durationMinutes * 60000);
        } else {
            session.breakEndsAt = null;
        }

        session.lastAvailabilityChange = new Date();

        await session.save();

        if (io) {
            io.to(`driver_${driverId}`).emit('driverBreakStarted', { driverId });
            io.to(`driver_${driverId}`).emit('availabilityUpdated', { session });
        }

        return session;
    }

    static async endBreak(driverId, io) {
        const session = await this.getAvailability(driverId);
        if (!session.isOnline) throw new Error('Driver must be online to end break');

        session.isOnBreak = false;
        session.isAvailable = true;
        session.breakType = null;
        session.breakEndsAt = null;
        session.lastAvailabilityChange = new Date();

        await session.save();

        if (io) {
            io.to(`driver_${driverId}`).emit('driverBreakEnded', { driverId });
            io.to(`driver_${driverId}`).emit('availabilityUpdated', { session });
        }

        return session;
    }

    static async updateDispatchPreferences(driverId, payload, io) {
        const { preferredRideTypes, maxPickupDistance, acceptScheduledTrips } = payload;
        
        const session = await this.getAvailability(driverId);
        if (preferredRideTypes) session.preferredRideTypes = preferredRideTypes;
        if (maxPickupDistance !== undefined) session.maxPickupDistance = maxPickupDistance;
        if (acceptScheduledTrips !== undefined) session.acceptScheduledTrips = acceptScheduledTrips;
        
        await session.save();

        if (io) {
            io.to(`driver_${driverId}`).emit('dispatchPreferenceUpdated', { session });
        }

        return session;
    }

    static async updateDestinationFilter(driverId, payload, io) {
        const { enabled, coordinates, address } = payload;

        const session = await this.getAvailability(driverId);
        session.destinationFilter = {
            enabled: !!enabled,
            coordinates: coordinates || null,
            address: address || null
        };

        await session.save();

        if (io) {
            io.to(`driver_${driverId}`).emit('dispatchPreferenceUpdated', { session });
        }

        return session;
    }

    static async getDispatchPreferences(driverId) {
        const session = await this.getAvailability(driverId);
        return {
            preferredRideTypes: session.preferredRideTypes,
            maxPickupDistance: session.maxPickupDistance,
            acceptScheduledTrips: session.acceptScheduledTrips,
            destinationFilter: session.destinationFilter
        };
    }
}

module.exports = DriverAvailabilityService;
