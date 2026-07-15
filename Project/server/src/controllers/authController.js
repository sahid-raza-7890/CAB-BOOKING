const AuthService = require('../services/authService');
const ResponseFormatter = require('../utils/responseFormatter');
const OTPService = require('../services/OTPService');
const UserService = require('../services/userService');

class AuthController {
    static async register(req, res) {
        const { name, email, password } = req.body;
        const result = await AuthService.registerUser(name, email, password);
        return ResponseFormatter.success(res, {
            token: result.token,
            userId: result.user._id,
            name: result.user.name,
            role: result.user.role
        }, 'Account created and securely logged in!', 201);
    }

    static async login(req, res) {
        const { email, password } = req.body;
        const result = await AuthService.loginUser(email, password);
        return ResponseFormatter.success(res, {
            token: result.token,
            user: {
                id: result.user._id,
                name: result.user.name,
                email: result.user.email,
                role: result.user.role || 'Passenger'
            }
        });
    }

    static async loginAdmin(req, res) {
        const { email, password } = req.body;
        const result = await AuthService.loginAdmin(email, password);
        return ResponseFormatter.success(res, {
            token: result.token,
            user: {
                id: result.user._id,
                name: result.user.name,
                email: result.user.email,
                role: result.user.role
            }
        });
    }

    static async registerDriver(req, res) {
        await AuthService.registerDriver(req.body);
        return ResponseFormatter.success(res, {}, 'Driver registered securely!', 201);
    }

    static async loginDriver(req, res) {
        const { email, password } = req.body;
        const result = await AuthService.loginDriver(email, password);
        return ResponseFormatter.success(res, {
            token: result.token,
            user: {
                id: result.driver._id,
                name: result.driver.name,
                email: result.driver.email,
                role: result.driver.role || 'Driver'
            }
        });
    }

    static async sendOTP(req, res) {
        const user = await UserService.getProfile(req.user.userId || req.user.id);
        if (!user) return ResponseFormatter.error(res, 'User not found', 'NOT_FOUND', {}, 404);

        OTPService.generateOTP(user.email);
        return ResponseFormatter.success(res, {}, 'Verification code sent successfully!');
    }

    static async verifyOTP(req, res) {
        const { code } = req.body;
        if (!code) return ResponseFormatter.error(res, 'Code is required', 'VALIDATION_ERROR', {}, 400);

        const user = await UserService.getProfile(req.user.userId || req.user.id);
        if (!user) return ResponseFormatter.error(res, 'User not found', 'NOT_FOUND', {}, 404);

        const isVerified = OTPService.verifyOTP(user.email, code);
        if (isVerified) {
            return ResponseFormatter.success(res, { verified: true }, 'OTP verified successfully!');
        } else {
            return ResponseFormatter.error(res, 'Invalid or expired verification code', 'INVALID_OTP', { verified: false }, 400);
        }
    }

    static async changePassword(req, res) {
        const { oldPassword, newPassword } = req.body;
        const role = req.user.role;
        const userId = req.user.userId || req.user.id;
        await AuthService.changePassword(userId, role, oldPassword, newPassword);
        return ResponseFormatter.success(res, {}, 'Password changed successfully');
    }

    static async changeEmail(req, res) {
        const { newEmail } = req.body;
        const role = req.user.role;
        const userId = req.user.userId || req.user.id;
        await AuthService.changeEmail(userId, role, newEmail);
        return ResponseFormatter.success(res, {}, 'Email updated successfully');
    }

    static async forgotPassword(req, res) {
        const { email, role } = req.body; // allow specifying role if driver, defaults to Passenger
        await AuthService.forgotPassword(email, role);
        return ResponseFormatter.success(res, {}, 'If an account exists, a reset link has been sent.');
    }

    static async resetPassword(req, res) {
        const { email, token, newPassword, role } = req.body;
        await AuthService.resetPassword(email, token, newPassword, role);
        return ResponseFormatter.success(res, {}, 'Password reset successfully');
    }

    static async softDeleteAccount(req, res) {
        const role = req.user.role;
        const userId = req.user.userId || req.user.id;
        await AuthService.softDeleteAccount(userId, role);
        return ResponseFormatter.success(res, {}, 'Account scheduled for deletion');
    }
}

module.exports = AuthController;
