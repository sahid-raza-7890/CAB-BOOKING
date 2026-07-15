const Review = require('../models/Review');
const Ride = require('../models/Ride');
const ReviewService = require('./reviewService');

class DriverReviewService {
    /**
     * Get paginated and filtered reviews for a driver
     */
    static async getDriverReviews(driverId, options = {}) {
        const { page = 1, limit = 10, sort = 'newest', search, rating } = options;
        
        const query = { driverId, status: 'Published' };

        if (rating) {
            query.overallRating = parseInt(rating);
        }

        if (search) {
            query.review = { $regex: search, $options: 'i' };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOption = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

        const [reviews, total] = await Promise.all([
            Review.find(query)
                .populate({ path: 'passengerId', select: 'firstName lastName profilePicture' })
                .populate({ path: 'rideId', select: 'pickupLocation dropoffLocation createdAt' })
                .sort(sortOption)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Review.countDocuments(query)
        ]);

        // Mask anonymous passengers
        const maskedReviews = reviews.map(r => {
            if (r.isAnonymous && r.passengerId) {
                r.passengerId.firstName = 'Anonymous';
                r.passengerId.lastName = 'Passenger';
                r.passengerId.profilePicture = '';
            }
            return r;
        });

        return {
            reviews: maskedReviews,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        };
    }

    /**
     * Get a specific review
     */
    static async getDriverReview(reviewId, driverId) {
        const review = await Review.findOne({ _id: reviewId, driverId, status: 'Published' })
            .populate({ path: 'passengerId', select: 'firstName lastName profilePicture' })
            .populate({ path: 'rideId', select: 'pickupLocation dropoffLocation createdAt fare' })
            .lean();

        if (!review) throw new Error('Review not found or unauthorized access.');

        if (review.isAnonymous && review.passengerId) {
            review.passengerId.firstName = 'Anonymous';
            review.passengerId.lastName = 'Passenger';
            review.passengerId.profilePicture = '';
        }

        return review;
    }

    /**
     * Get Driver Rating Summary
     */
    static async getDriverRatingSummary(driverId) {
        // Reuse ReviewService to calculate the core histogram and average
        const coreStats = await ReviewService.calculateDriverRating(driverId);
        
        // Calculate Category Averages
        const categoryStats = await Review.aggregate([
            { $match: { driverId: driverId, status: 'Published' } },
            {
                $group: {
                    _id: null,
                    driving: { $avg: '$ratings.driving' },
                    cleanliness: { $avg: '$ratings.cleanliness' },
                    behavior: { $avg: '$ratings.behavior' },
                    punctuality: { $avg: '$ratings.punctuality' },
                    vehicleCondition: { $avg: '$ratings.vehicleCondition' }
                }
            }
        ]);

        return {
            averageRating: coreStats.averageRating,
            totalReviews: coreStats.count,
            distribution: coreStats.histogram,
            categories: categoryStats.length > 0 ? categoryStats[0] : {
                driving: 0, cleanliness: 0, behavior: 0, punctuality: 0, vehicleCondition: 0
            }
        };
    }

    static async submitPassengerReview(driverId, rideId, payload, io) {
        const ride = await Ride.findOne({ _id: rideId, driver: driverId });
        if (!ride) throw new Error('Ride not found or unauthorized access.');
        if (ride.status !== 'Completed') throw new Error('You can only review completed rides.');

        const PassengerRating = require('../models/PassengerRating');
        
        const existingReview = await PassengerRating.findOne({ rideId });
        if (existingReview) {
            const err = new Error("A review already exists for this ride.");
            err.name = 'ConflictError';
            err.statusCode = 409;
            throw err;
        }

        // Use ?? (nullish coalescing) so that 0 does not incorrectly fall through
        const mappedRating = payload.overallRating ?? payload.rating;
        const { ratings, review, tags } = payload;

        if (!mappedRating || mappedRating < 1 || mappedRating > 5) {
            const err = new Error("overallRating must be between 1 and 5.");
            err.name = 'ValidationError';
            throw err;
        }

        const newReview = new PassengerRating({
            rideId,
            passengerId: ride.passenger || ride.userId,
            driverId,
            overallRating: mappedRating,
            ratings: ratings || {},
            review: review || '',
            tags: tags || []
        });

        await newReview.save();

        // Recalculate Passenger Rating
        await DriverReviewService.calculatePassengerRating(newReview.passengerId, io);

        if (io) {
            io.emit('passengerReviewCreated', { rideId, passengerId: newReview.passengerId });
        }

        return newReview;
    }

    static async calculatePassengerRating(passengerId, io) {
        const PassengerRating = require('../models/PassengerRating');
        const User = require('../models/User');

        const reviews = await PassengerRating.find({ passengerId, status: 'Published' });
        
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

        await User.findByIdAndUpdate(passengerId, {
            rating: Number(averageRating.toFixed(2)),
            ratingCount: count,
            ratingDistribution: histogram
        });

        if (io) {
            io.emit('passengerRatingUpdated', { passengerId, rating: averageRating, count });
        }

        return { averageRating, count, histogram };
    }
}

module.exports = DriverReviewService;
