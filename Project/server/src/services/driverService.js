const Driver = require('../models/Driver');

class DriverService {
    static async getAllDrivers() {
        return await Driver.find({});
    }

    static async getProfile(driverId) {
        const driver = await Driver.findById(driverId).select('-password');
        if (!driver) throw new Error('Driver not found');
        return driver;
    }

    static async updateProfile(driverId, updateData) {
        const driver = await Driver.findById(driverId);
        if (!driver) throw new Error('Driver not found');

        const { firstName, lastName, email, phone, bio, preferredLanguage } = updateData;

        if (firstName) driver.firstName = firstName;
        if (lastName) driver.lastName = lastName;
        if (email && email !== driver.email) {
            const emailInUse = await Driver.findOne({ email });
            if (emailInUse) throw new Error('Email already in use');
            driver.email = email;
        }
        if (phone !== undefined) driver.phone = phone;
        if (bio !== undefined) driver.bio = bio;
        if (preferredLanguage !== undefined) driver.preferredLanguage = preferredLanguage;

        await driver.save();
        return driver;
    }

    static async updateBanking(driverId, bankingDetails) {
        const driver = await Driver.findById(driverId);
        if (!driver) throw new Error('Driver not found');

        driver.bankingDetails = {
            ...driver.bankingDetails,
            ...bankingDetails
        };

        await driver.save();
        return driver.bankingDetails;
    }

    static async updateSchedule(driverId, availabilitySchedule) {
        const driver = await Driver.findById(driverId);
        if (!driver) throw new Error('Driver not found');

        driver.availabilitySchedule = availabilitySchedule;
        await driver.save();
        return driver.availabilitySchedule;
    }

    static async updateDocuments(driverId, documents) {
        const driver = await Driver.findById(driverId);
        if (!driver) throw new Error('Driver not found');

        driver.documents = {
            ...driver.documents,
            ...documents
        };
        await driver.save();
        return driver.documents;
    }

    static async changeAvatar(driverId, avatarUrl) {
        const driver = await Driver.findById(driverId);
        if (!driver) throw new Error('Driver not found');
        driver.avatar = avatarUrl;
        await driver.save();
        return { avatar: driver.avatar };
    }

    static async deleteAvatar(driverId) {
        const driver = await Driver.findById(driverId);
        if (!driver) throw new Error('Driver not found');
        driver.avatar = null;
        await driver.save();
        return { success: true };
    }

    /**
     * Paginated and filtered driver search for the Admin Portal.
     */
    static async getFilteredDrivers({ page = 1, limit = 20, status, search, sort = 'newest' } = {}) {
        const query = {};

        if (status && status !== 'All') {
            query.status = status;
        }

        if (search && search.trim()) {
            const re = new RegExp(search.trim(), 'i');
            query.$or = [
                { name: re },
                { email: re },
                { phone: re },
                { vehicleNumber: re }
            ];
        }

        const sortMap = {
            newest: { createdAt: -1 },
            oldest: { createdAt: 1 },
            rating: { rating: -1 },
            compliance: { complianceScore: -1 }
        };
        const sortOption = sortMap[sort] || { createdAt: -1 };

        const maxLimit = Math.min(limit, 100);
        const skip = (page - 1) * maxLimit;

        const [drivers, total] = await Promise.all([
            Driver.find(query)
                .sort(sortOption)
                .skip(skip)
                .limit(maxLimit)
                .lean(),
            Driver.countDocuments(query)
        ]);

        // Fetch online shift sessions dynamically
        const DriverSession = require('../models/DriverSession');
        const driverIds = drivers.map(d => d._id);
        const sessions = await DriverSession.find({ driverId: { $in: driverIds } }).lean();

        const driversWithSession = drivers.map(d => {
            const session = sessions.find(s => s.driverId.toString() === d._id.toString());
            return {
                ...d,
                isOnline: session ? session.isOnline : false,
                isAvailable: session ? session.isAvailable : false,
                isOnBreak: session ? session.isOnBreak : false
            };
        });

        return {
            drivers: driversWithSession,
            total,
            page,
            limit: maxLimit,
            pages: Math.ceil(total / maxLimit)
        };
    }

    /**
     * Complete driver aggregate details for admin drawer.
     */
    static async adminGetDriverDetails(driverId) {
        const driver = await Driver.findById(driverId).lean();
        if (!driver) throw new Error('Driver not found');

        const DriverSession = require('../models/DriverSession');
        const DriverVehicle = require('../models/DriverVehicle');
        const DriverDocument = require('../models/DriverDocument');
        const DriverEarning = require('../models/DriverEarning');

        const [session, vehicles, documents, earnings] = await Promise.all([
            DriverSession.findOne({ driverId }).lean(),
            DriverVehicle.find({ driverId }).lean(),
            DriverDocument.find({ driverId }).lean(),
            DriverEarning.find({ driverId }).lean()
        ]);

        return {
            ...driver,
            session: session || null,
            vehicles,
            documents,
            earningsSummary: {
                totalEarnings: earnings.reduce((sum, e) => sum + (e.netEarning || 0), 0),
                totalTips: earnings.reduce((sum, e) => sum + (e.tip || 0), 0),
                totalTrips: earnings.length
            }
        };
    }

