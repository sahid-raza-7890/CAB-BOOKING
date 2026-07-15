const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['Draft', 'Active', 'Paused', 'Completed'], default: 'Draft', index: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    budget: { type: Number, default: 0 },
    spend: { type: Number, default: 0 },
    roi: { type: Number, default: 0 }, // Analytics tracking
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Campaign', campaignSchema);
