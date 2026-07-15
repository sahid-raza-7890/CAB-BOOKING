const Razorpay = require('razorpay');
const crypto = require('crypto');
const Ride = require('../models/Ride');

class PaymentService {
    static async createRazorpayOrder(amount) {
        if (!process.env.RAZORPAY_KEY_ID) {
            console.warn("Using Mock Order because real keys aren't set up yet.");
            return { id: "mock_order_" + Date.now(), amount: amount * 100 };
        }

        const razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
        
        const options = {
            amount: amount * 100, // Convert â‚¹ to paise
            currency: "INR",
            receipt: `ucab_${Math.floor(Math.random() * 10000)}`
        };
        
        return await razorpayInstance.orders.create(options);
    }

    static async verifyRazorpayPayment(orderId, paymentId, signature, rideId) {
        if (!process.env.RAZORPAY_KEY_SECRET) {
            console.warn("Mocking Payment Verification because real keys aren't set up yet.");
            return true;
        }

        const sign = orderId + "|" + paymentId;
        const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
                                   .update(sign.toString())
                                   .digest("hex");

        if (signature === expectedSign) {
            if (rideId) {
                await Ride.findByIdAndUpdate(rideId, { paymentStatus: 'Paid' });
            }
            return true;
        }
        return false;
    }

    // â”€â”€â”€ ADMIN FINANCE OPERATIONS (Sprint 26) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    static async getPayments({ page = 1, limit = 20, status, search } = {}) {
        const Payment = require('../models/Payment');
        const query = {};
        if (status && status !== 'All') {
            query.status = status;
        }
        if (search) {
            const User = require('../models/User');
            const users = await User.find({
                $or: [
                    { name: new RegExp(search.trim(), 'i') },
                    { email: new RegExp(search.trim(), 'i') }
                ]
            }).select('_id');
            query.userId = { $in: users.map(u => u._id) };
        }

        const skip = (page - 1) * limit;
        const [payments, total] = await Promise.all([
            Payment.find(query)
                .populate('userId', 'name email phone')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Payment.countDocuments(query)
        ]);

        return {
            payments,
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
        };
    }

    static async getPaymentDetails(paymentId) {
        const Payment = require('../models/Payment');
        const payment = await Payment.findById(paymentId)
            .populate('userId', 'name email phone')
            .populate({
                path: 'rideId',
                populate: { path: 'driver', select: 'name phone' }
            })
            .lean();
        if (!payment) throw new Error('Payment record not found');
        return payment;
    }

    static async adminRefundPayment(paymentId, adminId, remarks, ipAddress, io) {
        const Payment = require('../models/Payment');
        const payment = await Payment.findById(paymentId);
        if (!payment) throw new Error('Payment not found');

        if (payment.status === 'Refunded') {
            throw new Error('Payment has already been refunded');
        }
        if (payment.status !== 'Completed') {
            throw new Error('Only completed payments can be refunded');
        }

        const previousStatus = payment.status;
        payment.status = 'Refunded';
        await payment.save();

        if (payment.method === 'Wallet') {
            const WalletService = require('./walletService');
            await WalletService.credit(
                payment.userId.toString(),
                'Passenger',
                payment.amount,
                payment._id.toString(),
                'Refund',
                'Admin',
                { remarks: remarks || 'Admin Refund triggered' }
            );
        }

        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'REFUND_PAYMENT',
            targetType: 'Payment',
            targetId: payment._id,
            details: {
                userId: payment.userId,
                rideId: payment.rideId,
                amount: payment.amount,
                previousStatus,
                newStatus: 'Refunded',
                remarks
            },
            ipAddress
        });

        if (io) {
            io.to('admin_global').emit('admin_dashboard_update');
            io.to(`user_${payment.userId}`).emit('paymentUpdated', { paymentId: payment._id, status: 'Refunded' });
        }

        return payment;
    }

    static async retryPayment(paymentId, adminId, ipAddress, io) {
        const Payment = require('../models/Payment');
        const payment = await Payment.findById(paymentId);
        if (!payment) throw new Error('Payment not found');

        if (payment.status !== 'Failed') {
            throw new Error('Only failed payments can be retried');
        }

        const previousStatus = payment.status;
        payment.status = 'Completed';
        await payment.save();

        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'RETRY_PAYMENT',
            targetType: 'Payment',
            targetId: payment._id,
            details: {
                userId: payment.userId,
                amount: payment.amount,
                previousStatus,
                newStatus: 'Completed'
            },
            ipAddress
        });

        if (io) {
            io.to('admin_global').emit('admin_dashboard_update');
            io.to(`user_${payment.userId}`).emit('paymentUpdated', { paymentId: payment._id, status: 'Completed' });
        }

        return payment;
    }

    // â”€â”€â”€ ADMIN ANALYTICS (Sprint 29) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    static async adminPaymentAnalytics() {
        const Payment = require('../models/Payment');
        const [statusAgg, methodsAgg] = await Promise.all([
            Payment.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$amount' } } }
            ]),
            Payment.aggregate([
                { $group: { _id: '$method', count: { $sum: 1 } } }
            ])
        ]);

        const statuses = {};
        let totalVolume = 0;
        statusAgg.forEach(s => { 
            statuses[s._id] = s.count; 
            if(s._id === 'Completed') totalVolume += s.total;
        });

        const methods = {};
        methodsAgg.forEach(m => { methods[m._id] = m.count; });

        return {
            paymentsByStatus: statuses,
            paymentsByMethod: methods,
            completedVolume: totalVolume
        };
    }

    static async adminRevenueAnalytics() {
        // Redundant to RideService's getAdminRevenueAnalytics but aggregating actual Payments
        const Payment = require('../models/Payment');
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const agg = await Payment.aggregate([
            { $match: { status: 'Completed', createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    value: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);

        return agg.map(a => ({
            date: `${a._id.year}-${String(a._id.month).padStart(2, '0')}-${String(a._id.day).padStart(2, '0')}`,
            value: a.value
        }));
    }
}

module.exports = PaymentService;
