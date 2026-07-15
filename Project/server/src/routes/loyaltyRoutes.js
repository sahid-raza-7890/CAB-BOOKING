const express = require('express');
const router = express.Router();
const LoyaltyController = require('../controllers/loyaltyController');
const asyncWrapper = require('../utils/asyncWrapper');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/status', authMiddleware, asyncWrapper(LoyaltyController.getStatus));
router.get('/history', authMiddleware, asyncWrapper(LoyaltyController.getHistory));

module.exports = router;
