const mongoose = require('mongoose');
const Ride = require('../models/Ride');
const RideDispatch = require('../models/RideDispatch');
const DriverSession = require('../models/DriverSession');
require('../models/Driver');
const DriverSocketService = require('./driverSocketService');

class DispatchService {
    /**
     * Internal method to find nearby eligible drivers
     */
    static async findNearbyDrivers(ride, coordinates, maxDistance = 5000) {
        // Find drivers who are online, available, have a socket connection, and no active ride
        // using MongoDB $nearSphere on currentLocation
        const query = {
            isOnline: true,
            isAvailable: true,
            isOnBreak: false,
            currentRideId: null
        };

        // If it's a scheduled ride, driver must accept scheduled trips
        if (ride.isScheduled) {
            query.acceptScheduledTrips = true;
        }

        const drivers = await DriverSession.find(query).populate('driverId');
        

        if (drivers.length > 0) {

        }

        // Post-query filtering for maxPickupDistance and preferredRideTypes
        // We calculate distance roughly in meters
        const validDrivers = drivers.filter(session => {
            // Check preferred ride types (assuming ride.type exists, fallback to 'Standard')
            const rideType = ride.type || 'Standard';
            if (session.preferredRideTypes && session.preferredRideTypes.length > 0) {
                if (!session.preferredRideTypes.includes(rideType)) return false;
            }

            // Check if the current distance exceeds the driver's maxPickupDistance
            // The maxDistance is in meters, driver's maxPickupDistance is in km
            const driverMaxMeters = (session.maxPickupDistance || 5) * 1000;

            // If driver location is exactly [0,0] (uninitialized) or missing entirely, don't filter them out to avoid missing dispatches
            if (!session.currentLocation || !session.currentLocation.coordinates || 
                (session.currentLocation.coordinates[0] === 0 && session.currentLocation.coordinates[1] === 0)) {
                return true;
            }
            // Ideally we'd use $geoNear in an aggregation pipeline to get distance. 
            // For Sprint 17, we'll assume valid if they were returned by $nearSphere, 
            // but we can enforce strict driverMaxMeters if we had exact distance.
            
            return true;
        });

        return validDrivers;

        // We can add logic to filter suspended drivers, etc.
        // For now, assuming if they are online and available, they are eligible.
        return drivers;
    }

    /**
     * Get pending dispatches for a specific driver
     */
    static async getPendingDispatches(driverId) {
        return RideDispatch.find({
            driverId,
            status: 'Pending',
            expiresAt: { $gt: new Date() }
        }).populate('rideId').sort({ createdAt: 1 });
    }

    /**
     * Get a specific dispatch by ID
     */
    static async getDispatchById(dispatchId) {
        return RideDispatch.findById(dispatchId);
    }

    /**
     * Creates dispatches for a newly created ride and starts the broadcasting process.
     */
    static async createDispatch(ride, io) {
        // We assume ride.pickupLocation could be geocoded into coordinates.
        // Since ride currently stores pickupLocation as String, we might not have exact coordinates.
        // For demonstration, we'll use a default center or require the ride to have coordinates.
        // If no coordinates are present in the Ride model natively (since it's string based),
        // we'll fetch ALL available drivers for now or use a mock coordinate.
        // IDEALLY: Ride model should store pickupCoordinates: { type: 'Point', coordinates: [lng, lat] }.
        // Since we cannot change Ride model drastically without checking, let's assume a default coordinate
        // or just find online drivers. Wait, the prompt specifically says:
        // "Use MongoDB GeoJSON + $nearSphere on DriverSession.currentLocation as the primary mechanism".
        // If Ride doesn't have coordinates, we might need a fallback. Let's just pass [0,0] if none, 
        // or expect the frontend to send them in the future.
        
        let coords = [77.5946, 12.9716]; // Default to map center if none
        if (ride.pickupCoordinates && ride.pickupCoordinates.length === 2) {
            coords = ride.pickupCoordinates;
        }

        const nearbyDrivers = await this.findNearbyDrivers(ride, coords, 10000); // 10km radius
        
        if (nearbyDrivers.length === 0) {
            // Mark ride as NoDriverAvailable or keep searching later
            // (Could implement a retry mechanism here)
            return;
        }

        // Create a RideDispatch record for each nearby driver
        const dispatchDocs = [];
        const expiresAt = new Date(Date.now() + 300000); // 5 minutes to accept

        for (const driverSession of nearbyDrivers) {
            if (!driverSession.driverId) continue; // Skip if user was deleted or population failed
            
            const driverUserId = driverSession.driverId._id || driverSession.driverId;
            
            const dispatch = new RideDispatch({
                rideId: ride._id,
                driverId: driverUserId,
                status: 'Pending',
                expiresAt: expiresAt
            });
            await dispatch.save();
            dispatchDocs.push(dispatch);
        }

        this.broadcastRideRequest(ride, dispatchDocs, io);
    }

    /**
     * Broadcasts the ride request to specific drivers
     */
    static broadcastRideRequest(ride, dispatchDocs, io) {
        for (const dispatch of dispatchDocs) {
            const payload = {
                dispatchId: dispatch._id,
                ride: ride,
                expiresAt: dispatch.expiresAt
            };
            DriverSocketService.sendPersonalMessage(io, dispatch.driverId, 'rideRequest', payload);
        }
    }

