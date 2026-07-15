const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const asyncWrapper = require('../utils/asyncWrapper');
const AdminEarningController = require('../controllers/adminEarningController');

// â”€â”€â”€ GET /api/admin/earnings/export â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.get('/export', authMiddleware, asyncWrapper(AdminEarningController.exportEarnings));

// â”€â”€â”€ POST /api/admin/earnings/adjust â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.post('/adjust', authMiddleware, asyncWrapper(AdminEarningController.adjustEarnings));

// â”€â”€â”€ POST /api/admin/settlements/:id/approve â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
router.post('/settlements/:id/approve', authMiddleware, asyncWrapper(AdminEarningController.approveSettlement));

module.exports = router;
