const mongoose = require('mongoose');

const adminRoleSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    permissions: [{ type: String }], // Array of permission keys
    isSystem: { type: Boolean, default: false }, // System roles cannot be deleted
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' }
}, { timestamps: true });

module.exports = mongoose.model('AdminRole', adminRoleSchema);
