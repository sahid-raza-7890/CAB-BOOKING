const DriverRideLifecycleService = require('../services/driverRideLifecycleService');
const ResponseFormatter = require('../utils/responseFormatter');

class DriverRideLifecycleController {
    static async getActiveRide(req, res) {
        const driverId = req.user.userId;
        const ride = await DriverRideLifecycleService.getActiveRide(driverId);
        if (!ride) {
            return res.status(404).json({ success: true, data: null });
        }
        return ResponseFormatter.success(res, { data: ride }, 'Active ride retrieved successfully');
    }

    static async arriveAtPickup(req, res) {
        const { id: rideId } = req.params;
        const driverId = req.user.userId;
        const io = req.app.get('io');

        const ride = await DriverRideLifecycleService.arriveAtPickup(rideId, driverId, io);
        return ResponseFormatter.success(res, ride, 'Driver arrived at pickup');
    }

    static async verifyOTP(req, res) {
        const { id: rideId } = req.params;
        const { otp } = req.body || {};
        const driverId = req.user.userId;
        const io = req.app.get('io');

        const ride = await DriverRideLifecycleService.verifyOTP(rideId, driverId, otp, io);
        return ResponseFormatter.success(res, ride, 'OTP verified successfully');
    }

    static async startRide(req, res) {
        const { id: rideId } = req.params;
        const { otp } = req.body || {};
        const driverId = req.user.userId;
        const io = req.app.get('io');

        const ride = await DriverRideLifecycleService.startRide(rideId, driverId, otp, io);
        return ResponseFormatter.success(res, ride, 'Ride started successfully');
    }

    static async updateLocation(req, res) {
        const { id: rideId } = req.params;
        const { location } = req.body || {};
        const driverId = req.user.userId;
        const io = req.app.get('io');

        const result = await DriverRideLifecycleService.updateRideLocation(rideId, driverId, location, io);
        return ResponseFormatter.success(res, result, 'Location updated');
    }

    static async completeRide(req, res) {
        const { id: rideId } = req.params;
        const driverId = req.user.userId;
        const io = req.app.get('io');

        const ride = await DriverRideLifecycleService.completeRide(rideId, driverId, io);
        return ResponseFormatter.success(res, ride, 'Ride completed successfully');
    }

    static async cancelRide(req, res) {
        const { id: rideId } = req.params;
        const { reason } = req.body || {};
        const driverId = req.user.userId;
        const io = req.app.get('io');

        const ride = await DriverRideLifecycleService.cancelActiveRide(rideId, driverId, reason, io);
        return ResponseFormatter.success(res, ride, 'Ride cancelled successfully');
    }
}

module.exports = DriverRideLifecycleController;
