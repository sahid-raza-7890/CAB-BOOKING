const mongoose = require('mongoose');

const campaignAudienceSchema = new mongoose.Schema({
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['Targeted', 'Engaged', 'Converted'], default: 'Targeted' }
}, { timestamps: true });

// Prevent duplicate targeting
campaignAudienceSchema.index({ campaignId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('CampaignAudience', campaignAudienceSchema);
