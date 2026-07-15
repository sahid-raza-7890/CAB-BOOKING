const express = require('express');
const router = express.Router();
const AdminFinanceController = require('../controllers/adminFinanceController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// Enforce auth & role checking
router.use(authMiddleware, requireRole('Admin'));

// Summary dashboard
router.get('/dashboard', AdminFinanceController.getDashboardSummary);

// Payments & refunds
router.get('/payments', AdminFinanceController.getPayments);
router.get('/payments/:id', AdminFinanceController.getPaymentDetails);
router.post('/payments/:id/refund', AdminFinanceController.refundPayment);
router.post('/payments/:id/retry', AdminFinanceController.retryPayment);

// Wallets & ledgers
router.get('/passenger-wallets', AdminFinanceController.getPassengerWallets);
router.get('/driver-wallets', AdminFinanceController.getDriverWallets);
router.put('/wallet/:id/adjust', AdminFinanceController.adjustWallet);
router.get('/transactions', AdminFinanceController.getTransactions);

// Driver settlements
router.get('/settlements', AdminFinanceController.getSettlements);
router.post('/settlements/:id/release', AdminFinanceController.releaseSettlement);

// Operational aggregations
router.get('/earnings', AdminFinanceController.getEarningsReport);
router.get('/commissions', AdminFinanceController.getCommissionReport);

// â”€â”€â”€ SPRINT 39: WITHDRAWALS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.get('/withdrawals', AdminFinanceController.getWithdrawals);
router.put('/withdrawals/:id/process', AdminFinanceController.processWithdrawal);

module.exports = router;
