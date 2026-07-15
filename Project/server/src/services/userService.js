const User = require('../models/User');
const bcrypt = require('bcryptjs');

class UserService {
    static async getProfile(userId) {
        const user = await User.findById(userId).select('-password');
        if (!user) throw new Error('User not found');
        return user;
    }

    static async updateProfile(userId, updateData) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        const { name, email, phone, bio, preferredLanguage, currentPassword, newPassword } = updateData;

        if (name) user.name = name;
        if (email && email !== user.email) {
            const emailInUse = await User.findOne({ email });
            if (emailInUse) throw new Error('Email already in use');
            user.email = email;
        }
        if (phone !== undefined) user.phone = phone;
        if (bio !== undefined) user.bio = bio;
        if (preferredLanguage !== undefined) user.preferredLanguage = preferredLanguage;

        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) throw new Error('Invalid current password');
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        await user.save();
        return { name: user.name, email: user.email, role: user.role, avatar: user.avatar };
    }

    static async changeAvatar(userId, avatarUrl) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');
        user.avatar = avatarUrl;
        await user.save();
        return { avatar: user.avatar };
    }

    static async deleteAvatar(userId) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');
        user.avatar = null;
        await user.save();
        return { success: true };
    }

    static async getPaymentSettings(userId) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');
        return {
            paymentMethods: user.paymentMethods || [],
            billingAddress: user.billingAddress || {}
        };
    }

    static async updatePaymentSettings(userId, data) {
        const { paymentMethods, billingAddress } = data;
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        if (paymentMethods !== undefined) user.paymentMethods = paymentMethods;
        if (billingAddress !== undefined) {
            user.billingAddress = {
                street: billingAddress.street || '',
                city: billingAddress.city || '',
                state: billingAddress.state || '',
                postalCode: billingAddress.postalCode || '',
                country: billingAddress.country || ''
            };
        }

        await user.save();
        return {
            paymentMethods: user.paymentMethods,
            billingAddress: user.billingAddress
        };
    }

    static async updatePreferences(userId, preferences) {
        const user = await User.findByIdAndUpdate(
            userId,
            { $set: { preferences } },
            { new: true }
        );
        if (!user) throw new Error('User not found');
        return user.preferences || {};
    }

    static async getAllUsers() {
        return await User.find().select('-password');
    }

    // --- Admin Dashboard Aggregations ---
    static async getAdminOnlinePassengersCount() {
        // Without a passenger session table, we approximate active passengers
        // by checking recently updated passenger records.
        const activeThreshold = new Date(Date.now() - 15 * 60 * 1000); // last 15 mins
        return await User.countDocuments({ role: 'Passenger', updatedAt: { $gte: activeThreshold } });
    }

    // â”€â”€â”€ ADMIN PASSENGER MANAGEMENT (Sprint 24) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    /**
     * Paginated and filtered user listing for the Admin Portal.
     */
    static async getFilteredUsers({ page = 1, limit = 20, status, search, sort = 'newest' } = {}) {
        const query = { role: 'Passenger' };

        if (status && status !== 'All') {
            query.status = status;
        }

        if (search && search.trim()) {
            const re = new RegExp(search.trim(), 'i');
            query.$or = [
                { name: re },
                { email: re },
                { phone: re }
            ];
        }

        const sortMap = {
            newest: { createdAt: -1 },
            oldest: { createdAt: 1 }
        };
        const sortOption = sortMap[sort] || { createdAt: -1 };

        const maxLimit = Math.min(limit, 100);
        const skip = (page - 1) * maxLimit;

        const [users, total] = await Promise.all([
            User.find(query)
                .select('-password')
                .sort(sortOption)
                .skip(skip)
                .limit(maxLimit)
                .lean(),
            User.countDocuments(query)
        ]);

        return {
            users,
            total,
            page,
            limit: maxLimit,
            pages: Math.ceil(total / maxLimit)
        };
    }

    /**
     * Complete passenger aggregate details.
     */
    static async adminGetUserDetails(userId) {
        const user = await User.findById(userId).select('-password').lean();
        if (!user) throw new Error('User not found');

        const Wallet = require('../models/Wallet');
        const Ride = require('../models/Ride');
        const mongoose = require('mongoose');

        const [wallet, rideStats] = await Promise.all([
            Wallet.findOne({ userId, userType: 'Passenger' }).lean(),
            Ride.aggregate([
                { $match: { userId: new mongoose.Types.ObjectId(userId) } },
                {
                    $group: {
                        _id: null,
                        totalFares: { $sum: '$fare' },
                        totalTrips: { $sum: 1 },
                        completedTrips: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } }
                    }
                }
            ])
        ]);

        const stats = rideStats[0] || { totalFares: 0, totalTrips: 0, completedTrips: 0 };

        return {
            ...user,
            walletBalance: wallet ? wallet.balance : 0,
            stats
        };
    }

    /**
     * Admin suspends user.
     */
    static async adminSuspendUser(userId, adminId, ipAddress, io) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        const oldStatus = user.status;
        user.status = 'Suspended';
        await user.save();

        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'SUSPEND_USER',
            targetType: 'User',
            targetId: user._id,
            details: { oldStatus, newStatus: 'Suspended' },
            ipAddress
        });

        if (io) {
            io.to('admin_global').emit('admin_dashboard_update');
            io.to(`user_${userId}`).emit('userStatusUpdated', { status: 'Suspended' });
        }

        return user;
    }

    /**
     * Admin reactivates suspended user.
     */
    static async adminReactivateUser(userId, adminId, ipAddress, io) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        const oldStatus = user.status;
        user.status = 'Active';
        await user.save();

        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'REACTIVATE_USER',
            targetType: 'User',
            targetId: user._id,
            details: { oldStatus, newStatus: 'Active' },
            ipAddress
        });

        if (io) {
            io.to('admin_global').emit('admin_dashboard_update');
            io.to(`user_${userId}`).emit('userStatusUpdated', { status: 'Active' });
        }

        return user;
    }

    /**
     * Admin updates user status.
     */
    static async adminUpdateUserStatus(userId, newStatus, adminId, ipAddress, io) {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        const oldStatus = user.status;
        user.status = newStatus;
        await user.save();

        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'UPDATE_USER_STATUS',
            targetType: 'User',
            targetId: user._id,
            details: { oldStatus, newStatus },
            ipAddress
        });

        if (io) {
            io.to('admin_global').emit('admin_dashboard_update');
            io.to(`user_${userId}`).emit('userStatusUpdated', { status: newStatus });
        }

        return user;
    }

    /**
     * Get passenger ride history.
     */
    static async adminGetUserRideHistory(userId) {
        const Ride = require('../models/Ride');
        return await Ride.find({ userId })
            .populate('driver', 'name phone rating avatar')
            .sort({ createdAt: -1 })
            .lean();
    }

    /**
     * Get passenger wallet transaction details.
     */
    static async adminGetUserWallet(userId) {
        const Wallet = require('../models/Wallet');
        const WalletTransaction = require('../models/WalletTransaction');
        
        const [wallet, transactions] = await Promise.all([
            Wallet.findOne({ userId, userType: 'Passenger' }).lean(),
            WalletTransaction.find({ userId, userType: 'Passenger' }).sort({ createdAt: -1 }).lean()
        ]);

        return {
            balance: wallet ? wallet.balance : 0,
            status: wallet ? wallet.status : 'Active',
            transactions
        };
    }

    /**
     * Get passenger payments.
     */
    static async adminGetUserPayments(userId) {
        const Payment = require('../models/Payment');
        return await Payment.find({ userId })
            .sort({ createdAt: -1 })
            .lean();
    }

    // â”€â”€â”€ ADMIN ANALYTICS (Sprint 29) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    static async adminPassengerAnalytics() {
        const User = require('../models/User');
        const [statusAgg, recentAgg] = await Promise.all([
            User.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            User.aggregate([
                { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
                { $group: { _id: null, count: { $sum: 1 } } }
            ])
        ]);

        const statuses = {};
        statusAgg.forEach(s => { statuses[s._id] = s.count; });

        return {
            passengersByStatus: statuses,
            newRegistrations30d: recentAgg.length > 0 ? recentAgg[0].count : 0,
            totalPassengers: statusAgg.reduce((acc, curr) => acc + curr.count, 0)
        };
    }

    static async adminRetentionAnalytics() {
        // Placeholder for retention logic (e.g. users active in last 30 days vs total)
        const User = require('../models/User');
        const activeUsers = await User.countDocuments({ status: 'Active' });
        const totalUsers = await User.countDocuments();
        
        return {
            retentionRate: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) + '%' : '0%',
            activeUsers,
            totalUsers
        };
    }
}

module.exports = UserService;
