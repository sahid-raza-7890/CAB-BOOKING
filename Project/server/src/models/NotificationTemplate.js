const mongoose = require('mongoose');

const notificationTemplateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    channel: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: 'bell' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' },
}, { timestamps: true });

module.exports = mongoose.model('NotificationTemplate', notificationTemplateSchema);
