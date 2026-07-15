const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const asyncWrapper = require('../utils/asyncWrapper');
const authMiddleware = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const validateInput = require('../middleware/validateInput');

router.post('/register', authLimiter, validateInput(['name', 'email', 'password']), asyncWrapper(AuthController.register));
router.post('/login', authLimiter, validateInput(['email', 'password']), asyncWrapper(AuthController.login));
router.post('/register-driver', authLimiter, validateInput(['name', 'email', 'password']), asyncWrapper(AuthController.registerDriver));
router.post('/login-driver', authLimiter, validateInput(['email', 'password']), asyncWrapper(AuthController.loginDriver));
router.post('/login-admin', authLimiter, validateInput(['email', 'password']), asyncWrapper(AuthController.loginAdmin));

// OTP (Requires authMiddleware since it relies on req.user)
router.post('/api/otp/send', authLimiter, authMiddleware, asyncWrapper(AuthController.sendOTP));
router.post('/api/otp/verify', authLimiter, authMiddleware, validateInput(['code']), asyncWrapper(AuthController.verifyOTP));

// Sprint 38: Auth Completion
router.post('/forgot-password', authLimiter, validateInput(['email']), asyncWrapper(AuthController.forgotPassword));
router.post('/reset-password', authLimiter, validateInput(['email', 'token', 'newPassword']), asyncWrapper(AuthController.resetPassword));
router.put('/change-password', authMiddleware, validateInput(['oldPassword', 'newPassword']), asyncWrapper(AuthController.changePassword));
router.put('/change-email', authMiddleware, validateInput(['newEmail']), asyncWrapper(AuthController.changeEmail));
router.delete('/delete-account', authMiddleware, asyncWrapper(AuthController.softDeleteAccount));

module.exports = router;
