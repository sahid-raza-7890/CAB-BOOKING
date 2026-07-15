const mongoose = require('mongoose');

const withdrawalRequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    userType: { type: String, enum: ['Driver'], required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['BankTransfer', 'UPI'], required: true },
    details: { type: mongoose.Schema.Types.Mixed, required: true }, // UPI ID or Bank Details
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Processing', 'Completed'], default: 'Pending' },
    walletTransactionId: { type: String }, // Links to the ledger Debit entry
    adminNotes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('WithdrawalRequest', withdrawalRequestSchema);
