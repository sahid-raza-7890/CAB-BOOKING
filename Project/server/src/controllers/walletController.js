const WalletService = require('../services/walletService');
const ResponseFormatter = require('../utils/responseFormatter');

class WalletController {
    static async getBalance(req, res) {
        const { userId, role } = req.user;
        const userType = role === 'Driver' ? 'Driver' : 'Passenger';
        const wallet = await WalletService.getOrCreateWallet(userId, userType);
        return ResponseFormatter.success(res, { wallet });
    }

    static async getTransactions(req, res) {
        const { userId } = req.user;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const transactions = await WalletService.getLedger(userId, limit, page);
        return ResponseFormatter.success(res, { transactions });
    }

    static async addMoney(req, res) {
        const { userId, role } = req.user;
        const userType = role === 'Driver' ? 'Driver' : 'Passenger';
        const { amount, referenceId } = req.body;

        if (!amount || amount <= 0) {
            return ResponseFormatter.error(res, 'Invalid amount', 'VALIDATION_ERROR', {}, 400);
        }

        const io = req.app.get('io');
        const { wallet, transaction } = await WalletService.credit(
            userId,
            userType,
            amount,
            referenceId || 'TOPUP_' + Date.now(),
            'TopUp',
            userId,
            { notes: 'User added funds via gateway', io } // Pass IO inside metadata to let service handle emit
        );

        return ResponseFormatter.success(res, { wallet, transaction }, 'Funds added successfully');
    }
    static async retryPayment(req, res) {
        const { userId } = req.user;
        const txn = await WalletService.retryFailedPayment(userId, req.params.transactionId);
        return ResponseFormatter.success(res, { transaction: txn }, 'Payment retry queued');
    }

    static async getRefundStatus(req, res) {
        const { userId } = req.user;
        const txns = await WalletService.getRefundStatus(userId, req.params.referenceId);
        return ResponseFormatter.success(res, { refunds: txns });
    }

    // â”€â”€â”€ SPRINT 39 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    static async requestWithdrawal(req, res) {
        const { userId, role } = req.user;
        const userType = role === 'Driver' ? 'Driver' : 'Passenger';
        const { amount, method, details } = req.body;
        const io = req.app.get('io');

        const request = await WalletService.requestWithdrawal(userId, userType, amount, method, details, io);
        return ResponseFormatter.success(res, { request }, 'Withdrawal requested successfully', 201);
    }

    static async getWithdrawals(req, res) {
        const { userId } = req.user;
        const requests = await WalletService.getWithdrawalRequests(userId);
        return ResponseFormatter.success(res, { requests });
    }
}

module.exports = WalletController;
