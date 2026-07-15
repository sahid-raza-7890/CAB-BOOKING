const mongoose = require('mongoose');

const driverDocumentSchema = new mongoose.Schema({
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true
    },
    documentType: {
        type: String,
        required: true,
        enum: ['License', 'Insurance', 'Registration', 'BackgroundCheck', 'Other']
    },
    documentNumber: {
        type: String,
        trim: true
    },
    documentUrl: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Expired'],
        default: 'Pending'
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    },
    verifiedAt: {
        type: Date
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Admin ID
    },
    expiryDate: {
        type: Date
    },
    rejectionReason: {
        type: String,
        trim: true
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, { timestamps: true });

// Indexes for optimization
driverDocumentSchema.index({ driverId: 1 });
driverDocumentSchema.index({ status: 1 });
driverDocumentSchema.index({ documentType: 1 });

module.exports = mongoose.model('DriverDocument', driverDocumentSchema);
