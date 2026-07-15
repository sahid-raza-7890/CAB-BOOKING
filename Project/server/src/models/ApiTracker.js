const mongoose = require('mongoose');

const apiTrackerSchema = new mongoose.Schema({
    monthId: { 
        type: String, 
        required: true, 
        unique: true // Example format: "2026-07"
    },
    requestCount: { 
        type: Number, 
        default: 0 
    }
}, { timestamps: true });

module.exports = mongoose.model('ApiTracker', apiTrackerSchema);
