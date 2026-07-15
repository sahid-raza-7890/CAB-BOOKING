const mongoose = require('mongoose');

const adminAuditSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true
    },
    targetType: {
        type: String,
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    ipAddress: {
        type: String
    },
    hash: {
        type: String, // SHA256 checksum for tamper detection
        required: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

adminAuditSchema.index({ adminId: 1, createdAt: -1 });
adminAuditSchema.index({ targetType: 1, targetId: 1 });

module.exports = mongoose.model('AdminAudit', adminAuditSchema);
