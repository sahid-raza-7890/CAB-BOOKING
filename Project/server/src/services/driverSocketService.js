const DriverSessionService = require('./driverSessionService');

class DriverSocketService {
    static authenticateSocket(socket, next) {
        // Assume auth logic runs here (JWT verify)
        // Usually, socket.user is populated by a middleware before this.
        if (!socket.user) {
            return next(new Error('Authentication error'));
        }
        if (socket.user.role !== 'Driver') {
            return next(new Error('Only drivers can connect to driver namespaces/events'));
        }
        next();
    }

    static handleConnection(io, socket) {
        const driverId = socket.user.userId; // Usually set by auth middleware
        const driverRoom = `driver_${driverId}`;

        // Join personal room
        socket.join(driverRoom);


        // Handle Heartbeat
        socket.on('driverHeartbeat', async (payload) => {
            try {
                payload.socketId = socket.id;
                await DriverSessionService.heartbeat(driverId, payload);
                // Optionally broadcast location to dispatch systems or active riders
            } catch (err) {
                console.error(`[Socket] Heartbeat error for driver ${driverId}:`, err);
            }
        });

        // Join Dispatch Zone / Geohash
        socket.on('joinDispatchZone', async (zoneId) => {
            socket.join(`zone_${zoneId}`);
            await DriverSessionService.joinDispatchZone(driverId, zoneId);

        });

        // Leave Dispatch Zone
        socket.on('leaveDispatchZone', async (zoneId) => {
            socket.leave(`zone_${zoneId}`);
            await DriverSessionService.leaveDispatchZone(driverId);

        });

        socket.on('disconnect', async () => {

            // We don't immediately go offline on disconnect (might be a temporary network drop).
            // Usually, a background worker checks lastSeen to mark as offline.
            // But we can clear the socketId.
            try {
                const session = await DriverSessionService.getSession(driverId);
                if (session.socketId === socket.id) {
                    session.socketId = null;
                    await session.save();
                }
            } catch (err) {
                console.error(`[Socket] Disconnect error for driver ${driverId}:`, err);
            }
        });
    }

    // Server-side push mechanisms

    static broadcastDispatch(io, zoneId, dispatchPayload) {
        io.to(`zone_${zoneId}`).emit('newRideRequest', dispatchPayload);
    }

    static sendPersonalMessage(io, driverId, event, data) {
        // Ensure we are emitting to the /driver namespace
        const nsp = typeof io.of === 'function' ? io.of('/driver') : io;
        nsp.to(`driver_${driverId}`).emit(event, data);
    }
}

module.exports = DriverSocketService;
