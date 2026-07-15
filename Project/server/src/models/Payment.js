const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    rideId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    method: { type: String, enum: ['Wallet', 'UPI', 'Card', 'NetBanking', 'Cash', 'Split'], required: true },
    status: { type: String, enum: ['Pending', 'Completed', 'Failed', 'Refunded'], default: 'Pending' },
    gatewayOrderId: { type: String }, // e.g. Razorpay order_id
    gatewayPaymentId: { type: String }, // e.g. Razorpay payment_id
    gatewaySignature: { type: String },
    breakdown: {
        walletAmount: { type: Number, default: 0 },
        gatewayAmount: { type: Number, default: 0 },
        couponAmount: { type: Number, default: 0 }
    }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
