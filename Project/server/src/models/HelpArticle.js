const mongoose = require('mongoose');

const helpArticleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true, default: 'General' },
    targetAudience: { type: String, enum: ['All', 'Passenger', 'Driver'], default: 'All' },
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    viewCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('HelpArticle', helpArticleSchema);
