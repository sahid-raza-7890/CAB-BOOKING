const mongoose = require('mongoose');

const passengerRatingSchema = new mongoose.Schema({
    rideId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true, unique: true },
    passengerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    overallRating: { type: Number, required: true, min: 1, max: 5 },
    ratings: {
        pickupAccuracy: { type: Number, min: 1, max: 5, default: 5 },
        behavior: { type: Number, min: 1, max: 5, default: 5 },
        waitingTime: { type: Number, min: 1, max: 5, default: 5 }
    },
    review: { type: String, trim: true, default: '' },
    tags: [{ type: String, trim: true }],
    status: {
        type: String,
        enum: ['Pending', 'Published', 'Hidden', 'Reported'],
        default: 'Published'
    }
}, { timestamps: true });

// Indexes
passengerRatingSchema.index({ driverId: 1 });
passengerRatingSchema.index({ passengerId: 1 });
passengerRatingSchema.index({ rideId: 1 });

module.exports = mongoose.model('PassengerRating', passengerRatingSchema);
