const express = require('express');
const router = express.Router();
const WalletController = require('../controllers/walletController');
const asyncWrapper = require('../utils/asyncWrapper');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/balance', authMiddleware, asyncWrapper(WalletController.getBalance));
router.get('/transactions', authMiddleware, asyncWrapper(WalletController.getTransactions));
router.post('/add-money', authMiddleware, asyncWrapper(WalletController.addMoney));
router.post('/transaction/:transactionId/retry', authMiddleware, asyncWrapper(WalletController.retryPayment));
router.get('/refund/:referenceId/status', authMiddleware, asyncWrapper(WalletController.getRefundStatus));

// â”€â”€â”€ SPRINT 39 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.post('/withdraw', authMiddleware, asyncWrapper(WalletController.requestWithdrawal));
router.get('/withdrawals', authMiddleware, asyncWrapper(WalletController.getWithdrawals));

module.exports = router;
