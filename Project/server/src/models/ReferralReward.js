const mongoose = require('mongoose');

const referralRewardSchema = new mongoose.Schema({
    referrerId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true }, // The user who referred
    referredUserId: { type: mongoose.Schema.Types.ObjectId, required: true }, // The new user
    rewardAmount: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Credited', 'Revoked'], default: 'Pending' },
    walletTransactionId: { type: String }, // Ledger link
    reason: { type: String, default: 'Signup Bonus' }
}, { timestamps: true });

module.exports = mongoose.model('ReferralReward', referralRewardSchema);
