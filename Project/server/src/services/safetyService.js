const SafetyAlert = require('../models/SafetyAlert');
const Ride = require('../models/Ride');
const User = require('../models/User');
const NotificationService = require('./notificationService');

class SafetyService {

    /**
     * Helper to validate ride ownership and active status
     */
    static async validateRideOwnership(rideId, userId) {
        const ride = await Ride.findOne({ _id: rideId, userId });
        if (!ride) throw new Error("Ride not found or unauthorized.");
        
        // Active ride could mean accepted, in progress, etc. But definitely not completed/cancelled.
        const activeStatuses = ['Searching', 'Accepted', 'InProgress'];
        if (!activeStatuses.includes(ride.status)) {
            throw new Error(`Cannot trigger safety alert for a ride that is ${ride.status}.`);
        }
        
        return ride;
    }

    /**
     * Trigger a new safety alert (SOS or other)
     */
    static async createAlert(userId, payload, io) {
        const { rideId, alertType, description, currentLocation } = payload;
        
        const ride = await SafetyService.validateRideOwnership(rideId, userId);

        const newAlert = new SafetyAlert({
            rideId,
            userId,
            driverId: ride.driver,
            alertType,
            description,
            currentLocation
        });

        await newAlert.save();

        if (io) {
            io.emit('safetyAlertCreated', newAlert);
            
            // Send passenger notification
            await NotificationService.createNotification({
                userId,
                title: 'Safety Alert Triggered',
                description: `Your ${alertType} alert has been registered. Our safety team is monitoring.`,
                type: 'SAFETY_ALERT',
                category: 'System',
                icon: 'shield-halved',
                actionUrl: `/dashboard/safety`
            }, io).catch(err => console.error(err));

            // Optional: send driver notification if applicable (e.g., if medical, maybe let them know)
            // Or notify admin/operations team. We'll skip driver notification for pure SOS for their own safety sometimes.
            if (['Medical', 'Accident', 'VehicleIssue'].includes(alertType) && ride.driver) {
                await NotificationService.createNotification({
                    userId: ride.driver,
                    title: 'Passenger Emergency',
                    description: `Your passenger triggered a ${alertType} alert. Please safely pull over if necessary.`,
                    type: 'SAFETY_ALERT',
                    category: 'System',
                    icon: 'triangle-exclamation'
                }, io).catch(err => console.error(err));
            }
        }

        // Attempt to notify emergency contacts automatically
        await SafetyService.notifyEmergencyContacts(userId, newAlert);

        return newAlert;
    }

    /**
     * Cancel an active alert
     */
    static async cancelAlert(alertId, userId, io) {
        const alert = await SafetyAlert.findOne({ _id: alertId, userId });
        if (!alert) throw new Error("Alert not found or unauthorized.");
        if (['Resolved', 'Cancelled'].includes(alert.status)) {
            throw new Error(`Alert is already ${alert.status}.`);
        }

        alert.status = 'Cancelled';
        await alert.save();

        if (io) io.emit('safetyAlertUpdated', alert);
        return alert;
    }

    /**
     * Resolve an alert (usually done by passenger or admin)
     */
    static async resolveAlert(alertId, userId, io) {
        const alert = await SafetyAlert.findOne({ _id: alertId, userId });
        if (!alert) throw new Error("Alert not found or unauthorized.");
        
        alert.status = 'Resolved';
        await alert.save();

        if (io) io.emit('safetyAlertUpdated', alert);
        return alert;
    }

    /**
     * Get passenger's safety alerts
     */
    static async getAlerts(userId) {
        return await SafetyAlert.find({ userId })
            .populate('rideId', 'pickupLocation dropoffLocation fare')
            .sort({ createdAt: -1 });
    }

    /**
     * Get single alert
     */
    static async getAlert(alertId, userId) {
        const alert = await SafetyAlert.findOne({ _id: alertId, userId }).populate('rideId');
        if (!alert) throw new Error("Alert not found.");
        return alert;
    }

    /**
     * Share live ride (simulated sending link)
     */
    static async shareLiveRide(rideId, userId, payload) {
        const ride = await SafetyService.validateRideOwnership(rideId, userId);
        const { contacts } = payload;
        
        // Simulate sending SMS/Email with the tracking link
        const trackingUrl = ride.liveTrackingUrl || `http://ucab.com/track/${ride._id}`;
        
        return {
            success: true,
            message: `Live ride shared with ${contacts.length} contacts.`,
            trackingUrl
        };
    }

    /**
     * Fallback to send direct emergency notification to contacts
     */
    static async sendEmergencyNotification(userId, payload) {
        // Direct non-ride emergency or manual trigger
        // This simulates a manual SMS/Push to contacts
        return { success: true, message: 'Emergency notification sent successfully.' };
    }

