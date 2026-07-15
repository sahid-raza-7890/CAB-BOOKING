const mongoose = require('mongoose');

const driverSessionSchema = new mongoose.Schema({
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true,
        index: true
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    isAvailable: {
        type: Boolean,
        default: false
    },
    socketId: {
        type: String,
        default: null
    },
    currentRideId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ride',
        default: null
    },
    currentLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0] // [longitude, latitude]
        }
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    shiftStartedAt: {
        type: Date,
        default: null
    },
    batteryLevel: {
        type: Number,
        default: null
    },
    heading: {
        type: Number,
        default: null
    },
    speed: {
        type: Number,
        default: null
    },
    metadata: {
        type: Object,
        default: {}
    },
    isOnBreak: {
        type: Boolean,
        default: false
    },
    breakType: {
        type: String,
        enum: ['Short Rest', 'Meal Break', 'Open Break', null],
        default: null
    },
    breakEndsAt: {
        type: Date,
        default: null
    },
    destinationFilter: {
        enabled: { type: Boolean, default: false },
        coordinates: { type: [Number], default: null }, // [longitude, latitude]
        address: { type: String, default: null }
    },
    preferredRideTypes: {
        type: [String],
        default: ['Standard', 'Immediate'] // Fix mismatch between Ride types and Driver preferences
    },
    maxPickupDistance: {
        type: Number,
        default: 5 // in kilometers
    },
    acceptScheduledTrips: {
        type: Boolean,
        default: true
    },
    lastAvailabilityChange: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

driverSessionSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('DriverSession', driverSessionSchema);
