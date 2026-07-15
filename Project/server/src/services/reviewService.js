const Review = require('../models/Review');
const Ride = require('../models/Ride');
const Driver = require('../models/Driver');
const NotificationService = require('./notificationService');

class ReviewService {
    /**
     * Submit a new review for a completed ride.
     */
    static async submitReview(passengerId, rideId, payload, io) {
        // Validate ride ownership and status
        const ride = await Ride.findOne({ _id: rideId, userId: passengerId });
        if (!ride) throw new Error("Ride not found or unauthorized");
        if (ride.status !== 'Completed') throw new Error("Only completed rides can be reviewed.");

        // Check for duplicate reviews
        const existingReview = await Review.findOne({ rideId });
        if (existingReview) {
            const err = new Error("A review already exists for this ride.");
            err.name = 'ConflictError';
            err.statusCode = 409;
            throw err;
        }

        // Support 'rating' alias for 'overallRating' to match frontend/test expectations
        // Use ?? (nullish coalescing) so that 0 does not incorrectly fall through
        const mappedRating = payload.overallRating ?? payload.rating;
        const { ratings, review, tags, isAnonymous } = payload;
        
        if (!mappedRating || mappedRating < 1 || mappedRating > 5) {
            const err = new Error("overallRating must be between 1 and 5.");
            err.name = 'ValidationError';
            throw err;
        }

        const newReview = new Review({
            rideId,
            passengerId,
            driverId: ride.driver,
            overallRating: mappedRating,
            ratings: ratings || {},
            review: review || '',
            tags: tags || [],
            isAnonymous: Boolean(isAnonymous)
        });

        await newReview.save();

        // Recalculate Driver Rating
        await ReviewService.calculateDriverRating(ride.driver, io);

        // Notify Driver
        if (io) {
            io.emit('reviewCreated', { rideId, driverId: ride.driver });
            await NotificationService.createNotification({
                userId: ride.driver,
                title: 'New Review Received',
                description: `You received a new ${mappedRating}-star review for a recent ride.`,
                type: 'NEW_REVIEW',
                category: 'Feedback',
                icon: 'star',
                actionUrl: `/driver/reviews`
            }, io).catch(err => console.error("Notification Error:", err));
        }

        // Update Ride to indicate it has been rated
        if (!ride.rating) {
            ride.rating = { submittedAt: new Date(), driver: mappedRating };
            await ride.save();
        }

        return newReview;
    }

    static async getReviewByRideId(rideId, passengerId) {
        return await Review.findOne({ rideId, passengerId });
    }

    /**
     * Recalculate average rating for a driver
     */
    static async calculateDriverRating(driverId, io) {
        const reviews = await Review.find({ driverId, status: 'Published' });
        
        let totalRating = 0;
        let count = reviews.length;
        
        const histogram = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        
        reviews.forEach(r => {
            totalRating += r.overallRating;
            if (histogram[r.overallRating] !== undefined) {
                histogram[r.overallRating]++;
            }
        });

        const averageRating = count > 0 ? (totalRating / count) : 0;

        await Driver.findByIdAndUpdate(driverId, {
            rating: Number(averageRating.toFixed(2)),
            ratingCount: count,
            ratingDistribution: histogram
        });

        if (io) {
            io.emit('driverRatingUpdated', { driverId, rating: averageRating, count });
        }

        return { averageRating, count, histogram };
    }

    /**
     * Get all reviews written by a passenger
     */
    static async getPassengerReviews(passengerId, queryParams = {}) {
        const { page = 1, limit = 10, sort = 'newest' } = queryParams;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOption = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

        const reviews = await Review.find({ passengerId })
            .populate({ path: 'rideId', select: 'pickupLocation dropoffLocation fare vehicleType createdAt' })
            .populate({ path: 'driverId', select: 'name avatar' })
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Review.countDocuments({ passengerId });

        return { reviews, total, pages: Math.ceil(total / parseInt(limit)) };
    }

    /**
     * Get all reviews for a driver
     */
    static async getDriverReviews(driverId, queryParams = {}) {
        const { page = 1, limit = 10, sort = 'newest' } = queryParams;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOption = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

        const reviews = await Review.find({ driverId, status: 'Published' })
            .populate({ path: 'passengerId', select: 'name avatar' })
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit));

        // If anonymous, mask the passenger info
        const maskedReviews = reviews.map(r => {
            const obj = r.toObject();
            if (obj.isAnonymous && obj.passengerId) {
                obj.passengerId.name = 'Anonymous Passenger';
                obj.passengerId.avatar = '';
            }
            return obj;
        });

        const total = await Review.countDocuments({ driverId, status: 'Published' });
        return { reviews: maskedReviews, total, pages: Math.ceil(total / parseInt(limit)) };
    }

    /**
     * Edit a review
     */
    static async editReview(reviewId, passengerId, payload, io) {
        const review = await Review.findOne({ _id: reviewId, passengerId });
        if (!review) throw new Error("Review not found or unauthorized");

        if (payload.overallRating) review.overallRating = payload.overallRating;
        if (payload.ratings) review.ratings = { ...review.ratings, ...payload.ratings };
        if (payload.review !== undefined) review.review = payload.review;
        if (payload.tags) review.tags = payload.tags;
        if (payload.isAnonymous !== undefined) review.isAnonymous = payload.isAnonymous;

        await review.save();
        
        await ReviewService.calculateDriverRating(review.driverId, io);

        if (io) io.emit('reviewUpdated', { reviewId, driverId: review.driverId });

        return review;
    }

    /**
     * Delete a review
     */
    static async deleteReview(reviewId, passengerId, io) {
        const review = await Review.findOne({ _id: reviewId, passengerId });
        if (!review) throw new Error("Review not found or unauthorized");

        await review.deleteOne();
        await ReviewService.calculateDriverRating(review.driverId, io);

        if (io) io.emit('reviewUpdated', { reviewId, deleted: true, driverId: review.driverId });
        return { success: true };
    }

    /**
     * Report a review
     */
    static async reportReview(reviewId, passengerId) {
        const review = await Review.findOne({ _id: reviewId });
        if (!review) throw new Error("Review not found");

        // Simple mechanism to mark review for admin attention
        review.status = 'Reported';
        review.adminNotes = `Reported by user ${passengerId}`;
        await review.save();

        return review;
    }
}

module.exports = ReviewService;