    /**
     * Background routine to text/email configured emergency contacts
     */
    static async notifyEmergencyContacts(userId, alert) {
        try {
            const user = await User.findById(userId);
            if (!user) return;
            // Simulated contact notifying logic
            // E.g., user.emergencyContacts.forEach(contact => sendSMS(contact.phone, ...))
            
            // Mark contacts as notified on the alert
            alert.contactsNotified = ['Contact 1', 'Contact 2']; 
            await alert.save();
        } catch (e) {
            console.error("Failed to notify contacts", e);
        }
    }

    // --- Admin Dashboard Aggregations ---
    static async getAdminRecentAlerts() {
        const alerts = await SafetyAlert.find()
            .sort({ createdAt: -1 })
            .limit(4)
            .populate('userId', 'name')
            .populate('driverId', 'name')
            .lean();

        return alerts.map(a => {
            const now = Date.now();
            const created = new Date(a.createdAt).getTime();
            const diffMin = Math.floor((now - created) / 60000);
            
            return {
                loc: a.currentLocation || 'Unknown Location',
                ago: diffMin < 60 ? `${diffMin} min ago` : `${Math.floor(diffMin/60)} hr ago`,
                passenger: a.userId ? a.userId.name : 'Unknown',
                driver: a.driverId ? a.driverId.name : 'Unassigned'
            };
        });
    }