    /**
     * Admin verifies a driver.
     */
    static async adminVerifyDriver(driverId, adminId, ipAddress, io) {
        const driver = await Driver.findById(driverId);
        if (!driver) throw new Error('Driver not found');

        const oldStatus = driver.status;
        driver.isVerified = true;
        driver.status = 'Active';
        await driver.save();

        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'VERIFY_DRIVER',
            targetType: 'Driver',
            targetId: driver._id,
            details: { oldStatus, newStatus: 'Active', isVerified: true },
            ipAddress
        });

        if (io) {
            io.to('admin_global').emit('admin_dashboard_update');
            io.to(`driver_${driverId}`).emit('driverStatusUpdated', { isVerified: true, status: 'Active' });
        }

        return driver;
    }

    /**
     * Admin suspends a driver.
     */
    static async adminSuspendDriver(driverId, adminId, ipAddress, io) {
        const driver = await Driver.findById(driverId);
        if (!driver) throw new Error('Driver not found');

        const oldStatus = driver.status;
        driver.status = 'Suspended';
        await driver.save();

        // Evict from active available shift sessions
        const DriverAvailabilityService = require('./driverAvailabilityService');
        try {
            await DriverAvailabilityService.goOffline(driverId, io);
        } catch (_) {}

        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'SUSPEND_DRIVER',
            targetType: 'Driver',
            targetId: driver._id,
            details: { oldStatus, newStatus: 'Suspended' },
            ipAddress
        });

        if (io) {
            io.to('admin_global').emit('admin_dashboard_update');
            io.to(`driver_${driverId}`).emit('driverStatusUpdated', { status: 'Suspended' });
        }

        return driver;
    }

    /**
     * Admin reactivates a suspended driver.
     */
    static async adminReactivateDriver(driverId, adminId, ipAddress, io) {
        const driver = await Driver.findById(driverId);
        if (!driver) throw new Error('Driver not found');

        const oldStatus = driver.status;
        driver.status = 'Active';
        await driver.save();

        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'REACTIVATE_DRIVER',
            targetType: 'Driver',
            targetId: driver._id,
            details: { oldStatus, newStatus: 'Active' },
            ipAddress
        });

        if (io) {
            io.to('admin_global').emit('admin_dashboard_update');
            io.to(`driver_${driverId}`).emit('driverStatusUpdated', { status: 'Active' });
        }

        return driver;
    }

    /**
     * Admin updates custom driver status.
     */
    static async adminUpdateDriverStatus(driverId, newStatus, adminId, ipAddress, io) {
        const driver = await Driver.findById(driverId);
        if (!driver) throw new Error('Driver not found');

        const oldStatus = driver.status;
        driver.status = newStatus;
        if (newStatus === 'Active') {
            driver.isVerified = true;
        }
        await driver.save();

        if (newStatus === 'Suspended') {
            const DriverAvailabilityService = require('./driverAvailabilityService');
            try {
                await DriverAvailabilityService.goOffline(driverId, io);
            } catch (_) {}
        }

        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'UPDATE_DRIVER_STATUS',
            targetType: 'Driver',
            targetId: driver._id,
            details: { oldStatus, newStatus },
            ipAddress
        });

        if (io) {
            io.to('admin_global').emit('admin_dashboard_update');
            io.to(`driver_${driverId}`).emit('driverStatusUpdated', { status: newStatus });
        }

        return driver;
    }

    /**
     * Expose driver documents.
     */
    static async getDriverDocuments(driverId) {
        const DriverDocumentService = require('./driverDocumentService');
        return await DriverDocumentService.getDocuments(driverId);
    }

    /**
     * Expose driver vehicles.
     */
    static async getDriverVehicles(driverId) {
        const DriverVehicleService = require('./driverVehicleService');
        return await DriverVehicleService.getVehicles(driverId);
    }

    /**
     * Expose driver earnings history.
     */
    static async getDriverEarnings(driverId) {
        const DriverEarningService = require('./driverEarningService');
        return await DriverEarningService.getEarningsHistory(driverId);
    }

    /**
     * Expose driver ride history.
     */
    static async getDriverHistory(driverId) {
        const Ride = require('../models/Ride');
        return await Ride.find({ driver: driverId })
            .populate('userId', 'name email phone')
            .sort({ createdAt: -1 })
            .lean();
    }
    // â”€â”€â”€ ADMIN ANALYTICS (Sprint 29) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    static async adminDriverAnalytics() {
        const Driver = require('../models/Driver');
        const [statusAgg, ratingAgg] = await Promise.all([
            Driver.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            Driver.aggregate([
                { $match: { averageRating: { $exists: true } } },
                { $group: { _id: null, avgRating: { $avg: '$averageRating' } } }
            ])
        ]);

        const statuses = {};
        statusAgg.forEach(s => { statuses[s._id] = s.count; });

        return {
            driversByStatus: statuses,
            averageRating: ratingAgg.length > 0 ? ratingAgg[0].avgRating.toFixed(2) : '0.00',
            totalDrivers: statusAgg.reduce((acc, curr) => acc + curr.count, 0)
        };
    }

    static async adminPerformanceLeaderboard() {
        const Driver = require('../models/Driver');
        const leaderboard = await Driver.find({ status: 'Active' })
            .sort({ averageRating: -1, totalTrips: -1 })
            .limit(10)
            .select('name phone averageRating totalTrips status')
            .lean();
            
        return leaderboard;
    }
}

module.exports = DriverService;
