const mongoose = require('mongoose');

const driverSettlementSchema = new mongoose.Schema({
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true, index: true },
    settlementNumber: { type: String, required: true, unique: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalTrips: { type: Number, default: 0 },
    openingBalance: { type: Number, default: 0 },
    closingBalance: { type: Number, default: 0 },
    grossAmount: { type: Number, default: 0 },
    commission: { type: Number, default: 0 },
    incentives: { type: Number, default: 0 },
    penalties: { type: Number, default: 0 },
    adjustments: { type: Number, default: 0 },
    finalAmount: { type: Number, default: 0 }, // Amount that was available to be settled
    status: { type: String, enum: ['Pending', 'Processing', 'Settled', 'Failed'], default: 'Pending' },
    generatedBy: { type: String, default: 'System' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin User
    approvedAt: { type: Date },
    processedBy: { type: String }, // e.g., 'Stripe Connect'
    processedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('DriverSettlement', driverSettlementSchema);
