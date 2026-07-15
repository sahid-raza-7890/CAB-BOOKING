const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');
const asyncWrapper = require('../utils/asyncWrapper');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/create-order', authMiddleware, asyncWrapper(PaymentController.createOrder));
router.post('/verify', authMiddleware, asyncWrapper(PaymentController.verifyPayment));

module.exports = router;
