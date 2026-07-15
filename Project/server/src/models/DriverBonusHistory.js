const mongoose = require('mongoose');

const driverBonusHistorySchema = new mongoose.Schema({
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true, index: true },
    incentiveId: { type: mongoose.Schema.Types.ObjectId, ref: 'DriverIncentive', required: true },
    reward: { type: Number, required: true },
    rewardType: { type: String, enum: ['Cash', 'Points', 'Voucher'], default: 'Cash' },
    walletTransactionId: { type: String }, // Links to the actual wallet credit if Cash
    achievedAt: { type: Date, default: Date.now },
    claimed: { type: Boolean, default: false },
    claimedAt: { type: Date }
}, { timestamps: true });

// Prevent duplicate achievement of the exact same quest instance by the same driver
driverBonusHistorySchema.index({ driverId: 1, incentiveId: 1 }, { unique: true });

module.exports = mongoose.model('DriverBonusHistory', driverBonusHistorySchema);
