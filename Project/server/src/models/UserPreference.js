const mongoose = require('mongoose');

const userPreferenceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    language: {
        type: String,
        enum: ['English', 'Hindi', 'Telugu'],
        default: 'English'
    },
    theme: {
        type: String,
        enum: ['System', 'Dark', 'Light'],
        default: 'System'
    },
    notificationPreferences: {
        rideUpdates: { type: Boolean, default: true },
        offers: { type: Boolean, default: true },
        promotions: { type: Boolean, default: false },
        wallet: { type: Boolean, default: true },
        support: { type: Boolean, default: true },
        safety: { type: Boolean, default: true },
        referrals: { type: Boolean, default: true },
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: true }
    },
    privacy: {
        locationTracking: { type: Boolean, default: true },
        analytics: { type: Boolean, default: true },
        personalizedAds: { type: Boolean, default: false },
        profileVisibility: { type: Boolean, default: false }
    },
    ridePreferences: {
        defaultPaymentMethod: { type: String, default: 'Cash' },
        preferredVehicleType: { type: String, default: 'Any' },
        autoApplyCoupons: { type: Boolean, default: true },
        autoUseWallet: { type: Boolean, default: true }
    },
    security: {
        biometricEnabled: { type: Boolean, default: false },
        twoFactorEnabled: { type: Boolean, default: false }
    },
    devicePreferences: {
        rememberLogin: { type: Boolean, default: true }
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, { timestamps: true });

module.exports = mongoose.model('UserPreference', userPreferenceSchema);
