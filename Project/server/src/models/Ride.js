const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({

    // â”€â”€ WHO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // Legacy field kept for backward compatibility with old admin dashboard
    passengerName: { type: String },

    // â”€â”€ BOOKING TYPE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    type: {
        type: String,
        enum: ['Immediate', 'Scheduled', 'Rental', 'Airport Transfer', 'Inter City', 'Personal Driver', 'Package'],
        default: 'Immediate'
    },
    scheduledTime: { type: Date },          // Populated when type === 'Scheduled'
    rentalDurationHours: { type: Number },  // Populated when type === 'Rental'

    // â”€â”€ VEHICLE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    vehicleType: { type: String, default: 'Basic' }, // 'Basic','SUV','Luxurious','Moto','Auto','EV'

    // â”€â”€ LOCATIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    pickupLocation:  { type: String, required: true },
    dropoffLocation: { type: String },  // Not required for Rental type
    intermediateStops: { type: [String], default: [] }, // Array of intermediate locations

    // â”€â”€ SPECIALIZED BOOKING â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    flightNumber: { type: String },
    isGuestBooking: { type: Boolean, default: false },
    guestName: { type: String },
    guestPhone: { type: String },

    // â”€â”€ FARE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    fare:             { type: Number, default: 0 },
    distanceKm:       { type: Number, default: 0 },
    baseFare:         { type: Number, default: 0 },
    perKmRate:        { type: Number, default: 0 },

    // â”€â”€ PROMOTIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
    offerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer' },
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
    discountAmount: { type: Number, default: 0 },

    // â”€â”€ ASSIGNMENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },

    // â”€â”€ STATUS MACHINE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Pending â†’ Searching â†’ Accepted â†’ InProgress â†’ Completed | Cancelled
    status: {
        type: String,
        enum: ['Pending', 'Searching', 'Accepted', 'InProgress', 'Completed', 'Cancelled'],
        default: 'Searching'
    },

    // â”€â”€ PAYMENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    paymentStatus: {
        type: String,
        enum: ['Unpaid', 'Paid', 'Refunded'],
        default: 'Unpaid'
    },
    paymentMethod: {
        type: String,
        enum: ['Cash', 'Card', 'Wallet', 'UPI'],
        default: 'Cash'
    },

    // â”€â”€ METADATA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    cancelledBy: { type: String },
    notes: { type: String },

    // â”€â”€ PHASE 4: SECURITY & DISPATCH â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    otp: { type: String },
    liveTrackingUrl: { type: String },
    preferences: {
        silentRide: { type: Boolean, default: false },
        temperature: { type: String, default: 'No Preference' },
        musicFriendly: { type: Boolean, default: true }
    },

    // â”€â”€ PHASE 5: MODULE EXPANSION (MY RIDES) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    timeline: {
        booking: { type: Date, default: Date.now },
        driverAssigned: { type: Date },
        driverArrived: { type: Date },
        otpVerified: { type: Date },
        rideStarted: { type: Date },
        rideCompleted: { type: Date }
    },
    fareBreakdown: {
        baseFare: { type: Number, default: 0 },
        distanceFare: { type: Number, default: 0 },
        timeFare: { type: Number, default: 0 },
        waitingCharge: { type: Number, default: 0 },
        platformFee: { type: Number, default: 0 },
        taxes: { type: Number, default: 0 },
        coupon: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
    },
    rating: {
        driver: { type: Number, min: 1, max: 5 },
        vehicle: { type: Number, min: 1, max: 5 },
        text: { type: String },
        suggestions: [{ type: String }],
        submittedAt: { type: Date }
    },
    cancelReason: { type: String },
    invoiceNumber: { type: String },
    receiptUrl: { type: String },

    // â”€â”€ PHASE 6: INTERCITY MODULE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    intercity: {
        tripType: { type: String, enum: ['One Way', 'Round Trip', 'Multi City'], default: 'One Way' },
        returnDate: { type: Date },
        passengers: { type: Number, default: 1 },
        luggage: { type: Number, default: 0 },
        driverAllowance: { type: Number, default: 0 },
        nightCharge: { type: Number, default: 0 },
        stateTax: { type: Number, default: 0 },
        tollCharges: { type: Number, default: 0 },
        parking: { type: Number, default: 0 }
    },

    // â”€â”€ PHASE 7: RENTALS MODULE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    rental: {
        packageType: { type: String }, // e.g. "2 Hrs / 20 km"
        hours: { type: Number },
        includedDistance: { type: Number },
        overtimeRate: { type: Number }, // Rate per extra hour
        extraDistanceRate: { type: Number }, // Rate per extra km
        estimatedEndTime: { type: Date },
        actualEndTime: { type: Date },
        overtimeCharges: { type: Number, default: 0 },
        extraDistanceCharges: { type: Number, default: 0 }
    },

    // â”€â”€ PHASE 8: SCHEDULE RIDE MODULE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    schedule: {
        scheduled: { type: Boolean, default: false },
        pickupDate: { type: String },
        pickupTime: { type: String },
        timezone: { type: String, default: 'Asia/Kolkata' },
        assignmentWindow: { type: Date }, // Time when the ride enters the active dispatch queue
        reminderSent: { type: Boolean, default: false },
        driverAssigned: { type: Boolean, default: false },
        scheduledStatus: { type: String, enum: ['Scheduled', 'Preparing', 'Searching', 'Assigned', 'Active', 'Completed', 'Cancelled'], default: 'Scheduled' }
    }

}, { timestamps: true });

// Index for fast user-ride history queries
rideSchema.index({ userId: 1, createdAt: -1 });
// Index for fast active ride queries
rideSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Ride', rideSchema);
