const mongoose = require('mongoose');

const loyaltyAccountSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    tier: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'], default: 'Bronze' },
    totalPoints: { type: Number, default: 0 },
    lifetimePoints: { type: Number, default: 0 } // Tracks total ever earned for tier calculation
}, { timestamps: true });

module.exports = mongoose.model('LoyaltyAccount', loyaltyAccountSchema);
