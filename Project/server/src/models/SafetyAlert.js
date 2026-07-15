const mongoose = require('mongoose');

const safetyAlertSchema = new mongoose.Schema({
    alertOwnerType: {
        type: String,
        enum: ['Passenger', 'Driver'],
        required: true,
        default: 'Passenger' // Default for backward compatibility with existing passenger data
    },
    rideId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Ride',
        required: function() { return this.alertOwnerType === 'Passenger'; }
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: function() { return this.alertOwnerType === 'Passenger'; }
    },
    driverId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Driver',
        required: function() { return this.alertOwnerType === 'Driver'; }
    },
    alertType: {
        type: String,
        enum: ['SOS', 'Emergency', 'UnsafeDriving', 'Medical', 'Harassment', 'Accident', 'VehicleIssue', 'Other'],
        required: true
    },
    description: { type: String, trim: true, default: '' },
    status: {
        type: String,
        enum: ['Active', 'Acknowledged', 'Resolved', 'Cancelled'],
        default: 'Active'
    },
    currentLocation: {
        latitude: { type: Number },
        longitude: { type: Number },
        address: { type: String, trim: true }
    },
    contactsNotified: [{ type: String }],
    metadata: { type: Object, default: {} }
}, { timestamps: true });

// Indexes for performance
safetyAlertSchema.index({ rideId: 1 });
safetyAlertSchema.index({ userId: 1 });
safetyAlertSchema.index({ driverId: 1 });
safetyAlertSchema.index({ status: 1 });
safetyAlertSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SafetyAlert', safetyAlertSchema);
