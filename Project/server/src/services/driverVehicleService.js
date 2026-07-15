const DriverVehicle = require('../models/DriverVehicle');
const Driver = require('../models/Driver');

class DriverVehicleService {
    static async getVehicles(driverId) {
        return await DriverVehicle.find({ driverId }).sort({ createdAt: -1 }).lean();
    }

    static async getActiveVehicle(driverId) {
        return await DriverVehicle.findOne({ driverId, isActive: true }).lean();
    }

    static async addVehicle(driverId, payload, io) {
        const existingVehicles = await DriverVehicle.countDocuments({ driverId });

        const newVehicle = new DriverVehicle({
            ...payload,
            driverId,
            status: 'Pending',
            isActive: existingVehicles === 0 // Automatically active if it's the first vehicle
        });

        await newVehicle.save();

        if (io) {
            io.to(`driver_${driverId}`).emit('vehicleUpdated', { driverId, vehicleId: newVehicle._id, action: 'add' });
        }

        return newVehicle;
    }

    static async updateVehicle(vehicleId, driverId, payload, io) {
        const vehicle = await DriverVehicle.findOne({ _id: vehicleId, driverId });
        if (!vehicle) throw new Error('Vehicle not found or unauthorized');

        Object.assign(vehicle, payload);
        await vehicle.save();

        if (io) {
            io.to(`driver_${driverId}`).emit('vehicleUpdated', { driverId, vehicleId: vehicle._id, action: 'update' });
        }

        return vehicle;
    }

    static async deleteVehicle(vehicleId, driverId, io) {
        const vehicle = await DriverVehicle.findOne({ _id: vehicleId, driverId });
        if (!vehicle) throw new Error('Vehicle not found or unauthorized');

        if (vehicle.isActive) {
            throw new Error('Cannot delete the currently active vehicle. Switch to another vehicle first.');
        }

        await vehicle.deleteOne();

        if (io) {
            io.to(`driver_${driverId}`).emit('vehicleUpdated', { driverId, vehicleId, action: 'delete' });
        }

        return { success: true };
    }

    static async setActiveVehicle(vehicleId, driverId, io) {
        const vehicle = await DriverVehicle.findOne({ _id: vehicleId, driverId });
        if (!vehicle) throw new Error('Vehicle not found or unauthorized');

        if (vehicle.status === 'Rejected') {
            throw new Error('Cannot activate a rejected vehicle.');
        }

        // Deactivate all others
        await DriverVehicle.updateMany(
            { driverId, _id: { $ne: vehicleId } },
            { $set: { isActive: false } }
        );

        // Activate the selected one
        vehicle.isActive = true;
        await vehicle.save();

        if (io) {
            io.to(`driver_${driverId}`).emit('vehicleUpdated', { driverId, vehicleId: vehicle._id, action: 'activate' });
        }

        return vehicle;
    }

    // â”€â”€â”€ ADMIN VEHICLE COMPLIANCE METHODS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    static async getPendingVehicles() {
        return await DriverVehicle.find({ status: 'Pending' })
            .populate({ path: 'driverId', select: 'name email phone' })
            .sort({ createdAt: -1 })
            .lean();
    }

    static async getApprovedVehicles() {
        return await DriverVehicle.find({ status: 'Approved' })
            .populate({ path: 'driverId', select: 'name email phone' })
            .sort({ createdAt: -1 })
            .lean();
    }

    static async getRejectedVehicles() {
        return await DriverVehicle.find({ status: 'Rejected' })
            .populate({ path: 'driverId', select: 'name email phone' })
            .sort({ createdAt: -1 })
            .lean();
    }

    static async adminApproveVehicle(vehicleId, adminId, ipAddress, remarks = '', io) {
        const vehicle = await DriverVehicle.findById(vehicleId);
        if (!vehicle) throw new Error('Vehicle not found');

        const previousStatus = vehicle.status;
        vehicle.status = 'Approved';
        if (remarks) vehicle.metadata = { ...vehicle.metadata, remarks };
        await vehicle.save();

        // Audit Logging
        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'APPROVE_VEHICLE',
            targetType: 'DriverVehicle',
            targetId: vehicle._id,
            details: {
                driverId: vehicle.driverId,
                previousStatus,
                newStatus: 'Approved',
                remarks
            },
            ipAddress
        });

        if (io) {
            io.to(`driver_${vehicle.driverId}`).emit('driverVehicleUpdated', { driverId: vehicle.driverId, vehicleId: vehicle._id, status: 'Approved' });
            io.to('admin_global').emit('admin_dashboard_update');
        }

        return vehicle;
    }

    static async adminRejectVehicle(vehicleId, adminId, reason, ipAddress, io) {
        const vehicle = await DriverVehicle.findById(vehicleId);
        if (!vehicle) throw new Error('Vehicle not found');

        const previousStatus = vehicle.status;
        vehicle.status = 'Rejected';
        vehicle.metadata = { ...vehicle.metadata, rejectionReason: reason };
        await vehicle.save();

        // Audit Logging
        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'REJECT_VEHICLE',
            targetType: 'DriverVehicle',
            targetId: vehicle._id,
            details: {
                driverId: vehicle.driverId,
                previousStatus,
                newStatus: 'Rejected',
                remarks: reason
            },
            ipAddress
        });

        if (io) {
            io.to(`driver_${vehicle.driverId}`).emit('driverVehicleUpdated', { driverId: vehicle.driverId, vehicleId: vehicle._id, status: 'Rejected', reason });
            io.to('admin_global').emit('admin_dashboard_update');
        }

        return vehicle;
    }

    static async getDriverVehicles(driverId) {
        return await DriverVehicle.find({ driverId }).sort({ createdAt: -1 }).lean();
    }
}

module.exports = DriverVehicleService;
