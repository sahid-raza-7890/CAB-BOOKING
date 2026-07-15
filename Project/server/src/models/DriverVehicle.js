const mongoose = require('mongoose');

const driverVehicleSchema = new mongoose.Schema({
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true
    },
    make: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    color: { type: String, trim: true },
    registrationNumber: { type: String, trim: true },
    licensePlate: { type: String, required: true, trim: true },
    insuranceNumber: { type: String, trim: true },
    vehicleType: { 
        type: String, 
        required: true,
        enum: ['Standard', 'Premium', 'XL', 'Electric', 'Motorcycle', 'Other'],
        default: 'Standard'
    },
    capacity: { type: Number, default: 4 },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Inactive'],
        default: 'Pending'
    },
    isActive: {
        type: Boolean,
        default: false
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, { timestamps: true });

// Indexes for optimization
driverVehicleSchema.index({ driverId: 1 });
driverVehicleSchema.index({ isActive: 1 });
driverVehicleSchema.index({ status: 1 });

module.exports = mongoose.model('DriverVehicle', driverVehicleSchema);
