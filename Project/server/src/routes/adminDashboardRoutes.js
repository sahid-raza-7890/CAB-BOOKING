const express = require('express');
const router = express.Router();
const AdminDashboardController = require('../controllers/adminDashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.get('/', authMiddleware, requireRole('Admin'), AdminDashboardController.getDashboardData);

module.exports = router;
