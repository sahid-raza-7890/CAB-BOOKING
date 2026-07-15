const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
    senderModel: { type: String, required: true, enum: ['User', 'Driver', 'Admin'] },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const ticketSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, refPath: 'userModel', required: true },
    userType: { type: String, enum: ['Passenger', 'Driver', 'Admin'], required: true, default: 'Passenger' },
    userModel: { type: String, enum: ['User', 'Driver', 'Admin'], required: true, default: 'User' },
    subject: { type: String, required: true },
    category: { type: String, enum: ['Ride', 'Payment', 'Account', 'Technical', 'Other'], default: 'Other' },
    priority: { type: String, enum: ['Low', 'Normal', 'High', 'Urgent'], default: 'Normal' },
    description: { type: String, required: true },
    status: { type: String, enum: ['Open', 'InProgress', 'Resolved', 'Closed'], default: 'Open' },
    replies: [replySchema],
    
    // Legacy support for older tickets
    passengerName: { type: String }
}, { timestamps: true });

ticketSchema.index({ userId: 1, status: 1 });
ticketSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Ticket', ticketSchema);
