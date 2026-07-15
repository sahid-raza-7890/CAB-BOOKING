const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const asyncWrapper = require('../utils/asyncWrapper');
const authMiddleware = require('../middleware/authMiddleware');
const safetyMiddleware = require('../middleware/safetyMiddleware');
const requireRole = require('../middleware/roleMiddleware');

router.get('/profile', authMiddleware, asyncWrapper(UserController.getProfile));
router.put('/profile', authMiddleware, asyncWrapper(UserController.updateProfile));
router.post('/profile/avatar', authMiddleware, asyncWrapper(UserController.changeAvatar)); // Assumes multer upload middleware is added globally or injected
router.delete('/profile/avatar', authMiddleware, asyncWrapper(UserController.deleteAvatar));

router.get('/payment-settings', authMiddleware, asyncWrapper(UserController.getPaymentSettings));
router.put('/payment-settings', authMiddleware, asyncWrapper(UserController.updatePaymentSettings));

router.get('/preferences', authMiddleware, asyncWrapper(UserController.getPreferences));
router.put('/preferences', authMiddleware, asyncWrapper(UserController.updatePreferences));

router.post('/wallet/cashout', authMiddleware, safetyMiddleware, asyncWrapper(UserController.cashoutWallet));

// For the legacy /users endpoint
router.get('/all', authMiddleware, requireRole('Admin'), asyncWrapper(UserController.getAllUsers));

// Routes for AdminPortal compatibility
router.get('/', authMiddleware, requireRole('Admin'), asyncWrapper(UserController.getAllUsers));
router.get('/drivers', authMiddleware, requireRole('Admin'), asyncWrapper(UserController.getAllDrivers));

module.exports = router;
