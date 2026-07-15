const mongoose = require('mongoose');

const referralCodeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    code: { type: String, required: true, unique: true, index: true },
    rewardAmount: { type: Number, default: 10.0 }, // Base reward amount for the referrer
    status: { type: String, enum: ['Active', 'Disabled', 'Expired'], default: 'Active' },
    totalUses: { type: Number, default: 0 },
    maxUses: { type: Number, default: 50 }, // Standard limit to prevent abuse
    expiresAt: { type: Date },
    metadata: { type: Object, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('ReferralCode', referralCodeSchema);
