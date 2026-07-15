const DriverSettlementService = require('../services/driverSettlementService');
const ResponseFormatter = require('../utils/responseFormatter');

class DriverSettlementController {
    static async getSettlements(req, res) {
        const { userId } = req.user;
        const settlements = await DriverSettlementService.getSettlements(userId);
        return ResponseFormatter.success(res, { settlements });
    }

    static async getActiveSettlement(req, res) {
        const { userId } = req.user;
        const activeSettlement = await DriverSettlementService.getOrCreateActiveSettlement(userId);
        return ResponseFormatter.success(res, { activeSettlement });
    }
}

module.exports = DriverSettlementController;
