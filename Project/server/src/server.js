const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const DriverSocketService = require('./services/driverSocketService');
const compression = require('compression');
const validateEnv = require('./config/envValidator');
const logger = require('./config/logger');
const requestLogger = require('./middleware/requestLogger');
const securityHeaders = require('./middleware/securityHeaders');
const systemRoutes = require('./routes/systemRoutes');
const SystemController = require('./controllers/systemController');

// Validate environment variables on boot
validateEnv();

const connectDB = require('./config/database');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const driverRoutes = require('./routes/driverRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const rideRoutes = require('./routes/rideRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const mapRoutes = require('./routes/mapRoutes');
const walletRoutes = require('./routes/walletRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const couponRoutes = require('./routes/couponRoutes');
const offerRoutes = require('./routes/offerRoutes');
const loyaltyRoutes = require('./routes/loyaltyRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const supportRoutes = require('./routes/supportRoutes');
const driverEarningRoutes = require('./routes/driverEarningRoutes');
const driverStatusRoutes = require('./routes/driverStatusRoutes');
const driverRideRoutes = require('./routes/driverRideRoutes');
const driverRideLifecycleRoutes = require('./routes/driverRideLifecycleRoutes');
const driverSettlementRoutes = require('./routes/driverSettlementRoutes');
const driverIncentiveRoutes = require('./routes/driverIncentiveRoutes');
const driverDashboardRoutes = require('./routes/driverDashboardRoutes');
const driverTripHistoryRoutes = require('./routes/driverTripHistoryRoutes');
const driverReviewRoutes = require('./routes/driverReviewRoutes');
const driverDocumentRoutes = require('./routes/driverDocumentRoutes');
const driverVehicleRoutes = require('./routes/driverVehicleRoutes');
const driverAvailabilityRoutes = require('./routes/driverAvailabilityRoutes');
const driverNotificationRoutes = require('./routes/driverNotificationRoutes');
const driverSupportRoutes = require('./routes/driverSupportRoutes');
const driverEmergencyRoutes = require('./routes/driverEmergencyRoutes');
const driverPreferenceRoutes = require('./routes/driverPreferenceRoutes');
const adminEarningRoutes = require('./routes/adminEarningRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const savedPlaceRoutes = require('./routes/savedPlaceRoutes');
const tripHistoryRoutes = require('./routes/tripHistoryRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const safetyRoutes = require('./routes/safetyRoutes');
const referralRoutes = require('./routes/referralRoutes');
const userPreferenceRoutes = require('./routes/userPreferenceRoutes');
const adminDashboardRoutes = require('./routes/adminDashboardRoutes');
const adminRideRoutes      = require('./routes/adminRideRoutes');
const adminDriverRoutes    = require('./routes/adminDriverRoutes');
const adminUserRoutes      = require('./routes/adminUserRoutes');
const adminComplianceRoutes= require('./routes/adminComplianceRoutes');
const adminFinanceRoutes   = require('./routes/adminFinanceRoutes');
const adminPromotionRoutes = require('./routes/adminPromotionRoutes');
const adminSafetyRoutes    = require('./routes/adminSafetyRoutes');

// Sprint 36 Routes
const chatRoutes = require('./routes/chatRoutes');
const receiptRoutes = require('./routes/receiptRoutes');
const rideSharingRoutes = require('./routes/rideSharingRoutes');
const favoriteDriverRoutes = require('./routes/favoriteDriverRoutes');
const passengerDashboardRoutes = require('./routes/passengerDashboardRoutes');
const errorHandler = require('./middleware/errorHandler');
const SchedulerEngine = require('./services/schedulerEngine');

const app = express();
const { initSentry, sentryErrorHandler } = require('./config/sentry');
initSentry(app); // SPRINT 39

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

app.use(securityHeaders);
app.use(compression());
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(requestLogger);

// SPRINT 39: Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health, Readiness, and Metrics Endpoints
app.get('/health', SystemController.getLiveness);
app.get('/ready', SystemController.getReadiness);
app.get('/metrics', SystemController.getMetrics);


// Database Connection
connectDB();

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: process.env.CORS_ORIGIN || '*', methods: ["GET", "POST", "PUT", "DELETE"] } });
app.set('io', io);

// Inject io into request object for all controllers
app.use((req, res, next) => {
    req.io = io;
    next();
});

const connectedUsers = new Map();
io.on('connection', (socket) => {
    socket.on('register', (userId) => {
        connectedUsers.set(userId, socket.id);
        socket.join(`user_${userId}`);
    });
    
    // Admin specific socket registration
    socket.on('register_admin', (userId) => {
        // Ideally verify token/role here. For now, trusting client event for foundation.
        connectedUsers.set(userId, socket.id);
        socket.join('admin_global');
    });

    socket.on('disconnect', () => {
        for (const [userId, socketId] of connectedUsers.entries()) {
            if (socketId === socket.id) {
                connectedUsers.delete(userId);
                break;
            }
        }
    });

    // Chat events
    socket.on('join_ride_chat', (rideId) => {
        socket.join(`ride_chat_${rideId}`);
    });
    
    socket.on('leave_ride_chat', (rideId) => {
        socket.leave(`ride_chat_${rideId}`);
    });

    socket.on('chatMessage', (data) => {
        // data: { rideId, message, senderModel }
        io.to(`ride_chat_${data.rideId}`).emit('chatMessage', data);
    });

    socket.on('chatTyping', (data) => {
        io.to(`ride_chat_${data.rideId}`).emit('chatTyping', data);
    });

    socket.on('chatRead', (data) => {
        io.to(`ride_chat_${data.rideId}`).emit('chatRead', data);
    });
});

// Driver Socket Namespace
const driverIo = io.of('/driver');
// Simple token verification middleware can go here, but for now we assume 
// the client sends a token in auth payload and it's verified.
driverIo.use((socket, next) => {
    // In a real app, verify JWT here and attach socket.user
    // For now, we rely on the client passing userId and role
    const { token, userId, role } = socket.handshake.auth;
    if (role === 'Driver' && userId) {
        socket.user = { userId, role };
        return next();
    }
    next(new Error('Authentication error'));
});
driverIo.use(DriverSocketService.authenticateSocket);
driverIo.on('connection', (socket) => {
    DriverSocketService.handleConnection(driverIo, socket);
});

app.get('/', (req, res) => res.send("Hello! The Ucab sever is running."));

// â”€â”€ NEW MODULARIZED ROUTES â”€â”€
app.use('/', authRoutes); // /register, /login, /register-driver, /login-driver, /api/otp/...
app.use('/api/users', userRoutes);
app.use('/users', (req, res, next) => { req.url = '/all'; next(); }, userRoutes); 
app.use('/api/drivers', driverRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/rides', rideRoutes);
app.use('/request-ride', (req, res, next) => { req.url = '/legacy-request-ride'; next(); }, rideRoutes);
app.use('/cancel-ride', (req, res, next) => { req.url = '/legacy-cancel-ride'; next(); }, rideRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/maps', mapRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/driver/earnings', driverEarningRoutes);
app.use('/api/driver/status', driverStatusRoutes);
app.use('/api/driver/rides', driverRideRoutes);
app.use('/api/driver/active', driverRideLifecycleRoutes);
app.use('/api/driver/settlements', driverSettlementRoutes);
app.use('/api/driver/incentives', driverIncentiveRoutes);
app.use('/api/driver/dashboard', driverDashboardRoutes);
app.use('/api/driver/history', driverTripHistoryRoutes);
app.use('/api/driver/reviews', driverReviewRoutes);
app.use('/api/driver/documents', driverDocumentRoutes);
app.use('/api/driver/vehicles', driverVehicleRoutes);
app.use('/api/driver/availability', driverAvailabilityRoutes);
app.use('/api/driver/notifications', driverNotificationRoutes);
app.use('/api/driver/support', driverSupportRoutes);
app.use('/api/driver/emergency', driverEmergencyRoutes);
app.use('/api/driver/preferences', driverPreferenceRoutes);
app.use('/api/admin/earnings', adminEarningRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/saved-places', savedPlaceRoutes);
app.use('/api/history', tripHistoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/preferences', userPreferenceRoutes);

// Sprint 36 Mounted Routes
app.use('/api/chat', chatRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/ride-sharing', rideSharingRoutes);
app.use('/api/favorites', favoriteDriverRoutes);
app.use('/api/passenger-dashboard', passengerDashboardRoutes);
app.use('/api/lost-items', require('./routes/lostItemRoutes'));
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/rides',     adminRideRoutes);
app.use('/api/admin/drivers',   adminDriverRoutes);
app.use('/api/admin/users',     adminUserRoutes);
app.use('/api/admin/compliance',adminComplianceRoutes);
app.use('/api/admin/finance',   adminFinanceRoutes);
app.use('/api/admin/promotions',adminPromotionRoutes);
app.use('/api/admin/safety',    adminSafetyRoutes);
const adminAnalyticsRoutes = require('./routes/adminAnalyticsRoutes');
app.use('/api/admin/analytics', adminAnalyticsRoutes);
const adminSettingsRoutes = require('./routes/adminSettingsRoutes');
app.use('/api/admin/settings', adminSettingsRoutes);
const adminNotificationRoutes = require('./routes/adminNotificationRoutes');
app.use('/api/admin/notifications', adminNotificationRoutes);
// Roles removed
const adminAuditRoutes = require('./routes/adminAuditRoutes');
app.use('/api/admin/audit', adminAuditRoutes);
const adminOperationsRoutes = require('./routes/adminOperationsRoutes');
app.use('/api/admin/operations', adminOperationsRoutes);
const adminSupportRoutes = require('./routes/adminSupportRoutes');
app.use('/api/admin/support', adminSupportRoutes); // SPRINT 39
app.use('/api/system', systemRoutes);
app.get('/api/settings/public', (req, res, next) => SystemController.getPublicSettings(req, res).catch(next)); // SPRINT 39

// SPRINT 39: Sentry Error Handler
sentryErrorHandler(app);

// Global Error Handler must be LAST
app.use(errorHandler);

const scheduler = new SchedulerEngine(io);
scheduler.start();

server.listen(5000, '0.0.0.0', () => {
    logger.info("Server is running on port 5000 with WebSockets active!");
});

// Graceful Shutdown
const shutdown = (signal) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    
    // Close server first to stop accepting new requests
    server.close(() => {
        logger.info('HTTP server closed.');
        
        // Disconnect Mongoose
        mongoose.connection.close(false).then(() => {
            logger.info('MongoDB connection closed.');
            process.exit(0);
        });
    });

    // Force close after 10 seconds
    setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION! Shutting down...', err);
    server.close(() => {
        process.exit(1);
    });
});
