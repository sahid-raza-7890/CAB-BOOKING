// â”€â”€â”€ adminRideController.js â€” UCAB Enterprise â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Thin controller: orchestrates Request â†’ RideService/DispatchService â†’ Response.
// ZERO business logic or DB queries here.

const RideService   = require('../services/rideService');
const asyncWrapper  = require('../utils/asyncWrapper');
const ResponseFormatter = require('../utils/responseFormatter');

class AdminRideController {

    // GET /api/admin/rides
    static listRides = asyncWrapper(async (req, res) => {
        const {
            page   = 1,
            limit  = 20,
            status,
            search,
            from,
            to,
            sort   = 'newest',
        } = req.query;

        const result = await RideService.getFilteredRides({
            page: parseInt(page, 10),
            limit: Math.min(parseInt(limit, 10) || 20, 100),
            status,
            search,
            from,
            to,
            sort,
        });

        return ResponseFormatter.successAdmin(res, result, 'Rides retrieved');
    });

    // GET /api/admin/rides/:id
    static getRide = asyncWrapper(async (req, res) => {
        const ride = await RideService.adminGetRideDetails(req.params.id);
        return ResponseFormatter.successAdmin(res, ride, 'Ride details retrieved');
    });

    // POST /api/admin/rides/:id/assign
    static assignDriver = asyncWrapper(async (req, res) => {
        const { driverId } = req.body;
        if (!driverId) {
            return ResponseFormatter.error(res, 'driverId is required', 'VALIDATION_ERROR', {}, 400);
        }
        const io = req.app.get('io');
        const ride = await RideService.adminAssignDriver(req.params.id, driverId, req.user._id, req.ip, io);
        return ResponseFormatter.successAdmin(res, ride, 'Driver assigned');
    });

    // POST /api/admin/rides/:id/cancel
    static cancelRide = asyncWrapper(async (req, res) => {
        const { reason } = req.body;
        const io = req.app.get('io');
        const ride = await RideService.adminCancelRide(req.params.id, reason, req.user._id, req.ip, io);
        return ResponseFormatter.successAdmin(res, ride, 'Ride cancelled by admin');
    });

    // POST /api/admin/rides/:id/complete
    static forceComplete = asyncWrapper(async (req, res) => {
        const io = req.app.get('io');
        const ride = await RideService.adminForceComplete(req.params.id, req.user._id, req.ip, io);
        return ResponseFormatter.successAdmin(res, ride, 'Ride force-completed by admin');
    });

    // POST /api/admin/rides/:id/refund
    static triggerRefund = asyncWrapper(async (req, res) => {
        const { reason } = req.body;
        const io = req.app.get('io');
        const ride = await RideService.adminTriggerRefund(req.params.id, reason, req.user._id, req.ip, io);
        return ResponseFormatter.successAdmin(res, ride, 'Refund triggered');
    });
}

module.exports = AdminRideController;
