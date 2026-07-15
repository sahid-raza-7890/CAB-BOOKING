const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    rideId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true, unique: true },
    passengerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    overallRating: { type: Number, required: true, min: 1, max: 5 },
    ratings: {
        driving: { type: Number, min: 1, max: 5, default: 5 },
        cleanliness: { type: Number, min: 1, max: 5, default: 5 },
        behavior: { type: Number, min: 1, max: 5, default: 5 },
        punctuality: { type: Number, min: 1, max: 5, default: 5 },
        vehicleCondition: { type: Number, min: 1, max: 5, default: 5 }
    },
    review: { type: String, trim: true, default: '' },
    tags: [{ type: String, trim: true }],
    isAnonymous: { type: Boolean, default: false },
    status: {
        type: String,
        enum: ['Pending', 'Published', 'Hidden', 'Reported'],
        default: 'Published'
    },
    adminNotes: { type: String, default: '' }
}, { timestamps: true });

// Indexes for optimized query performance
reviewSchema.index({ driverId: 1 });
reviewSchema.index({ passengerId: 1 });
reviewSchema.index({ rideId: 1 });
reviewSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
