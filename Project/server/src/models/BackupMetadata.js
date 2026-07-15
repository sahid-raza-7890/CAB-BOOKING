const mongoose = require('mongoose');

const backupMetadataSchema = new mongoose.Schema({
    backupId: { type: String, required: true, unique: true },
    filename: { type: String, required: true },
    checksum: { type: String, required: true },
    mongoVersion: { type: String },
    databaseSize: { type: Number },
    duration: { type: Number },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['Success', 'Failed'], default: 'Success' }
}, { timestamps: true });

module.exports = mongoose.model('BackupMetadata', backupMetadataSchema);
