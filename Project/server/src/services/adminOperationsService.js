const Ride = require('../models/Ride');
const DriverSession = require('../models/DriverSession');
const SafetyAlert = require('../models/SafetyAlert');
const SupportTicket = require('../models/Ticket');
const User = require('../models/User');
const Driver = require('../models/Driver');

class AdminOperationsService {
    // Operations Dashboard
    static async adminOperationsDashboard() {
        const activeRidesCount = await Ride.countDocuments({ status: { $in: ['Accepted', 'Arrived', 'In Progress'] } });
        const waitingPassengersCount = await Ride.countDocuments({ status: 'Pending' });
        const onlineDriversCount = await DriverSession.countDocuments({ status: 'Online' });
        const busyDriversCount = await DriverSession.countDocuments({ status: 'Busy' });
        const offlineDriversCount = await DriverSession.countDocuments({ status: 'Offline' });
        const activeSOSCount = await SafetyAlert.countDocuments({ status: 'Active' });
        const supportQueueCount = await SupportTicket.countDocuments({ status: 'Open' });

        return {
            activeRides: activeRidesCount,
            waitingPassengers: waitingPassengersCount,
            onlineDrivers: onlineDriversCount,
            busyDrivers: busyDriversCount,
            offlineDrivers: offlineDriversCount,
            activeSOS: activeSOSCount,
            supportQueue: supportQueueCount,
            utilization: onlineDriversCount > 0 ? ((busyDriversCount / onlineDriversCount) * 100).toFixed(1) : 0
        };
    }

    // Active Rides Map & List
    static async adminActiveRides() {
        return await Ride.find({ status: { $in: ['Accepted', 'Arrived', 'In Progress'] } })
            .populate('userId', 'name phone')
            .populate('driver', 'name phone vehicleId')
            .sort({ updatedAt: -1 })
            .limit(100);
    }

    static async adminRideMap() {
        const rides = await this.adminActiveRides();
        return rides.map(r => ({
            id: r._id,
            status: r.status,
            pickup: r.pickupLocation,
            dropoff: r.dropoffLocation
        }));
    }

    // Drivers Map & List
    static async adminOnlineDrivers() {
        return await DriverSession.find({ status: { $in: ['Online', 'Busy'] } })
            .populate('driverId', 'name phone')
            .limit(100);
    }

    static async adminDriverLocations() {
        const drivers = await this.adminOnlineDrivers();
        return drivers.map(d => ({
            id: d.driverId?._id,
            status: d.status,
            location: d.currentLocation
        }));
    }

    // Dispatch Queue
    static async adminDispatchQueue() {
        return await Ride.find({ status: 'Pending' })
            .populate('userId', 'name phone')
            .sort({ createdAt: 1 })
            .limit(50);
    }

    static async adminDispatchMetrics() {
        const pendingCount = await Ride.countDocuments({ status: 'Pending' });
        const assignedCount = await Ride.countDocuments({ status: 'Accepted' });
        return { pending: pendingCount, assigned: assignedCount };
    }

    // SOS Alerts
    static async adminLiveSOS() {
        return await SafetyAlert.find({ status: 'Active' })
            .populate('userId', 'name phone')
            .populate('rideId')
            .sort({ createdAt: -1 });
    }

    // Support Queue
    static async adminLiveSupportQueue() {
        return await SupportTicket.find({ status: 'Open' })
            .populate('userId', 'name')
            .sort({ createdAt: 1 })
            .limit(50);
    }

    // Surge Zones
    static async adminSurgeZones() {
        // Mock surge zones for map
        return [
            { id: 1, name: 'Downtown', multiplier: 1.5, center: { lat: 12.9716, lng: 77.5946 }, radius: 2000 },
            { id: 2, name: 'Airport', multiplier: 2.1, center: { lat: 13.1989, lng: 77.7068 }, radius: 3000 }
        ];
    }

    // Passengers
    static async adminWaitingPassengers() {
        return await Ride.find({ status: 'Pending' })
            .populate('userId', 'name phone')
            .limit(50);
    }

    static async adminPassengerMap() {
        const waiting = await this.adminWaitingPassengers();
        return waiting.map(w => ({
            id: w.userId?._id,
            location: w.pickupLocation
        }));
    }

    // System Metrics
    static async adminMetrics() {
        return {
            apiLatency: '45ms',
            dbLatency: '12ms',
            activeSockets: 1245,
            cpuUsage: '34%',
            memoryUsage: '4.2GB'
        };
    }
}

module.exports = AdminOperationsService;
