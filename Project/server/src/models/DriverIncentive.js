const mongoose = require('mongoose');

const driverIncentiveSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    targetTrips: { type: Number, required: true },
    targetAmount: { type: Number, default: 0 },
    reward: { type: Number, required: true },
    vehicleTypes: { type: [String], default: ['Basic', 'SUV', 'Luxury'] },
    cityRestrictions: { type: [String], default: [] },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    activeDays: { type: [String], default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
    active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('DriverIncentive', driverIncentiveSchema);
