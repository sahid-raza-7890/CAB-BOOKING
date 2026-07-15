const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { downloadReceipt } = require('../controllers/receiptController');

const router = express.Router();

router.use(authMiddleware);

router.get('/rides/:rideId/pdf', downloadReceipt);

module.exports = router;
