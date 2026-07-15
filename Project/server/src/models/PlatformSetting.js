const mongoose = require('mongoose');

const platformSettingSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: ['Pricing', 'Commission', 'Maps', 'Payments', 'Notifications', 'Localization', 'Security', 'Branding', 'FeatureFlags'],
        index: true
    },
    key: {
        type: String,
        required: true,
        trim: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed, // Can be string, number, boolean, object
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    isEditable: {
        type: Boolean,
        default: true
    },
    isPublic: {
        type: Boolean,
        default: false // If true, can be read without admin auth (e.g. for driver app to know commission rate)
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdminUser'
    }
}, { timestamps: true });

platformSettingSchema.index({ category: 1, key: 1 }, { unique: true });

const PlatformSetting = mongoose.model('PlatformSetting', platformSettingSchema);

module.exports = PlatformSetting;
