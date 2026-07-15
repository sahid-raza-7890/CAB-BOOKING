const mongoose = require('mongoose');

const referralHistorySchema = new mongoose.Schema({
    referrerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    referredUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    referralCode: { type: String, required: true },
    reward: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Qualified', 'Rewarded', 'Expired'], default: 'Pending', index: true },
    rideRequirement: { type: Number, default: 1 }, // Minimum rides the referred user must complete
    completedRideCount: { type: Number, default: 0 },
    metadata: { type: Object, default: {} }
}, { timestamps: true });

// Prevent duplicate referrals (one user can only be referred once)
referralHistorySchema.index({ referredUserId: 1 }, { unique: true });

module.exports = mongoose.model('ReferralHistory', referralHistorySchema);
