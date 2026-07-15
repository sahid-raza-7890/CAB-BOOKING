const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    type: { 
        type: String, 
        required: true,
        enum: ['Basic', 'SUV', 'Luxurious', 'Moto', 'Auto', 'EV', 'BookLater', 'Rental']
    },
    label: { type: String, required: true },    // Display name e.g. "SUV Plus"
    description: { type: String, default: '' },
    emoji: { type: String, default: 'ðŸš—' },     // Emoji icon for UI
    imagePath: { type: String, default: '' },   // Optional image asset path
    baseFare: { type: Number, required: true, default: 0 },
    perKmRate: { type: Number, required: true, default: 0 },
    capacity: { type: Number, default: 4 },
    luggageCapacity: { type: Number, default: 2 },
    features: [{ type: String }],               // e.g. ['AC', 'WiFi', 'Child Seat']
    eta: { type: String, default: '3-5 min' },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 }     // Controls display order in UI grid
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
