const mongoose = require('mongoose');

const adminPermissionSchema = new mongoose.Schema({
    module: { type: String, required: true },
    action: { type: String, required: true },
    key: { type: String, required: true, unique: true }, // e.g., 'analytics.view'
    description: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('AdminPermission', adminPermissionSchema);
