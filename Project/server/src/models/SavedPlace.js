const mongoose = require('mongoose');

const savedPlaceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    label: { type: String, required: true },
    address: { type: String, required: true },
    formattedAddress: { type: String },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    placeId: { type: String }, // For Google Maps integration
    icon: { type: String, default: 'fa-location-dot' },
    color: { type: String, default: '#ffffff' },
    isDefault: { type: Boolean, default: false },
    type: { 
        type: String, 
        enum: ['Home', 'Work', 'Favorite', 'Recent', 'Custom'], 
        default: 'Custom' 
    },
    source: {
        type: String,
        enum: ['Manual', 'GoogleMaps', 'RideHistory', 'RecentSearch', 'Import', 'AIRecommendation'],
        default: 'Manual'
    },
    metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

savedPlaceSchema.index({ userId: 1, type: 1 });
savedPlaceSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SavedPlace', savedPlaceSchema);
