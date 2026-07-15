const mongoose = require('mongoose');

const rideInvoiceSchema = new mongoose.Schema({
    rideId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    invoiceNumber: { type: String, required: true, unique: true },
    fareBreakdown: {
        baseFare: { type: Number, default: 0 },
        distanceFare: { type: Number, default: 0 },
        timeFare: { type: Number, default: 0 },
        waitingCharge: { type: Number, default: 0 },
        platformFee: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
    },
    taxes: { type: Number, default: 0 },
    discounts: { type: Number, default: 0 },
    walletUsed: { type: Number, default: 0 },
    externalPayment: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    generatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

rideInvoiceSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('RideInvoice', rideInvoiceSchema);
