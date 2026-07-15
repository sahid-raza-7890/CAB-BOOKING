const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'Passenger' },
    phone: { type: String, default: '' },
    bio: { type: String, default: '' },
    preferredLanguage: { type: String, default: 'English' },
    paymentMethods: {
        type: [{
            cardholderName: String,
            cardNumber: String,
            expiryDate: String,
            cardBrand: String,
            isDefault: Boolean
        }],
        default: []
    },
    billingAddress: {
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        postalCode: { type: String, default: '' },
        country: { type: String, default: '' }
    },
    registeredVehicles: { type: [String], default: ['Honda Civic 2024'] },
    trustedContacts: { type: [String], default: [], index: true },
    communicationMasking: { type: Boolean, default: false },
    cookieConsent: {
        type: {
            essential: { type: Boolean, default: true },
            analytics: { type: Boolean, default: false },
            marketing: { type: Boolean, default: false }
        },
        default: { essential: true, analytics: false, marketing: false }
    },
    notifications: {
        type: {
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: false },
            whatsapp: { type: Boolean, default: false },
            push: { type: Boolean, default: false }
        },
        default: { email: true, sms: false, whatsapp: false, push: false }
    },
    region: { type: String, default: 'US' },
    theme: { type: String, default: 'light' },
    pin: { type: String, default: '1234' },
    ridePreferences: {
        type: {
            silentRide: { type: Boolean, default: false },
            temperature: { type: String, enum: ['Warm', 'Cool', 'No Preference'], default: 'No Preference' },
            musicFriendly: { type: Boolean, default: true }
        },
        default: { silentRide: false, temperature: 'No Preference', musicFriendly: true }
    },
    securitySettings: {
        type: {
            locationTracking: { type: String, enum: ['Always', 'While Using', 'Never'], default: 'While Using' },
            driverRatingFilter: { type: Number, default: 4.5 },
            adBlock: { type: Boolean, default: true }
        },
        default: { locationTracking: 'While Using', driverRatingFilter: 4.5, adBlock: true }
    },
    status: { type: String, enum: ['Active', 'Suspended', 'Pending', 'Inactive'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
