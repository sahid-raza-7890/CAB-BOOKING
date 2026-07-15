const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['Percentage', 'Flat'], required: true },
    value: { type: Number, required: true }, // E.g., 20 (%) or 50 (flat)
    maxDiscount: { type: Number }, // Cap for percentage
    minFare: { type: Number, default: 0 },
    active: { type: Boolean, default: true, index: true },
    
    // Targeting & Eligibility
    targetAudience: { type: String, enum: ['All', 'NewUser', 'Segment'], default: 'All' },
    eligibleRideTypes: { type: [String], default: ['City', 'Inter City', 'Rental', 'Scheduled'] },
    eligibleVehicleTypes: { type: [String], default: ['Basic', 'SUV', 'Luxury'] },
    
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);
