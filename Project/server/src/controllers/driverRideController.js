const DispatchService = require('../services/dispatchService');
const ResponseFormatter = require('../utils/ResponseFormatter');

class DriverRideController {
    static async getPendingRequests(req, res) {
        const driverId = req.user.userId;
        const pendingDispatches = await DispatchService.getPendingDispatches(driverId);
        
        const formattedDispatches = pendingDispatches.map(dispatch => ({
            _id: dispatch._id,
            dispatchId: dispatch._id,
            ride: dispatch.rideId,
            expiresAt: dispatch.expiresAt,
            status: dispatch.status
        }));

        return ResponseFormatter.success(res, { data: formattedDispatches }, 'Pending requests retrieved successfully');
    }

    static async acceptRide(req, res) {
        const driverId = req.user.userId;
        const { id: dispatchId } = req.params;
        const io = req.app.get('io');

        const dispatch = await DispatchService.getDispatchById(dispatchId);
        if (!dispatch) {
            return ResponseFormatter.error(res, 'Dispatch not found', 'NOT_FOUND', {}, 404);
        }

        const ride = await DispatchService.acceptRide(dispatch.rideId, driverId, io);
        return ResponseFormatter.success(res, ride, 'Ride accepted successfully');
    }

    static async rejectRide(req, res) {
        const driverId = req.user.userId;
        const { id: dispatchId } = req.params;
        const io = req.app.get('io');

        const dispatch = await DispatchService.getDispatchById(dispatchId);
        if (!dispatch) {
            return ResponseFormatter.error(res, 'Dispatch not found', 'NOT_FOUND', {}, 404);
        }

        const result = await DispatchService.rejectRide(dispatch.rideId, driverId, io);
        return ResponseFormatter.success(res, result, 'Ride rejected successfully');
    }
}

module.exports = DriverRideController;
