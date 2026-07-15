const mongoose = require('mongoose');

const rewardHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    points: { type: Number, required: true },
    type: { type: String, enum: ['Earned', 'Redeemed', 'Expired'], required: true },
    source: { type: String, enum: ['Ride', 'Referral', 'Campaign', 'Admin', 'Conversion'], required: true },
    referenceId: { type: String, index: true }, // e.g., Ride ID
    description: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('RewardHistory', rewardHistorySchema);
