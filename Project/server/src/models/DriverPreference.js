const mongoose = require('mongoose');

const driverPreferenceSchema = new mongoose.Schema({
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    language: {
        type: String,
        enum: ['English', 'Spanish', 'French', 'Hindi'], // Example languages
        default: 'English'
    },
    theme: {
        type: String,
        enum: ['System', 'Dark', 'Light'],
        default: 'System'
    },
    notificationPreferences: {
        rideAlerts: { type: Boolean, default: true },
        dispatchAlerts: { type: Boolean, default: true },
        supportUpdates: { type: Boolean, default: true },
        settlementNotifications: { type: Boolean, default: true },
        marketing: { type: Boolean, default: false }
    },
    privacy: {
        analyticsSharing: { type: Boolean, default: true },
        locationPermissions: { type: Boolean, default: true },
        visibility: { type: Boolean, default: false }
    },
    navigationPreferences: {
        avoidTolls: { type: Boolean, default: false },
        avoidHighways: { type: Boolean, default: false },
        autoRerouting: { type: Boolean, default: true }
    },
    ridePreferences: {
        preferredRideTypes: { type: [String], default: ['Standard'] },
        maxPickupRadius: { type: Number, default: 5 }, // in km/miles
        autoAccept: { type: Boolean, default: false } // placeholder
    },
    availabilityPreferences: {
        defaultOnlineMode: { type: Boolean, default: true },
        breakBehavior: { type: String, enum: ['PauseRequests', 'GoOffline'], default: 'PauseRequests' },
        destinationFilterDefaults: { type: mongoose.Schema.Types.Mixed, default: {} }
    },
    security: {
        biometricLogin: { type: Boolean, default: false },
        twoFactorEnabled: { type: Boolean, default: false },
        trustedDevices: { type: [String], default: [] }
    },
    mapProvider: {
        type: String,
        enum: ['Google Maps', 'Waze', 'Apple Maps', 'OpenStreetMap'],
        default: 'Google Maps'
    },
    voiceNavigation: {
        type: Boolean,
        default: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, { timestamps: true });

module.exports = mongoose.model('DriverPreference', driverPreferenceSchema);
