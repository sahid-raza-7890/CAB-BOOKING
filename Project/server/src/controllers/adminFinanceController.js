const WalletService = require('../services/walletService');
const PaymentService = require('../services/paymentService');
const DriverSettlementService = require('../services/driverSettlementService');
const DriverEarningService = require('../services/driverEarningService');
const RideService = require('../services/rideService');
const ResponseFormatter = require('../utils/responseFormatter');
const asyncWrapper = require('../utils/asyncWrapper');

class AdminFinanceController {

  // GET /api/admin/finance/dashboard
  static getDashboardSummary = asyncWrapper(async (req, res) => {
    const summary = await WalletService.getPlatformWalletSummary();
    return ResponseFormatter.successAdmin(res, summary, 'Financial overview summary retrieved successfully');
  });

  // GET /api/admin/finance/payments
  static getPayments = asyncWrapper(async (req, res) => {
    const { page = 1, limit = 20, status, search } = req.query;
    const result = await PaymentService.getPayments({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      status,
      search
    });
    return ResponseFormatter.successAdmin(res, result, 'Payments retrieved successfully');
  });

  // GET /api/admin/finance/payments/:id
  static getPaymentDetails = asyncWrapper(async (req, res) => {
    const payment = await PaymentService.getPaymentDetails(req.params.id);
    return ResponseFormatter.successAdmin(res, payment, 'Payment details retrieved successfully');
  });

  // POST /api/admin/finance/payments/:id/refund
  static refundPayment = asyncWrapper(async (req, res) => {
    const { remarks } = req.body;
    const io = req.app.get('io');
    const payment = await PaymentService.adminRefundPayment(
      req.params.id,
      req.user._id,
      remarks,
      req.ip,
      io
    );
    return ResponseFormatter.successAdmin(res, payment, 'Refund processed successfully');
  });

  // POST /api/admin/finance/payments/:id/retry
  static retryPayment = asyncWrapper(async (req, res) => {
    const io = req.app.get('io');
    const payment = await PaymentService.retryPayment(
      req.params.id,
      req.user._id,
      req.ip,
      io
    );
    return ResponseFormatter.successAdmin(res, payment, 'Payment retry triggered successfully');
  });

  // GET /api/admin/finance/passenger-wallets
  static getPassengerWallets = asyncWrapper(async (req, res) => {
    const { page = 1, limit = 20, search } = req.query;
    const wallets = await WalletService.getPassengerWallets({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      search
    });
    return ResponseFormatter.successAdmin(res, wallets, 'Passenger wallets retrieved successfully');
  });

  // GET /api/admin/finance/driver-wallets
  static getDriverWallets = asyncWrapper(async (req, res) => {
    const { page = 1, limit = 20, search } = req.query;
    const wallets = await WalletService.getDriverWallets({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      search
    });
    return ResponseFormatter.successAdmin(res, wallets, 'Driver wallets retrieved successfully');
  });

  // PUT /api/admin/finance/wallet/:id/adjust
  static adjustWallet = asyncWrapper(async (req, res) => {
    const { amount, type, remarks, referenceId, referenceType } = req.body;
    if (!amount || !type) {
      return ResponseFormatter.error(res, 'Amount and Type are required', 'VALIDATION_ERROR', {}, 400);
    }
    const io = req.app.get('io');
    const wallet = await WalletService.adminAdjustWallet(
      req.params.id,
      parseFloat(amount),
      type,
      referenceId,
      referenceType,
      req.user._id,
      remarks,
      req.ip,
      io
    );
    return ResponseFormatter.successAdmin(res, wallet, `Wallet adjusted successfully by ${type}`);
  });

  // GET /api/admin/finance/transactions
  static getTransactions = asyncWrapper(async (req, res) => {
    const { page = 1, limit = 50 } = req.query;
    const result = await WalletService.getWalletTransactions({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10)
    });
    return ResponseFormatter.successAdmin(res, result, 'Wallet transactions ledger retrieved successfully');
  });

  // GET /api/admin/finance/settlements
  static getSettlements = asyncWrapper(async (req, res) => {
    const [pending, completed] = await Promise.all([
      DriverSettlementService.getPendingSettlements(),
      DriverSettlementService.getCompletedSettlements()
    ]);
    return ResponseFormatter.successAdmin(
      res,
      { pending, completed },
      'Settlements summary retrieved successfully'
    );
  });

  // POST /api/admin/finance/settlements/:id/release
  static releaseSettlement = asyncWrapper(async (req, res) => {
    const io = req.app.get('io');
    const settlement = await DriverSettlementService.releaseSettlement(
      req.params.id,
      req.user._id,
      req.ip,
      io
    );
    return ResponseFormatter.successAdmin(res, settlement, 'Settlement released successfully');
  });

  // GET /api/admin/finance/earnings
  static getEarningsReport = asyncWrapper(async (req, res) => {
    const report = await DriverEarningService.getDriverEarningsReport();
    return ResponseFormatter.successAdmin(res, report, 'Driver earnings report aggregated successfully');
  });

  // GET /api/admin/finance/commissions
  static getCommissionReport = asyncWrapper(async (req, res) => {
    const report = await RideService.getCommissionReport();
    return ResponseFormatter.successAdmin(res, report, 'Platform commission report aggregated successfully');
  });

  // â”€â”€â”€ SPRINT 39 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  // GET /api/admin/finance/withdrawals
  static getWithdrawals = asyncWrapper(async (req, res) => {
    const requests = await WalletService.adminGetWithdrawals();
    return ResponseFormatter.successAdmin(res, requests, 'Withdrawal requests retrieved successfully');
  });

  // PUT /api/admin/finance/withdrawals/:id/process
  static processWithdrawal = asyncWrapper(async (req, res) => {
    const { action, adminNotes } = req.body;
    const io = req.app.get('io');
    const result = await WalletService.adminProcessWithdrawal(
      req.params.id,
      req.user._id,
      action,
      adminNotes,
      req.ip,
      io
    );
    return ResponseFormatter.successAdmin(res, result, `Withdrawal request ${action.toLowerCase()}ed successfully`);
  });
}

module.exports = AdminFinanceController;
