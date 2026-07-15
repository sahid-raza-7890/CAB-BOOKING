const express = require('express');
const router = express.Router();
const ReferralController = require('../controllers/referralController');
const asyncWrapper = require('../utils/asyncWrapper');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(requireRole('Passenger', 'Driver'));

router.get('/', asyncWrapper(ReferralController.getDashboard));
router.get('/history', asyncWrapper(ReferralController.getHistory));
router.get('/code', asyncWrapper(ReferralController.getCode));
router.post('/apply', asyncWrapper(ReferralController.applyReferral));
router.post('/share', asyncWrapper(ReferralController.shareReferral));

module.exports = router;
