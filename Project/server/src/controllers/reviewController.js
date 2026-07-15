const ReviewService = require('../services/reviewService');
const ResponseFormatter = require('../utils/responseFormatter');

class ReviewController {
    static async submitReview(req, res) {
        const passengerId = req.user.userId || req.user.id;
        const result = await ReviewService.submitReview(passengerId, req.body.rideId, req.body, req.io);
        return ResponseFormatter.success(res, result, "Review submitted successfully.");
    }

    static async getPassengerReviews(req, res) {
        const passengerId = req.user.userId || req.user.id;
        const result = await ReviewService.getPassengerReviews(passengerId, req.query);
        return ResponseFormatter.success(res, result);
    }

    static async getDriverReviews(req, res) {
        // Driver ID is passed in the query or param, usually query for public viewing
        // e.g. GET /api/reviews?driverId=...
        const driverId = req.query.driverId || req.params.driverId;
        const result = await ReviewService.getDriverReviews(driverId, req.query);
        return ResponseFormatter.success(res, result);
    }

    static async getReviewByRideId(req, res) {
        const passengerId = req.user.userId || req.user.id;
        const review = await ReviewService.getReviewByRideId(req.params.rideId, passengerId);
        return ResponseFormatter.success(res, review || null);
    }

    static async editReview(req, res) {
        const passengerId = req.user.userId || req.user.id;
        const result = await ReviewService.editReview(req.params.id, passengerId, req.body, req.io);
        return ResponseFormatter.success(res, result, "Review updated successfully.");
    }

    static async deleteReview(req, res) {
        const passengerId = req.user.userId || req.user.id;
        const result = await ReviewService.deleteReview(req.params.id, passengerId, req.io);
        return ResponseFormatter.success(res, result, "Review deleted successfully.");
    }

    static async reportReview(req, res) {
        const passengerId = req.user.userId || req.user.id;
        const result = await ReviewService.reportReview(req.params.id, passengerId);
        return ResponseFormatter.success(res, result, "Review reported successfully.");
    }
}

module.exports = ReviewController;
