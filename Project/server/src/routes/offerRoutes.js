const express = require('express');
const router = express.Router();
const OfferController = require('../controllers/offerController');
const asyncWrapper = require('../utils/asyncWrapper');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/auto', authMiddleware, asyncWrapper(OfferController.getAutoOffers));
router.get('/active', authMiddleware, asyncWrapper(OfferController.getActiveOffers));

module.exports = router;
