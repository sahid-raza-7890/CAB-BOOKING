const DriverVehicleService = require('../services/driverVehicleService');

class DriverVehicleController {
    static async getVehicles(req, res) {
        const data = await DriverVehicleService.getVehicles(req.user.id);
        res.json({ success: true, data });
    }

    static async addVehicle(req, res) {
        const io = req.app.get('io');
        const data = await DriverVehicleService.addVehicle(req.user.id, req.body, io);
        res.json({ success: true, data });
    }

    static async updateVehicle(req, res) {
        const io = req.app.get('io');
        const data = await DriverVehicleService.updateVehicle(req.params.id, req.user.id, req.body, io);
        res.json({ success: true, data });
    }

    static async deleteVehicle(req, res) {
        const io = req.app.get('io');
        const data = await DriverVehicleService.deleteVehicle(req.params.id, req.user.id, io);
        res.json({ success: true, data });
    }

    static async setActiveVehicle(req, res) {
        const io = req.app.get('io');
        const data = await DriverVehicleService.setActiveVehicle(req.params.id, req.user.id, io);
        res.json({ success: true, data });
    }
}

module.exports = DriverVehicleController;
