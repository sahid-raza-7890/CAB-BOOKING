const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    userType: { type: String, enum: ['Passenger', 'Driver', 'Admin'], required: true },
    balance: { type: Number, default: 0 },
    lockedBalance: { type: Number, default: 0 }, // Used for pseudo-atomic locks to prevent double-spending
    status: { type: String, enum: ['Active', 'Frozen'], default: 'Active' },
    currency: { type: String, default: 'INR' },
    // Version key is automatically handled by Mongoose (__v), which we can use for optimistic concurrency if needed
}, { timestamps: true });

module.exports = mongoose.model('Wallet', walletSchema);
