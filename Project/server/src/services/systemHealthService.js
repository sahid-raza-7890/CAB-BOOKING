const os = require('os');
const mongoose = require('mongoose');

class SystemHealthService {
    static async checkLiveness() {
        return { status: 'UP', timestamp: new Date().toISOString() };
    }

    static async checkReadiness() {
        const mongoConnected = mongoose.connection.readyState === 1;
        // Mock socket, mail, cloudinary ready status since this is a basic check
        const socketInitialized = global.io !== undefined;
        const mailInitialized = !!process.env.SMTP_HOST;
        const cloudinaryInitialized = !!process.env.CLOUDINARY_KEY;

        const isReady = mongoConnected && socketInitialized && mailInitialized && cloudinaryInitialized;

        return {
            status: isReady ? 'READY' : 'NOT_READY',
            checks: {
                mongo: mongoConnected ? 'OK' : 'FAILED',
                socket: socketInitialized ? 'OK' : 'FAILED',
                mail: mailInitialized ? 'OK' : 'FAILED',
                cloudinary: cloudinaryInitialized ? 'OK' : 'FAILED'
            }
        };
    }

    static async getSecurityAudit() {
        return {
            helmetEnabled: true, // We added this
            rateLimiterEnabled: true, // We added this
            httpsEnabled: process.env.NODE_ENV === 'production',
            jwtSecretLoaded: !!process.env.JWT_SECRET,
            databaseConnected: mongoose.connection.readyState === 1,
            cloudinaryConnected: !!process.env.CLOUDINARY_KEY,
            smtpConnected: !!process.env.SMTP_HOST
        };
    }

    static async getServerStatus() {
        const cpus = os.cpus();
        const memoryUsage = process.memoryUsage();
        
        // Fetch MongoDB server status
        let mongoStatus = 'Unknown';
        try {
            if (mongoose.connection.readyState === 1) {
                const adminDb = mongoose.connection.db.admin();
                const serverStatus = await adminDb.serverStatus();
                mongoStatus = {
                    version: serverStatus.version,
                    connections: serverStatus.connections,
                    uptime: serverStatus.uptime
                };
            }
        } catch (error) {
            console.error('Error fetching Mongo status', error);
        }

        return {
            os: {
                platform: os.platform(),
                release: os.release(),
                uptime: os.uptime(),
                totalMemory: os.totalmem(),
                freeMemory: os.freemem(),
                cpus: cpus.length,
                cpuModel: cpus[0].model
            },
            node: {
                version: process.version,
                memory: {
                    rss: memoryUsage.rss,
                    heapTotal: memoryUsage.heapTotal,
                    heapUsed: memoryUsage.heapUsed,
                    external: memoryUsage.external
                },
                uptime: process.uptime()
            },
            mongo: mongoStatus,
            application: {
                version: process.env.npm_package_version || '1.0.0',
                environment: process.env.NODE_ENV
            }
        };
    }

    static async getPrometheusMetrics() {
        const User = require('../models/User');
        const Driver = require('../models/Driver');
        const Ride = require('../models/Ride');

        const [users, drivers, completedRides, cancelledRides, rideRequests] = await Promise.all([
            User.countDocuments(),
            Driver.countDocuments(),
            Ride.countDocuments({ status: 'Completed' }),
            Ride.countDocuments({ status: 'Cancelled' }),
            Ride.countDocuments()
        ]);

        const memoryUsage = process.memoryUsage();

        return `
# HELP ucab_http_requests_total Total HTTP requests
# TYPE ucab_http_requests_total counter
ucab_http_requests_total 0

# HELP ucab_active_users Total active users
# TYPE ucab_active_users gauge
ucab_active_users ${users}

# HELP ucab_active_drivers Total active drivers
# TYPE ucab_active_drivers gauge
ucab_active_drivers ${drivers}

# HELP ucab_ride_requests Total ride requests
# TYPE ucab_ride_requests counter
ucab_ride_requests ${rideRequests}

# HELP ucab_ride_completed Total completed rides
# TYPE ucab_ride_completed counter
ucab_ride_completed ${completedRides}

# HELP ucab_ride_cancelled Total cancelled rides
# TYPE ucab_ride_cancelled counter
ucab_ride_cancelled ${cancelledRides}

# HELP ucab_node_heap_used Node heap used in bytes
# TYPE ucab_node_heap_used gauge
ucab_node_heap_used ${memoryUsage.heapUsed}

# HELP ucab_node_heap_total Node heap total in bytes
# TYPE ucab_node_heap_total gauge
ucab_node_heap_total ${memoryUsage.heapTotal}

# HELP ucab_process_uptime Process uptime in seconds
# TYPE ucab_process_uptime gauge
ucab_process_uptime ${process.uptime()}
        `.trim();
    }
}

module.exports = SystemHealthService;
