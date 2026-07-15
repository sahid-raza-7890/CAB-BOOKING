const SafetyAlert = require('../models/SafetyAlert');
const DriverSessionService = require('./driverSessionService');
const NotificationService = require('./notificationService');

class DriverEmergencyService {
    static async triggerSOS(driverId, payload = {}, io) {
        const session = await DriverSessionService.getSession(driverId);
        
        const alert = new SafetyAlert({
            alertOwnerType: 'Driver',
            driverId,
            rideId: session?.currentRideId || null,
            alertType: 'SOS',
            description: payload.description || 'Driver initiated SOS',
            status: 'Active',
            currentLocation: {
                latitude: payload.lat || (session?.currentLocation?.coordinates ? session.currentLocation.coordinates[1] : 0),
                longitude: payload.lng || (session?.currentLocation?.coordinates ? session.currentLocation.coordinates[0] : 0),
                address: payload.address || ''
            }
        });
        await alert.save();

        if (io) {
            io.to(`driver_${driverId}`).emit('driverSOSActivated', {
                event: 'sos:activated',
                data: alert
            });
            // Operations notification
            io.to('admin_operations').emit('emergency_alert', {
                type: 'DRIVER_SOS',
                data: alert
            });
            // Global admin safety update
            io.emit('safetyAlertUpdated');
        }

        return alert;
    }

    static async cancelSOS(driverId, io) {
        const alert = await SafetyAlert.findOneAndUpdate(
            { driverId, alertOwnerType: 'Driver', status: 'Active' },
            { status: 'Cancelled' },
            { new: true, sort: { createdAt: -1 } }
        );
        
        if (alert && io) {
            io.to(`driver_${driverId}`).emit('driverSOSCancelled', {
                event: 'sos:cancelled',
                data: alert
            });
            io.emit('safetyAlertUpdated');
        }
        return alert;
    }

    static async shareLiveLocation(driverId, payload, io) {
        if (payload.lat && payload.lng) {
            await DriverSessionService.updateLocation(driverId, payload.lat, payload.lng);
            
            if (io) {
                // If the driver is sharing location, ops and specific contacts could be listening
                io.to('admin_operations').emit('driver_location_update', { driverId, lat: payload.lat, lng: payload.lng });
            }
        }
        return { success: true };
    }
}

module.exports = DriverEmergencyService;
