const mongoose = require('mongoose');

const rideDispatchSchema = new mongoose.Schema({
    rideId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ride',
        required: true,
        index: true
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Auth usually driven by User model
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected', 'Expired', 'Cancelled'],
        default: 'Pending',
        index: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true
    },
    acceptedAt: {
        type: Date
    },
    rejectedAt: {
        type: Date
    },
    reason: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('RideDispatch', rideDispatchSchema);
