const UserService = require('../services/userService');
const ResponseFormatter = require('../utils/responseFormatter');
const asyncWrapper = require('../utils/asyncWrapper');

class AdminUserController {

    // GET /api/admin/users
    static listUsers = asyncWrapper(async (req, res) => {
        const {
            page = 1,
            limit = 20,
            status,
            search,
            sort = 'newest'
        } = req.query;

        const result = await UserService.getFilteredUsers({
            page: parseInt(page, 10),
            limit: Math.min(parseInt(limit, 10) || 20, 100),
            status,
            search,
            sort
        });

        return ResponseFormatter.successAdmin(res, result, 'Users retrieved successfully');
    });

    // GET /api/admin/users/:id
    static getUser = asyncWrapper(async (req, res) => {
        const user = await UserService.adminGetUserDetails(req.params.id);
        return ResponseFormatter.successAdmin(res, user, 'User details retrieved successfully');
    });

    // PUT /api/admin/users/:id/status
    static updateStatus = asyncWrapper(async (req, res) => {
        const { status } = req.body;
        if (!status) {
            return ResponseFormatter.error(res, 'Status is required', 'VALIDATION_ERROR', {}, 400);
        }
        const io = req.app.get('io');
        const user = await UserService.adminUpdateUserStatus(req.params.id, status, req.user._id, req.ip, io);
        return ResponseFormatter.successAdmin(res, user, `User status updated to ${status}`);
    });

    // PUT /api/admin/users/:id/suspend
    static suspendUser = asyncWrapper(async (req, res) => {
        const io = req.app.get('io');
        const user = await UserService.adminSuspendUser(req.params.id, req.user._id, req.ip, io);
        return ResponseFormatter.successAdmin(res, user, 'User suspended successfully');
    });

    // PUT /api/admin/users/:id/reactivate
    static reactivateUser = asyncWrapper(async (req, res) => {
        const io = req.app.get('io');
        const user = await UserService.adminReactivateUser(req.params.id, req.user._id, req.ip, io);
        return ResponseFormatter.successAdmin(res, user, 'User reactivated successfully');
    });

    // GET /api/admin/users/:id/rides
    static getRides = asyncWrapper(async (req, res) => {
        const rides = await UserService.adminGetUserRideHistory(req.params.id);
        return ResponseFormatter.successAdmin(res, rides, 'User ride history retrieved successfully');
    });

    // GET /api/admin/users/:id/wallet
    static getWallet = asyncWrapper(async (req, res) => {
        const wallet = await UserService.adminGetUserWallet(req.params.id);
        return ResponseFormatter.successAdmin(res, wallet, 'User wallet transactions retrieved successfully');
    });

    // GET /api/admin/users/:id/payments
    static getPayments = asyncWrapper(async (req, res) => {
        const payments = await UserService.adminGetUserPayments(req.params.id);
        return ResponseFormatter.successAdmin(res, payments, 'User payments retrieved successfully');
    });
}

module.exports = AdminUserController;
