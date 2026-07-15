const DriverEarningService = require('../services/driverEarningService');
const WalletService = require('../services/walletService');
const ResponseFormatter = require('../utils/responseFormatter');

class DriverEarningController {
    static async getSummary(req, res) {
        const { userId } = req.user; // driverId

        // Get Wallet Balance for available/locked funds
        const wallet = await WalletService.getOrCreateWallet(userId, 'Driver');
        
        // Aggregate lifetime and weekly earnings purely for display logic
        const allEarnings = await DriverEarningService.getEarningsByDriver(userId);
        
        let lifetime = 0;
        let today = 0;
        let weekly = 0;

        const now = new Date();
        const startOfDay = new Date(now.setHours(0,0,0,0));
        
        allEarnings.forEach(e => {
            lifetime += e.netEarning;
            if (e.completedAt >= startOfDay) today += e.netEarning;
        });

        return ResponseFormatter.success(res, { 
            wallet: {
                balance: wallet.balance,
                locked: wallet.lockedBalance,
                available: wallet.balance - wallet.lockedBalance
            },
            summary: {
                today,
                weekly,
                lifetime
            }
        });
    }

    static async getHistory(req, res) {
        const { userId } = req.user;
        const earnings = await DriverEarningService.getEarningsHistory(userId);
        return ResponseFormatter.success(res, { earnings });
    }
}

module.exports = DriverEarningController;
