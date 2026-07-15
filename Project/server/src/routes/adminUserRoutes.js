const express = require('express');
const router = express.Router();
const AdminUserController = require('../controllers/adminUserController');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');

// Enforce auth & role checking
router.use(authMiddleware, requireRole('Admin'));

// basic endpoints
router.get('/', AdminUserController.listUsers);
router.get('/:id', AdminUserController.getUser);

// status updates
router.put('/:id/status', AdminUserController.updateStatus);
router.put('/:id/suspend', AdminUserController.suspendUser);
router.put('/:id/reactivate', AdminUserController.reactivateUser);

// relations
router.get('/:id/rides', AdminUserController.getRides);
router.get('/:id/wallet', AdminUserController.getWallet);
router.get('/:id/payments', AdminUserController.getPayments);

module.exports = router;
