const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userType: { type: String, enum: ['Passenger', 'Driver', 'Admin'], required: true, default: 'Passenger' },
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, required: true }, // e.g. 'RIDE_ACCEPTED', 'WALLET_CREDIT'
    category: { 
        type: String, 
        enum: ['Ride', 'Wallet', 'Payments', 'Offers', 'Safety', 'System'], 
        default: 'System' 
    },
    priority: { type: String, enum: ['Low', 'Normal', 'High', 'Urgent'], default: 'Normal' },
    icon: { type: String, default: 'bell' }, // Frontend icon mapping key
    read: { type: Boolean, default: false },
    actionUrl: { type: String }, // e.g. '/dashboard/rides/123'
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} } // For arbitrary context data
}, { 
    timestamps: true 
});

// Indexes for fast querying, filtering and unread count calculations
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, category: 1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