    // â”€â”€â”€ ADMIN SAFETY OPERATIONS (Sprint 28) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    static async adminGetAlerts() {
        return await SafetyAlert.find()
            .populate('userId', 'name email phone')
            .populate('driverId', 'name email phone')
            .populate('rideId')
            .sort({ createdAt: -1 })
            .lean();
    }

    static async adminGetAlert(id) {
        const alert = await SafetyAlert.findById(id)
            .populate('userId', 'name email phone')
            .populate('driverId', 'name email phone')
            .populate('rideId')
            .lean();
        if (!alert) throw new Error('Safety alert not found');
        return alert;
    }

    static async adminResolveAlert(id, adminId, remarks, ipAddress, io) {
        const alert = await SafetyAlert.findById(id);
        if (!alert) throw new Error('Safety alert not found');

        const previousStatus = alert.status;
        alert.status = 'Resolved';
        alert.metadata = { ...alert.metadata, resolvedBy: adminId, remarks };
        await alert.save();

        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'RESOLVE_SAFETY_ALERT',
            targetType: 'SafetyAlert',
            targetId: alert._id,
            details: { previousStatus, newStatus: 'Resolved', remarks },
            ipAddress
        });

        if (io) {
            io.to('admin_global').emit('admin_dashboard_update');
            io.emit('safetyAlertUpdated', alert);
        }

        return alert;
    }

    static async adminEscalateAlert(id, adminId, remarks, ipAddress, io) {
        const alert = await SafetyAlert.findById(id);
        if (!alert) throw new Error('Safety alert not found');

        const previousStatus = alert.status;
        alert.status = 'Acknowledged';
        alert.metadata = { ...alert.metadata, escalated: true, escalatedBy: adminId, remarks };
        await alert.save();

        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'ESCALATE_SAFETY_ALERT',
            targetType: 'SafetyAlert',
            targetId: alert._id,
            details: { previousStatus, newStatus: 'Acknowledged', escalated: true, remarks },
            ipAddress
        });

        if (io) {
            io.to('admin_global').emit('admin_dashboard_update');
            io.emit('safetyAlertUpdated', alert);
        }

        return alert;
    }

    static async adminDismissAlert(id, adminId, remarks, ipAddress, io) {
        const alert = await SafetyAlert.findById(id);
        if (!alert) throw new Error('Safety alert not found');

        const previousStatus = alert.status;
        alert.status = 'Cancelled';
        alert.metadata = { ...alert.metadata, dismissedBy: adminId, remarks };
        await alert.save();

        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'DISMISS_SAFETY_ALERT',
            targetType: 'SafetyAlert',
            targetId: alert._id,
            details: { previousStatus, newStatus: 'Cancelled', remarks },
            ipAddress
        });

        if (io) {
            io.to('admin_global').emit('admin_dashboard_update');
            io.emit('safetyAlertUpdated', alert);
        }

        return alert;
    }

    // â”€â”€â”€ ADMIN ANALYTICS (Sprint 29) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    static async adminSafetyAnalytics() {
        const [typeAgg, statusAgg] = await Promise.all([
            SafetyAlert.aggregate([
                { $group: { _id: '$alertType', count: { $sum: 1 } } }
            ]),
            SafetyAlert.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ])
        ]);

        const types = {};
        typeAgg.forEach(t => { types[t._id] = t.count; });

        const statuses = {};
        statusAgg.forEach(s => { statuses[s._id] = s.count; });

        return {
            alertsByType: types,
            alertsByStatus: statuses,
            totalAlerts: typeAgg.reduce((acc, curr) => acc + curr.count, 0)
        };
    }
    // â”€â”€â”€ SPRINT 39: PASSENGER SAFETY COMPLETION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    /**
     * Get/Update emergency contacts for a passenger (stored on User.trustedContacts)
     */
    static async getEmergencyContacts(userId) {
        const user = await User.findById(userId).select('trustedContacts').lean();
        if (!user) throw new Error('User not found');
        return user.trustedContacts || [];
    }

    static async updateEmergencyContacts(userId, contacts) {
        if (!Array.isArray(contacts)) throw new Error('Contacts must be an array');
        const user = await User.findByIdAndUpdate(
            userId,
            { $set: { trustedContacts: contacts } },
            { new: true }
        ).select('trustedContacts');
        if (!user) throw new Error('User not found');
        return user.trustedContacts;
    }

    /**
     * Safety Timeline: chronological history of all safety events for a user
     */
    static async getSafetyTimeline(userId) {
        const alerts = await SafetyAlert.find({ userId })
            .populate('rideId', 'pickupLocation dropoffLocation fare status')
            .sort({ createdAt: -1 })
            .lean();

        return alerts.map(a => ({
            id: a._id,
            type: a.alertType,
            status: a.status,
            description: a.description,
            location: a.currentLocation,
            contactsNotified: a.contactsNotified,
            ride: a.rideId,
            createdAt: a.createdAt,
            updatedAt: a.updatedAt
        }));
    }

    /**
     * Report an incident (post-ride)
     */
    static async reportIncident(userId, payload, io) {
        const { rideId, incidentType, description, currentLocation } = payload;

        // Incidents can be reported on any ride the user participated in
        const ride = await Ride.findOne({ _id: rideId, userId });
        if (!ride) throw new Error('Ride not found or unauthorized');

        const alert = new SafetyAlert({
            alertOwnerType: 'Passenger',
            rideId,
            userId,
            driverId: ride.driver,
            alertType: incidentType || 'Other',
            description: description || '',
            status: 'Active',
            currentLocation: currentLocation || {},
            metadata: { reportedPostRide: true }
        });
        await alert.save();

        if (io) {
            io.to('admin_global').emit('admin_activity_update', {
                type: 'safety', text: 'Incident Report Filed', sub: `Ride #${rideId}`, ago: 'just now'
            });
        }

        return alert;
    }

    // â”€â”€â”€ SPRINT 39: DRIVER SAFETY COMPLETION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    /**
     * Driver: Report vehicle breakdown
     */
    static async reportBreakdown(driverId, payload, io) {
        const alert = new SafetyAlert({
            alertOwnerType: 'Driver',
            driverId,
            rideId: payload.rideId || null,
            alertType: 'VehicleIssue',
            description: payload.description || 'Vehicle breakdown reported',
            status: 'Active',
            currentLocation: payload.currentLocation || {}
        });
        await alert.save();

        if (io) {
            io.to('admin_operations').emit('emergency_alert', { type: 'BREAKDOWN', data: alert });
        }

        return alert;
    }

    /**
     * Driver: Report incident
     */
    static async driverReportIncident(driverId, payload, io) {
        const alert = new SafetyAlert({
            alertOwnerType: 'Driver',
            driverId,
            rideId: payload.rideId || null,
            alertType: payload.incidentType || 'Accident',
            description: payload.description || '',
            status: 'Active',
            currentLocation: payload.currentLocation || {},
            metadata: { driverReport: true }
        });
        await alert.save();

        if (io) {
            io.to('admin_operations').emit('emergency_alert', { type: 'DRIVER_INCIDENT', data: alert });
        }

        return alert;
    }

    /**
     * Driver: Report unsafe passenger
     */
    static async reportUnsafePassenger(driverId, payload, io) {
        const alert = new SafetyAlert({
            alertOwnerType: 'Driver',
            driverId,
            rideId: payload.rideId || null,
            userId: payload.passengerId || null,
            alertType: 'Harassment',
            description: payload.description || 'Unsafe passenger reported',
            status: 'Active',
            currentLocation: payload.currentLocation || {},
            metadata: { unsafePassengerReport: true }
        });
        await alert.save();

        if (io) {
            io.to('admin_operations').emit('emergency_alert', { type: 'UNSAFE_PASSENGER', data: alert });
        }

        return alert;
    }

    /**
     * Driver: get safety timeline
     */
    static async getDriverSafetyTimeline(driverId) {
        return await SafetyAlert.find({ driverId, alertOwnerType: 'Driver' })
            .sort({ createdAt: -1 })
            .lean();
    }
}

module.exports = SafetyService;
