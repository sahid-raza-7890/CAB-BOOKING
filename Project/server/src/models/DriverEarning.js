const mongoose = require('mongoose');

const driverEarningSchema = new mongoose.Schema({
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true, index: true },
    rideId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true, index: true },
    rideType: { type: String, enum: ['City', 'Inter City', 'Rental', 'Scheduled', 'Airport'], default: 'City' },
    earningSource: { type: String, enum: ['CompletedRide', 'PassengerCancellation', 'NoShow'], default: 'CompletedRide' },
    paymentMethod: { type: String, enum: ['Wallet', 'Cash', 'Split', 'Gateway'], default: 'Wallet' },
    walletTransactionId: { type: String }, // Reference to the wallet ledger
    grossFare: { type: Number, required: true, default: 0 },
    commission: { type: Number, required: true, default: 0 },
    platformFee: { type: Number, default: 0 },
    incentive: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    tip: { type: Number, default: 0 },
    penalty: { type: Number, default: 0 },
    netEarning: { type: Number, required: true, default: 0 },
    paymentStatus: { type: String, enum: ['Pending', 'Credited', 'Settled'], default: 'Pending' },
    settlementDate: { type: Date }, // Will be set when a settlement runs
    completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('DriverEarning', driverEarningSchema);
