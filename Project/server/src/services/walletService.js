const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const NotificationService = require('./notificationService');
const crypto = require('crypto');

class WalletService {
    
    // Internal helper to generate unique transaction IDs
    static _generateTxnId(prefix) {
        return `${prefix}_${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
    }

    /**
     * Get or create a wallet for a user/driver.
     */
    static async getOrCreateWallet(userId, userType) {

        let wallet = await Wallet.findOne({ userId });
        if (!wallet) {

            wallet = new Wallet({ userId, userType });
            await wallet.save();
        }
        return wallet;
    }

    /**
     * Credit the wallet securely.
     * Uses $inc to prevent race conditions during concurrent credits.
     */
    static async credit(userId, userType, amount, referenceId, referenceType, createdBy = 'System', metadata = {}) {
        if (amount <= 0) throw new Error('Credit amount must be greater than zero');

        const wallet = await this.getOrCreateWallet(userId, userType);
        
        if (wallet.status !== 'Active') {
            throw new Error('Wallet is frozen or inactive');
        }

        // Atomic credit
        const updatedWallet = await Wallet.findOneAndUpdate(
            { _id: wallet._id },
            { $inc: { balance: amount } },
            { new: true }
        );

        const io = metadata && metadata.io;
        const cleanMetadata = metadata ? { ...metadata } : {};
        if (cleanMetadata.io) delete cleanMetadata.io;

        // Record immutable ledger entry
        const txn = new WalletTransaction({
            transactionId: this._generateTxnId('TXN_CR'),
            walletId: updatedWallet._id,
            referenceId,
            referenceType,
            amount,
            type: 'Credit',
            openingBalance: wallet.balance, // Pre-update state
            closingBalance: updatedWallet.balance,
            status: 'Completed',
            createdBy,
            metadata: cleanMetadata
        });

        await txn.save();
        if (io) {
            io.emit(`walletUpdated_${userId}`, { balance: updatedWallet.balance, transaction: txn });
            
            await NotificationService.createNotification({
                userId,
                title: 'Wallet Credited',
                description: `₹${amount} has been added to your wallet.`,
                type: 'WALLET_CREDITED',
                category: 'Wallet',
                icon: 'credit-card',
                actionUrl: `/dashboard/wallet`
            }, io).catch(err => console.error("Notification Error:", err));
        }
        return { wallet: updatedWallet, transaction: txn };
    }

    /**
     * Debit the wallet securely using optimistic locks to prevent double-spending.
     */
    static async debit(userId, userType, amount, referenceId, referenceType, createdBy = 'System', metadata = {}) {
        if (amount <= 0) throw new Error('Debit amount must be greater than zero');

        const wallet = await this.getOrCreateWallet(userId, userType);
        
        if (wallet.status !== 'Active') {
            throw new Error('Wallet is frozen or inactive');
        }

        // Available balance is actual balance minus any locked funds (e.g. pending withdrawals)
        const availableBalance = wallet.balance - wallet.lockedBalance;
        
        if (availableBalance < amount) {
            throw new Error('Insufficient wallet balance');
        }

        // Atomic decrement with condition to prevent negative balance race conditions
        const updatedWallet = await Wallet.findOneAndUpdate(
            { 
                _id: wallet._id,
                // Ensure the balance is still sufficient at the exact moment of execution
                $expr: { $gte: [{ $subtract: ["$balance", "$lockedBalance"] }, amount] }
            },
            { $inc: { balance: -amount } },
            { new: true }
        );

        if (!updatedWallet) {
            throw new Error('Transaction failed due to concurrent modification or insufficient funds');
        }

        const io = metadata && metadata.io;
        const cleanMetadata = metadata ? { ...metadata } : {};
        if (cleanMetadata.io) delete cleanMetadata.io;

        // Record immutable ledger entry
        const txn = new WalletTransaction({
            transactionId: this._generateTxnId('TXN_DB'),
            walletId: updatedWallet._id,
            referenceId,
            referenceType,
            amount,
            type: 'Debit',
            openingBalance: wallet.balance, // Pre-update state
            closingBalance: updatedWallet.balance,
            status: 'Completed',
            createdBy,
            metadata: cleanMetadata
        });

        await txn.save();
        if (io) {
            io.emit(`walletUpdated_${userId}`, { balance: updatedWallet.balance, transaction: txn });
            
            await NotificationService.createNotification({
                userId,
                title: 'Wallet Debited',
                description: `₹${amount} has been deducted from your wallet.`,
                type: 'WALLET_DEBITED',
                category: 'Wallet',
                icon: 'minus-circle',
                actionUrl: `/dashboard/wallet`
            }, io).catch(err => console.error("Notification Error:", err));
        }
        return { wallet: updatedWallet, transaction: txn };
    }

    /**
     * Freeze Wallet
     */
    static async freezeWallet(userId, userType) {
        const wallet = await this.getOrCreateWallet(userId, userType);
        wallet.status = 'Frozen';
        await wallet.save();
        return wallet;
    }

    /**
     * Unfreeze Wallet
     */
    static async unfreezeWallet(userId, userType) {
        const wallet = await this.getOrCreateWallet(userId, userType);
        wallet.status = 'Active';
        await wallet.save();
        return wallet;
    }

    /**
     * Get Ledger History
     */
    static async getLedger(userId, limit = 50, page = 1) {
        const wallet = await Wallet.findOne({ userId });
        if (!wallet) return [];

        const skip = (page - 1) * limit;
        return await WalletTransaction.find({ walletId: wallet._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
    }

    static async retryFailedPayment(userId, transactionId) {
        const wallet = await Wallet.findOne({ userId });
        if (!wallet) throw new Error('Wallet not found');

        const txn = await WalletTransaction.findOne({ transactionId, walletId: wallet._id, status: 'Failed' });
        if (!txn) throw new Error('Failed transaction not found');

        // Stub logic: mark as pending again for background processor
        txn.status = 'Pending';
        await txn.save();
        return txn;
    }

    static async getRefundStatus(userId, referenceId) {
        const wallet = await Wallet.findOne({ userId });
        if (!wallet) throw new Error('Wallet not found');

        const txns = await WalletTransaction.find({ referenceId, walletId: wallet._id, type: 'Credit', referenceType: 'Refund' });
        return txns;
    }

    // â”€â”€â”€ ADMIN FINANCIAL OPERATIONS (Sprint 26) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    static async getPlatformWalletSummary() {
        const [passengerAgg, driverAgg, statusAgg] = await Promise.all([
            Wallet.aggregate([
                { $match: { userType: 'Passenger' } },
                { $group: { _id: null, total: { $sum: '$balance' }, count: { $sum: 1 } } }
            ]),
            Wallet.aggregate([
                { $match: { userType: 'Driver' } },
                { $group: { _id: null, total: { $sum: '$balance' }, count: { $sum: 1 } } }
            ]),
            Wallet.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ])
        ]);

        const pass = passengerAgg[0] || { total: 0, count: 0 };
        const drv = driverAgg[0] || { total: 0, count: 0 };

        return {
            passengerTotal: pass.total,
            passengerCount: pass.count,
            driverTotal: drv.total,
            driverCount: drv.count,
            status: statusAgg.reduce((acc, curr) => { acc[curr._id] = curr.count; return acc; }, {})
        };
    }

    static async getPassengerWallets({ page = 1, limit = 20, search } = {}) {
        const query = { userType: 'Passenger' };
        if (search) {
            const User = require('../models/User');
            const users = await User.find({
                role: 'Passenger',
                $or: [
                    { name: new RegExp(search.trim(), 'i') },
                    { email: new RegExp(search.trim(), 'i') }
                ]
            }).select('_id');
            query.userId = { $in: users.map(u => u._id) };
        }

        const skip = (page - 1) * limit;
        const [wallets, total] = await Promise.all([
            Wallet.find(query).skip(skip).limit(limit).lean(),
            Wallet.countDocuments(query)
        ]);

        const User = require('../models/User');
        const enriched = await Promise.all(wallets.map(async w => {
            const userObj = await User.findById(w.userId).select('name email phone').lean();
            return { ...w, user: userObj };
        }));

        return { wallets: enriched, total, page, limit, pages: Math.ceil(total / limit) };
    }

    static async getDriverWallets({ page = 1, limit = 20, search } = {}) {
        const query = { userType: 'Driver' };
        if (search) {
            const Driver = require('../models/Driver');
            const drivers = await Driver.find({
                $or: [
                    { name: new RegExp(search.trim(), 'i') },
                    { email: new RegExp(search.trim(), 'i') }
                ]
            }).select('_id');
            query.userId = { $in: drivers.map(d => d._id) };
        }

        const skip = (page - 1) * limit;
        const [wallets, total] = await Promise.all([
            Wallet.find(query).skip(skip).limit(limit).lean(),
            Wallet.countDocuments(query)
        ]);

        const Driver = require('../models/Driver');
        const enriched = await Promise.all(wallets.map(async w => {
            const driverObj = await Driver.findById(w.userId).select('name email phone').lean();
            return { ...w, driver: driverObj };
        }));

        return { wallets: enriched, total, page, limit, pages: Math.ceil(total / limit) };
    }

    static async adminAdjustWallet(walletId, amount, type, referenceId, referenceType, adminId, remarks, ipAddress, io) {
        const wallet = await Wallet.findById(walletId);
        if (!wallet) throw new Error('Wallet not found');

        const openingBalance = wallet.balance;
        if (type === 'Credit') {
            wallet.balance += amount;
        } else {
            if (wallet.balance - wallet.lockedBalance < amount) {
                throw new Error('Insufficient wallet balance for debit adjustment');
            }
            wallet.balance -= amount;
        }
        await wallet.save();

        const closingBalance = wallet.balance;

        const txn = new WalletTransaction({
            transactionId: this._generateTxnId('TXN_ADJ'),
            walletId: wallet._id,
            referenceId: referenceId || 'ADJ_' + Date.now(),
            referenceType: referenceType || 'Manual',
            amount,
            type,
            openingBalance,
            closingBalance,
            status: 'Completed',
            createdBy: 'Admin',
            metadata: { remarks, adminId }
        });
        await txn.save();

        // Audit Logging
        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'ADJUST_WALLET',
            targetType: 'Wallet',
            targetId: wallet._id,
            details: {
                userId: wallet.userId,
                userType: wallet.userType,
                amount,
                type,
                remarks
            },
            ipAddress
        });

        if (io) {
            io.to('admin_global').emit('admin_dashboard_update');
            io.to(`${wallet.userType.toLowerCase()}_${wallet.userId}`).emit('walletUpdated', { balance: wallet.balance, transaction: txn });
        }

        return wallet;
    }

    static async getWalletTransactions({ page = 1, limit = 50 } = {}) {
        const skip = (page - 1) * limit;
        const [transactions, total] = await Promise.all([
            WalletTransaction.find()
                .populate({ path: 'walletId', select: 'userId userType' })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            WalletTransaction.countDocuments()
        ]);

        return {
            transactions,
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
        };
    }

    // â”€â”€â”€ ADMIN ANALYTICS (Sprint 29) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    static async adminWalletAnalytics() {
        const Wallet = require('../models/Wallet');
        const [passengersAgg, driversAgg] = await Promise.all([
            Wallet.aggregate([
                { $match: { userType: 'Passenger' } },
                { $group: { _id: null, totalBalance: { $sum: '$balance' } } }
            ]),
            Wallet.aggregate([
                { $match: { userType: 'Driver' } },
                { $group: { _id: null, totalBalance: { $sum: '$balance' } } }
            ])
        ]);

        return {
            passengerWalletsTotal: passengersAgg.length > 0 ? passengersAgg[0].totalBalance : 0,
            driverWalletsTotal: driversAgg.length > 0 ? driversAgg[0].totalBalance : 0
        };
    }

    // â”€â”€â”€ SPRINT 39: WITHDRAWALS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    static async requestWithdrawal(userId, userType, amount, method, details, io) {
        if (userType !== 'Driver') {
            throw new Error('Only drivers can request withdrawals');
        }
        if (amount < 100) {
            throw new Error('Minimum withdrawal amount is 100');
        }

        const wallet = await this.getOrCreateWallet(userId, userType);
        const availableBalance = wallet.balance - wallet.lockedBalance;

        if (availableBalance < amount) {
            throw new Error('Insufficient available balance');
        }

        const WithdrawalRequest = require('../models/WithdrawalRequest');

        // Lock the funds
        await Wallet.findByIdAndUpdate(wallet._id, { $inc: { lockedBalance: amount } });

        const request = new WithdrawalRequest({
            userId,
            userType,
            amount,
            method,
            details,
            status: 'Pending'
        });
        await request.save();

        if (io) {
            io.to('admin_finance').emit('withdrawal_requested', request);
            io.to(`driver_${userId}`).emit('walletUpdated', { balance: wallet.balance, lockedBalance: wallet.lockedBalance + amount });
        }

        return request;
    }

    static async getWithdrawalRequests(userId) {
        const WithdrawalRequest = require('../models/WithdrawalRequest');
        return await WithdrawalRequest.find({ userId }).sort({ createdAt: -1 }).lean();
    }

    static async adminGetWithdrawals() {
        const WithdrawalRequest = require('../models/WithdrawalRequest');
        return await WithdrawalRequest.find().populate('userId', 'name phone email').sort({ createdAt: -1 }).lean();
    }

    static async adminProcessWithdrawal(requestId, adminId, action, adminNotes, ipAddress, io) {
        const WithdrawalRequest = require('../models/WithdrawalRequest');
        const request = await WithdrawalRequest.findById(requestId);
        
        if (!request) throw new Error('Withdrawal request not found');
        if (request.status !== 'Pending') throw new Error('Request already processed');

        const wallet = await Wallet.findOne({ userId: request.userId });
        let transaction = null;

        if (action === 'Approve') {
            // Debit the wallet fully
            const debitResult = await this.debit(request.userId, request.userType, request.amount, request._id.toString(), 'Withdrawal', 'Admin');
            transaction = debitResult.transaction;
            
            // Release the lock
            await Wallet.findByIdAndUpdate(wallet._id, { $inc: { lockedBalance: -request.amount } });
            
            request.status = 'Approved';
            request.walletTransactionId = transaction._id;
        } else if (action === 'Reject') {
            // Release the lock
            await Wallet.findByIdAndUpdate(wallet._id, { $inc: { lockedBalance: -request.amount } });
            request.status = 'Rejected';
        } else {
            throw new Error('Invalid action. Use Approve or Reject');
        }

        request.adminNotes = adminNotes;
        await request.save();

        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: `WITHDRAWAL_${action.toUpperCase()}`,
            targetType: 'WithdrawalRequest',
            targetId: request._id,
            details: { amount: request.amount, method: request.method, adminNotes },
            ipAddress
        });

        if (io) {
            io.to(`driver_${request.userId}`).emit('withdrawal_processed', request);
            io.to(`driver_${request.userId}`).emit('walletUpdated', { balance: wallet.balance - (action === 'Approve' ? request.amount : 0) });
            io.to('admin_finance').emit('admin_dashboard_update');
        }

        return request;
    }
}

module.exports = WalletService;
