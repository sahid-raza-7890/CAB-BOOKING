const express = require('express');
const router = express.Router();
const CampaignController = require('../controllers/campaignController');
const asyncWrapper = require('../utils/asyncWrapper');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/active', authMiddleware, asyncWrapper(CampaignController.getActiveCampaigns));

module.exports = router;
