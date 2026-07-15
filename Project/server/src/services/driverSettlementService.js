const DriverSettlement = require('../models/DriverSettlement');

class DriverSettlementService {
    
    /**
     * Gets the active (current week) settlement for a driver. Creates one if missing.
     */
    static async getOrCreateActiveSettlement(driverId) {
        const now = new Date();
        
        // Simple weekly bucketing: Start of week (Monday)
        const day = now.getDay() || 7; 
        const startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(now.getDate() - day + 1);

        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);

        const settlementNumber = `SET-${driverId.toString().substring(18)}-${startDate.getTime()}`;

        let settlement = await DriverSettlement.findOne({ driverId, settlementNumber });
        if (!settlement) {
            settlement = new DriverSettlement({
                driverId,
                settlementNumber,
                startDate,
                endDate,
                status: 'Pending'
            });
            await settlement.save();
        }

        return settlement;
    }

    /**
     * Appends earning data to the active bucket.
     */
    static async logEarningToActiveSettlement(driverId, earningRecord) {
        const settlement = await this.getOrCreateActiveSettlement(driverId);

        settlement.totalTrips += 1;
        settlement.grossAmount += earningRecord.grossFare;
        settlement.commission += (earningRecord.commission + earningRecord.platformFee);
        settlement.incentives += (earningRecord.incentive + earningRecord.bonus);
        settlement.penalties += earningRecord.penalty;
        
        // The final amount is purely for record keeping on the settlement object
        // since the Wallet is the source of truth for the actual money available.
        settlement.finalAmount += earningRecord.netEarning;

        await settlement.save();
    }

    static async getSettlements(driverId) {
        return await DriverSettlement.find({ driverId }).sort({ startDate: -1 });
    }

    static async getSettlementById(id) {
        return await DriverSettlement.findById(id);
    }

    static async saveSettlement(settlement) {
        return await settlement.save();
    }

    // â”€â”€â”€ ADMIN FINANCIAL OPERATIONS (Sprint 26) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    static async getPendingSettlements() {
        return await DriverSettlement.find({ status: 'Pending' })
            .populate({ path: 'driverId', select: 'name email phone' })
            .sort({ startDate: -1 })
            .lean();
    }

    static async getCompletedSettlements() {
        return await DriverSettlement.find({ status: 'Settled' })
            .populate({ path: 'driverId', select: 'name email phone' })
            .sort({ startDate: -1 })
            .lean();
    }

    static async releaseSettlement(settlementId, adminId, ipAddress, io) {
        const settlement = await DriverSettlement.findById(settlementId);
        if (!settlement) throw new Error('Settlement not found');

        if (settlement.status !== 'Pending') {
            throw new Error(`Settlement status is ${settlement.status}, only Pending settlements can be released.`);
        }

        const previousStatus = settlement.status;
        settlement.status = 'Settled';
        settlement.approvedBy = adminId;
        settlement.approvedAt = new Date();
        settlement.processedBy = 'Admin Manual Release';
        settlement.processedAt = new Date();
        await settlement.save();

        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'RELEASE_SETTLEMENT',
            targetType: 'DriverSettlement',
            targetId: settlement._id,
            details: {
                driverId: settlement.driverId,
                amount: settlement.finalAmount,
                previousStatus,
                newStatus: 'Settled'
            },
            ipAddress
        });

        if (io) {
            io.to('admin_global').emit('admin_dashboard_update');
            io.to(`driver_${settlement.driverId}`).emit('settlementUpdated', { settlementId: settlement._id, status: 'Settled' });
        }

        return settlement;
    }
}

module.exports = DriverSettlementService;
