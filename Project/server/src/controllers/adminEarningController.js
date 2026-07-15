const DriverSettlementService = require('../services/driverSettlementService');
const DriverEarningService = require('../services/driverEarningService');
const WalletService = require('../services/walletService');
const ResponseFormatter = require('../utils/responseFormatter');

class AdminEarningController {
    static async exportEarnings(req, res) {
        const { driverId, startDate, endDate } = req.query;
        let query = {};
        if (driverId) query.driverId = driverId;
        if (startDate || endDate) {
            query.completedAt = {};
            if (startDate) query.completedAt.$gte = new Date(startDate);
            if (endDate) query.completedAt.$lte = new Date(endDate);
        }

        const earnings = await DriverEarningService.getEarnings(query);

        // Convert to CSV
        const headers = ['Driver ID', 'Ride ID', 'Gross Fare', 'Commission', 'Net Earning', 'Completed At'];
        const csvRows = [headers.join(',')];

        earnings.forEach(e => {
            csvRows.push([
                e.driverId, 
                e.rideId, 
                e.grossFare, 
                e.commission, 
                e.netEarning, 
                e.completedAt.toISOString()
            ].join(','));
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=earnings.csv');
        return res.status(200).send(csvRows.join('\n'));
    }

    static async adjustEarnings(req, res) {
        const { driverId, type, amount, reason } = req.body;
        if (!['Bonus', 'Penalty'].includes(type)) {
            return ResponseFormatter.error(res, 'Type must be Bonus or Penalty', 'VALIDATION_ERROR', {}, 400);
        }

        const numericAmount = parseFloat(amount);
        if (numericAmount <= 0) return ResponseFormatter.error(res, 'Amount must be positive', 'VALIDATION_ERROR', {}, 400);

        const metadata = { reason, adminAdjusted: true };

        if (type === 'Bonus') {
            await WalletService.credit(driverId, 'Driver', numericAmount, 'DriverBonus', metadata);
        } else {
            await WalletService.debit(driverId, 'Driver', numericAmount, 'DriverPenalty', metadata);
        }

        return ResponseFormatter.success(res, { message: `${type} of â‚¹${numericAmount} applied to driver ${driverId}` });
    }

    static async approveSettlement(req, res) {
        const settlement = await DriverSettlementService.getSettlementById(req.params.id);
        if (!settlement) return ResponseFormatter.error(res, 'Settlement not found', 'NOT_FOUND', {}, 404);

        if (settlement.status !== 'Pending') {
            return ResponseFormatter.error(res, 'Only Pending settlements can be approved', 'VALIDATION_ERROR', {}, 400);
        }

        settlement.status = 'Processing';
        await DriverSettlementService.saveSettlement(settlement);

        return ResponseFormatter.success(res, { message: 'Settlement approved for processing', settlement });
    }
}

module.exports = AdminEarningController;
