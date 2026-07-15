const RideService = require('../services/rideService');
const ResponseFormatter = require('../utils/responseFormatter');
const CommunicationService = require('../services/CommunicationService');

class RideController {
    static async fareEstimate(req, res) {
        const { distanceKm = 0, type } = req.body;
        const multiplier = type === 'Airport Transfer' ? 1.2 : (type === 'Inter City' ? 0.9 : 1.0);
        const activeVehicles = await RideService.getActiveVehicles();
        const estimates = activeVehicles.map(v => {
            const total = (v.baseFare + (v.perKmRate * distanceKm)) * multiplier;
            return { id: v._id, type: v.type, label: v.label, emoji: v.emoji, baseFare: v.baseFare, perKmRate: v.perKmRate, estimatedTotal: Math.round(total * 100) / 100, eta: v.eta || '5 min' };
        }).sort((a, b) => a.estimatedTotal - b.estimatedTotal);
        return ResponseFormatter.success(res, { estimates, distanceKm });
    }

    static async rentalFareEstimate(req, res) {
        const { hours = 2 } = req.body;
        const activeVehicles = await RideService.getActiveVehicles();
        const estimates = activeVehicles.map(v => {
            const baseFare = v.baseFare * 3 * (hours / 2); // Simple base fare logic
            const tax = Math.round(baseFare * 0.05 * 100) / 100;
            const total = baseFare + tax;
            return { 
                id: v._id, 
                type: v.type, 
                label: v.label, 
                emoji: v.emoji, 
                baseFare: v.baseFare, 
                estimatedTotal: Math.round(total * 100) / 100, 
                eta: v.eta || '5 min',
                overtimeRate: Math.round(v.baseFare * 0.8 * 100) / 100,
                extraDistanceRate: v.perKmRate,
                breakdown: { base: baseFare, tax }
            };
        }).sort((a, b) => a.estimatedTotal - b.estimatedTotal);
        return ResponseFormatter.success(res, { estimates });
    }

    static async requestRide(req, res) {
        const io = req.app.get('io');
        const userId = req.user.userId || req.user.id;
        const userName = req.user.name;
        const ride = await RideService.createRide(userId, userName, req.body, io);
        return ResponseFormatter.success(res, { ride }, req.body.schedule?.scheduled ? 'Ride scheduled successfully' : 'Ride booked successfully', 201);
    }

    static async rebookRide(req, res) {
        const io = req.app.get('io');
        const userId = req.user.userId || req.user.id;
        const rideId = req.params.id;
        const ride = await RideService.rebookRide(userId, rideId, io);
        return ResponseFormatter.success(res, { ride }, 'Ride rebooked successfully', 201);
    }

    static async getScheduledRides(req, res) {
        const userId = req.user.userId || req.user.id;
        const rides = await RideService.getScheduledRides(userId);
        return ResponseFormatter.success(res, { rides });
    }

    static async cancelScheduledRide(req, res) {
        const userId = req.user.userId || req.user.id;
        const ride = await RideService.cancelScheduledRide(userId, req.params.id);
        return ResponseFormatter.success(res, { ride }, 'Scheduled ride cancelled successfully');
    }

    // â”€â”€â”€ SPRINT 39 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    static async modifyScheduledRide(req, res) {
        const io = req.app.get('io');
        const userId = req.user.userId || req.user.id;
        const ride = await RideService.modifyScheduledRide(userId, req.params.id, req.body, io);
        return ResponseFormatter.success(res, { ride }, 'Scheduled ride updated successfully');
    }

    static async getActiveRide(req, res) {
        const userId = req.user.userId || req.user.id;
        const activeRide = await RideService.getActiveRide(userId);
        return ResponseFormatter.success(res, activeRide || null);
    }

    static async getMyRides(req, res) {
        const userId = req.user.userId || req.user.id;
        const data = await RideService.getMyRides(userId, req.query);
        return ResponseFormatter.success(res, data);
    }

    static async getAllRides(req, res) {
        const rides = await RideService.getAllRides();
        return res.status(200).json(rides);
    }

    static async getPendingRides(req, res) {
        const pendingRides = await RideService.getPendingRides();
        return ResponseFormatter.success(res, pendingRides);
    }

    static async acceptRide(req, res) {
        const io = req.app.get('io');
        const driverId = req.user.userId || req.user.id;
        const ride = await RideService.acceptRide(req.params.id, driverId, io);
        return ResponseFormatter.success(res, { ride }, 'Ride accepted successfully!');
    }

    static async cancelRide(req, res) {
        const io = req.app.get('io');
        const userId = req.user.userId || req.user.id;
        const reason = req.body ? req.body.reason : undefined;
        const ride = await RideService.cancelRide(userId, req.params.id, reason, io);
        return ResponseFormatter.success(res, { ride }, 'Ride cancelled.');
    }

    static async getRideDetails(req, res) {
        const userId = req.user.userId || req.user.id;

        const ride = await RideService.getRideDetails(userId, req.params.id);

        return ResponseFormatter.success(res, { data: ride });
    }

    static async rateRide(req, res) {
        const io = req.app.get('io');
        const userId = req.user.userId || req.user.id;
        const ride = await RideService.rateRide(userId, req.params.id, req.body, io);
        return ResponseFormatter.success(res, { ride }, 'Rating submitted successfully.');
    }

    static async startRide(req, res) {
        const io = req.app.get('io');
        const ride = await RideService.startRide(req.params.id, req.body.otp, io);
        return ResponseFormatter.success(res, { ride }, 'Ride started successfully.');
    }

    static async completeRide(req, res) {
        const io = req.app.get('io');
        const ride = await RideService.completeRide(req.params.id, io);
        return ResponseFormatter.success(res, { ride }, 'Ride completed successfully.');
    }

    static async maskCall(req, res) {
        const userId = req.user.userId || req.user.id;
        return ResponseFormatter.success(res, { maskedCallUrl: 'local-modal' });
    }

    static async shareRide(req, res) {
        const CommunicationService = require('../services/communicationService');
        const url = CommunicationService.generateLiveTrackingUrl(req.params.id);
        return ResponseFormatter.success(res, { shareUrl: url });
    }

    static async assignDriver(req, res) {
        const io = req.app.get('io');
        const ride = await RideService.assignDriver(req.params.id, req.body.driverId, io);
        return ResponseFormatter.success(res, { ride }, 'Driver assigned.');
    }

    static async deleteRideAsAdmin(req, res) {
        const io = req.app.get('io');
        const ride = await RideService.deleteRideAsAdmin(req.body.rideId, io);
        return ResponseFormatter.success(res, { ride }, 'The ride is cancelled!');
    }
}

module.exports = RideController;

// Just a placeholder to ensure the file isn't locked.
