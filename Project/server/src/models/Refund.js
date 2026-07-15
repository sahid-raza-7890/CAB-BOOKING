const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    referenceId: { type: String, required: true, index: true }, // Payment ID or Ride ID
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Processing', 'Completed', 'Failed'], default: 'Pending' },
    type: { type: String, enum: ['Full', 'Partial'], default: 'Full' },
    destination: { type: String, enum: ['Wallet', 'OriginalMethod'], default: 'Wallet' },
    walletTransactionId: { type: String }, // Links to the ledger entry when credited to wallet
}, { timestamps: true });

module.exports = mongoose.model('Refund', refundSchema);
