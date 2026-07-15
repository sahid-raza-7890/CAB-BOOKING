const mongoose = require('mongoose');
const Ride = require('../models/Ride');
const RideService = require('./rideService');
const DriverSession = require('../models/DriverSession');

class DriverRideLifecycleService {
    static async getActiveRide(driverId) {
        return await Ride.findOne({ 
            driver: driverId, 
            status: { $in: ['Accepted', 'Arrived', 'InProgress'] } 
        }).populate('userId', 'name email phone avatar');
    }

    /**
     * Internal method to validate ownership and state
     */
    static async validateRideOwnership(rideId, driverId) {
        const ride = await Ride.findById(rideId);
        if (!ride) {
            throw new Error('Ride not found');
        }
        
        // Ensure driver matches
        if (!ride.driver || ride.driver.toString() !== driverId.toString()) {
            throw new Error('Unauthorized: You do not own this ride');
        }

        // Ensure ride is not already completed or cancelled
        if (['Completed', 'Cancelled'].includes(ride.status)) {
            throw new Error(`Ride is already ${ride.status.toLowerCase()}`);
        }

        return ride;
    }

    /**
     * Emits targeted events to both the driver and the passenger,
     * while temporarily firing the global fallback for backward compatibility.
     */
    static emitTargetedEvent(io, driverId, passengerId, eventName, payload, fallbackGlobal = false) {
        if (!io) return;
        
        // Targeted
        io.to(`driver_${driverId}`).emit(eventName, payload);
        io.to(`user_${passengerId}`).emit(eventName, payload);

        // Fallback for legacy passenger components listening to global
        if (fallbackGlobal) {
            io.emit('rideUpdated', { rideId: payload.rideId || payload._id, status: payload.status || 'Updated' });
        }
    }

    static async arriveAtPickup(rideId, driverId, io) {
        const ride = await this.validateRideOwnership(rideId, driverId);

        if (ride.status !== 'Accepted') {
            const err = new Error('Cannot arrive. Ride must be in Accepted state.');
            err.statusCode = 400;
            throw err;
        }

        // Initialize timeline if not present
        if (!ride.timeline) ride.timeline = {};
        
        // Protect against arriving multiple times
        if (ride.timeline.driverArrived) {
            const err = new Error('Already arrived');
            err.statusCode = 400;
            throw err;
        }

        ride.timeline.driverArrived = new Date();
        await ride.save();

        this.emitTargetedEvent(io, driverId, ride.userId, 'driverArrived', { rideId, timeline: ride.timeline }, true);
        
        return ride;
    }

    static async verifyOTP(rideId, driverId, otp, io) {
        const ride = await this.validateRideOwnership(rideId, driverId);

        if (!ride.timeline || !ride.timeline.driverArrived) {
            const err = new Error('Cannot verify OTP before arriving at pickup');
            err.statusCode = 400;
            throw err;
        }

        if (ride.timeline.otpVerified) {
            const err = new Error('OTP already verified');
            err.statusCode = 400;
            throw err;
        }

        if (ride.otp !== otp.toString()) {
            const err = new Error('Invalid OTP');
            err.name = 'ValidationError';
            err.errors = { otp: { message: 'Invalid OTP' } };
            throw err;
        }

        ride.timeline.otpVerified = new Date();
        await ride.save();

        this.emitTargetedEvent(io, driverId, ride.userId, 'otpVerified', { rideId, timeline: ride.timeline }, true);
        
        return ride;
    }

    static async startRide(rideId, driverId, otp, io) {
        const ride = await this.validateRideOwnership(rideId, driverId);



        // If OTP is provided, verify it if it's not already verified
        if (otp && (!ride.timeline || !ride.timeline.otpVerified)) {
            if (ride.otp !== otp.toString()) {

                const err = new Error('Invalid OTP');
                err.name = 'ValidationError';
                err.errors = { otp: { message: 'Invalid OTP' } };
                throw err;
            }
            if (!ride.timeline) ride.timeline = {};
            ride.timeline.otpVerified = new Date();
        }

        if (!ride.timeline || !ride.timeline.otpVerified) {
            const err = new Error('Cannot start ride before OTP verification');
            err.statusCode = 400;
            throw err;
        }

        if (ride.status === 'InProgress') {
            const err = new Error('Ride is already in progress');
            err.statusCode = 400;
            throw err;
        }

        ride.status = 'InProgress';
        if (!ride.timeline) ride.timeline = {};
        ride.timeline.rideStarted = new Date();
        await ride.save();

        this.emitTargetedEvent(io, driverId, ride.userId, 'rideStarted', ride, true);
        
        return ride;
    }

    static async updateRideLocation(rideId, driverId, location, io) {
        const ride = await this.validateRideOwnership(rideId, driverId);

        // Update DriverSession location
        const driverSession = await DriverSession.findOne({ driverId });
        if (driverSession) {
            driverSession.currentLocation = {
                type: 'Point',
                coordinates: location.coordinates // [lng, lat]
            };
            if (location.heading !== undefined) driverSession.heading = location.heading;
            if (location.speed !== undefined) driverSession.speed = location.speed;
            await driverSession.save();
        }

        this.emitTargetedEvent(io, driverId, ride.userId, 'rideLocationUpdated', { rideId, location }, false);
        
        return { success: true };
    }

    static async completeRide(rideId, driverId, io) {
        const ride = await this.validateRideOwnership(rideId, driverId);

        if (ride.status !== 'InProgress') {
            const err = new Error('Cannot complete a ride that is not in progress');
            err.statusCode = 400;
            throw err;
        }

        if (!ride.timeline) ride.timeline = {};
        ride.timeline.rideCompleted = new Date();
        await ride.save();

        // Delegate to RideService for invoices, wallet, earnings, etc.
        const completedRide = await RideService.completeRide(rideId, io);

        // Update driver session
        const driverSession = await DriverSession.findOne({ driverId });
        if (driverSession) {
            driverSession.currentRideId = null;
            driverSession.isAvailable = true; // Become available again
            await driverSession.save();
        }

        return completedRide;
    }

    static async cancelActiveRide(rideId, driverId, reason, io) {
        const ride = await this.validateRideOwnership(rideId, driverId);

        // We can only cancel if not completed
        // RideService handles the actual cancellation logic for safety/notifications
        // Wait, RideService.cancelRide requires (userId, rideId, reason, io) but it searches by userId.
        // Let's implement driver cancellation natively.
        
        ride.status = 'Cancelled';
        ride.cancelledBy = 'Driver';
        ride.cancelReason = reason || 'Driver cancelled';
        if (!ride.timeline) ride.timeline = {};
        ride.timeline.rideCompleted = new Date(); // Using rideCompleted to mark end of timeline
        await ride.save();

        // Update driver session
        const driverSession = await DriverSession.findOne({ driverId });
        if (driverSession) {
            driverSession.currentRideId = null;
            driverSession.isAvailable = true; 
            await driverSession.save();
        }

        this.emitTargetedEvent(io, driverId, ride.userId, 'rideCancelled', { rideId, reason: ride.cancelReason }, true);
        
        return ride;
    }
}

module.exports = DriverRideLifecycleService;
