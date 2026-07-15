const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // ðŸš¨ Added Bcrypt Password
    phone: String,
    cabType: String,
    vehicleNumber: String,
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    role: { type: String, default: 'Driver' }, // ðŸš¨ Security Clearance
    isVerified: { type: Boolean, default: false },
    status: { type: String, enum: ['Pending', 'Active', 'Suspended', 'Inactive'], default: 'Pending' },
    complianceScore: { type: Number, default: 0 },
    bankingDetails: {
        accountName: { type: String, default: '' },
        accountNumber: { type: String, default: '' },
        routingNumber: { type: String, default: '' },
        bankName: { type: String, default: '' }
    },
    availabilitySchedule: {
        type: [{
            day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
            startTime: String,
            endTime: String
        }],
        default: []
    },
    documents: {
        licenseExpiry: { type: Date },
        insuranceExpiry: { type: Date },
        backgroundCheckExpiry: { type: Date }
    }
}, { timestamps: true });

module.exports = mongoose.model('Driver', driverSchema);
