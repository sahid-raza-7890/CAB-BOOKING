const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
    transactionId: { type: String, required: true, unique: true }, // e.g. TXN_ABC123
    walletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet', required: true, index: true },
    referenceId: { type: String, index: true }, // ID of the ride, refund, or external payment
    referenceType: { type: String, enum: ['Ride', 'Refund', 'TopUp', 'Withdrawal', 'Bonus', 'Manual', 'RideEarning', 'DriverBonus', 'DriverPenalty'], required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['Credit', 'Debit'], required: true },
    openingBalance: { type: Number, required: true },
    closingBalance: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Completed' },
    currency: { type: String, default: 'INR' },
    createdBy: { type: String, default: 'System' }, // User ID or 'Admin', 'System'
    metadata: { type: mongoose.Schema.Types.Mixed } // e.g. Reason, notes, admin email
}, { timestamps: true });

module.exports = mongoose.model('WalletTransaction', walletTransactionSchema);
