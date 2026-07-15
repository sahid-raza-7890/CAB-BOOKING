const Ride = require('../models/Ride');
const DriverEarning = require('../models/DriverEarning');
const DriverEarningService = require('./driverEarningService');
const TripHistoryService = require('./tripHistoryService');

class DriverTripHistoryService {
    /**
     * Get paginated and filtered history for a driver
     */
    static async getTripHistory(driverId, options = {}) {
        const { page = 1, limit = 10, status, search, startDate, endDate } = options;
        
        const query = { driver: driverId };

        if (status) query.status = status;
        
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        // We can't search deeply into passenger name efficiently without population or denormalization.
        // The Ride model has legacy `passengerName`, we can use that for lightweight search.
        if (search) {
            query.$or = [
                { pickupLocation: { $regex: search, $options: 'i' } },
                { dropoffLocation: { $regex: search, $options: 'i' } },
                { passengerName: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const [rides, total] = await Promise.all([
            Ride.find(query)
                .sort({ 'timeline.booking': -1, createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('userId', 'firstName lastName phone profilePicture')
                .lean(),
            Ride.countDocuments(query)
        ]);

        return {
            rides,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Get detailed view for a single ride, verifying ownership.
     */
    static async getTripDetails(rideId, driverId) {
        const ride = await Ride.findOne({ _id: rideId, driver: driverId })
            .populate('userId', 'firstName lastName phone profilePicture email')
            .populate('vehicleId', 'make model licensePlate')
            .lean();

        if (!ride) {
            throw new Error('Ride not found or unauthorized access.');
        }

        // Fetch earning and settlement records for this specific ride
        const earning = await DriverEarning.findOne({ rideId }).lean();
        
        return {
            ride,
            earning: earning || null
        };
    }

    /**
     * Get Trip Invoice - Reuses existing logic if available.
     */
    static async getTripInvoice(rideId, driverId) {
        // Verify ownership
        const ride = await Ride.findOne({ _id: rideId, driver: driverId }).lean();
        if (!ride) throw new Error('Ride not found or unauthorized.');

        // Re-use TripHistoryService logic which already generates an invoice structure
        return await TripHistoryService.getInvoice(rideId);
    }

    /**
     * Aggregate Analytics for the driver.
     * Reuses DriverEarningService for financial metrics, 
     * queries Ride for completion stats.
     */
    static async getTripAnalytics(driverId) {
        const [earningsSummary, totalRides, completedRides, cancelledRides] = await Promise.all([
            DriverEarningService.getDashboardEarnings(driverId), // Reusing existing method for financial aggregation
            Ride.countDocuments({ driver: driverId }),
            Ride.countDocuments({ driver: driverId, status: 'Completed' }),
            Ride.countDocuments({ driver: driverId, status: 'Cancelled' })
        ]);

        const acceptanceRate = totalRides > 0 ? ((completedRides + cancelledRides) / totalRides) * 100 : 100;
        const completionRate = (completedRides + cancelledRides) > 0 ? (completedRides / (completedRides + cancelledRides)) * 100 : 100;

        // Fetch average rating from rides where rating exists
        const ratedRides = await Ride.aggregate([
            { $match: { driver: driverId, 'rating.driverRating': { $exists: true, $ne: null } } },
            { $group: { _id: null, avgRating: { $avg: '$rating.driverRating' }, count: { $sum: 1 } } }
        ]);

        const averageRating = ratedRides.length > 0 ? ratedRides[0].avgRating : 5.0;

        return {
            totalTrips: completedRides,
            acceptanceRate: Math.round(acceptanceRate),
            completionRate: Math.round(completionRate),
            averageRating: Math.round(averageRating * 10) / 10,
            earnings: earningsSummary
        };
    }
}

module.exports = DriverTripHistoryService;
