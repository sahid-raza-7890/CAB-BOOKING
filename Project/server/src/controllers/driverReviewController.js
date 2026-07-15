const DriverReviewService = require('../services/driverReviewService');

class DriverReviewController {
    static async getDriverReviews(req, res) {
        const options = {
            page: req.query.page,
            limit: req.query.limit,
            sort: req.query.sort,
            search: req.query.search,
            rating: req.query.rating
        };
        const driverId = req.user.userId || req.user.id;
        const data = await DriverReviewService.getDriverReviews(driverId, options);
        res.json({ success: true, ...data });
    }

    static async getDriverRatingSummary(req, res) {
        const data = await DriverReviewService.getDriverRatingSummary(req.user.id);
        res.json({ success: true, data });
    }

    static async getDriverReview(req, res) {
        const data = await DriverReviewService.getDriverReview(req.params.id, req.user.id);
        res.json({ success: true, data });
    }

    static async submitPassengerReview(req, res) {
        // Use userId (same field used when setting ride.driver during acceptRide)
        const driverId = req.user.userId || req.user.id;
        const data = await DriverReviewService.submitPassengerReview(driverId, req.params.rideId, req.body);
        res.status(201).json({ success: true, data });
    }
}

module.exports = DriverReviewController;