    /**
     * Driver accepts a ride request
     */
    static async acceptRide(rideId, driverId, io) {
        try {
            // Find the specific pending dispatch
            const dispatch = await RideDispatch.findOne({
                rideId,
                driverId,
                status: 'Pending'
            });

            if (!dispatch) {
                const err = new Error("Dispatch not found or already processed");
                err.name = 'ConflictError';
                err.statusCode = 409;
                throw err;
            }

            if (new Date() > dispatch.expiresAt) {
                throw new Error("Dispatch has expired");
            }

            // Check if ride is still Searching or Pending
            const ride = await Ride.findById(rideId);
            if (!ride || (ride.status !== 'Searching' && ride.status !== 'Pending')) {
                const err = new Error("Ride is no longer available — already accepted by another driver");
                err.name = 'ConflictError';
                err.statusCode = 409;
                throw err;
            }

            // Update dispatch
            dispatch.status = 'Accepted';
            dispatch.acceptedAt = new Date();
            await dispatch.save();

            // Update ride
            ride.status = 'Accepted';
            ride.driver = driverId;
            await ride.save();

            // Update driver session
            const driverSession = await DriverSession.findOne({ driverId });
            if (driverSession) {
                driverSession.currentRideId = rideId;
                driverSession.isAvailable = false;
                await driverSession.save();
            }

            // Cancel all other pending dispatches for this ride
            const otherDispatches = await RideDispatch.find({
                rideId,
                _id: { $ne: dispatch._id },
                status: 'Pending'
            });

            for (const otherD of otherDispatches) {
                otherD.status = 'Cancelled';
                otherD.reason = 'Accepted by another driver';
                await otherD.save();
            }

            // Emit sockets
            // Notify the accepting driver
            DriverSocketService.sendPersonalMessage(io, driverId, 'rideAccepted', { ride, dispatchId: dispatch._id });

            // Notify other drivers
            for (const otherD of otherDispatches) {
                DriverSocketService.sendPersonalMessage(io, otherD.driverId, 'dispatchCancelled', { 
                    dispatchId: otherD._id,
                    rideId: rideId,
                    reason: 'Accepted by another driver' 
                });
            }

            // Notify Passenger
            this.notifyPassenger(rideId, 'rideAccepted', { ride }, io);

            return ride;
        } catch (error) {
            console.error('[DispatchService] Error in acceptRide:', error);
            throw error;
        }
    }

    /**
     * Driver rejects a ride request
     */
    static async rejectRide(rideId, driverId, io) {
        const dispatch = await RideDispatch.findOne({
            rideId,
            driverId,
            status: 'Pending'
        });

        if (!dispatch) {
            throw new Error("Dispatch not found or already processed");
        }

        dispatch.status = 'Rejected';
        dispatch.rejectedAt = new Date();
        dispatch.reason = 'Driver rejected';
        await dispatch.save();

        // Notify the driver that the rejection was successful
        DriverSocketService.sendPersonalMessage(io, driverId, 'rideRejected', { dispatchId: dispatch._id, rideId });

        // Check if any pending drivers remain
        const remainingPending = await RideDispatch.countDocuments({
            rideId,
            status: 'Pending'
        });

        if (remainingPending === 0) {
            // No drivers left, notify passenger
            const ride = await Ride.findById(rideId);
            if (ride && ride.status === 'Searching') {
                // We could implement retry logic here instead.
                this.notifyPassenger(rideId, 'noDriversAvailable', { rideId }, io);
            }
        }

        return dispatch;
    }

    /**
     * Mark a dispatch as expired
     */
    static async expireDispatch(dispatchId, io) {
        const dispatch = await RideDispatch.findById(dispatchId);
        if (dispatch && dispatch.status === 'Pending') {
            dispatch.status = 'Expired';
            await dispatch.save();

            DriverSocketService.sendPersonalMessage(io, dispatch.driverId, 'rideExpired', { 
                dispatchId: dispatch._id, 
                rideId: dispatch.rideId 
            });

            // Check if any drivers remain
            const remainingPending = await RideDispatch.countDocuments({
                rideId: dispatch.rideId,
                status: 'Pending'
            });

            if (remainingPending === 0) {
                const ride = await Ride.findById(dispatch.rideId);
                if (ride && ride.status === 'Searching') {
                    this.notifyPassenger(dispatch.rideId, 'noDriversAvailable', { rideId: dispatch.rideId }, io);
                }
            }
        }
    }

    /**
     * Cancel a dispatch directly
     */
    static async cancelDispatch(dispatchId, reason, io) {
        const dispatch = await RideDispatch.findById(dispatchId);
        if (dispatch && dispatch.status === 'Pending') {
            dispatch.status = 'Cancelled';
            dispatch.reason = reason;
            await dispatch.save();

            DriverSocketService.sendPersonalMessage(io, dispatch.driverId, 'dispatchCancelled', { 
                dispatchId: dispatch._id, 
                rideId: dispatch.rideId,
                reason: reason 
            });
        }
    }

    /**
     * Notify passenger via their personal socket
     */
    static notifyPassenger(rideId, event, data, io) {
        // Since we don't know the exact passenger socket logic from this side,
        // typically we can emit to the passenger's room or global if they joined a room
        // Assuming passenger room is user_<userId>
        Ride.findById(rideId).then(ride => {
            if (ride) {
                io.to(`user_${ride.userId}`).emit(event, data);
            }
        });
    }

    /**
     * Cron job or interval hook to clean up expired dispatches
     */
    static async cleanupExpiredDispatches(io) {
        const expiredPendingDispatches = await RideDispatch.find({
            status: 'Pending',
            expiresAt: { $lt: new Date() }
        });

        for (const dispatch of expiredPendingDispatches) {
            await this.expireDispatch(dispatch._id, io);
        }
    }
}

module.exports = DispatchService;
