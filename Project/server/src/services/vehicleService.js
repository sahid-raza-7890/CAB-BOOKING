const Vehicle = require('../models/Vehicle');

class VehicleService {
    static async getActiveVehicles() {
        return await Vehicle.find({ isActive: true }).sort({ sortOrder: 1 });
    }

    static async getVehicleById(id) {
        return await Vehicle.findById(id);
    }
}

module.exports = VehicleService;
