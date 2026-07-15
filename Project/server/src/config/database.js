const mongoose = require('mongoose');
const logger = require('./logger');
const dns = require('dns');

// Use Google's public DNS servers to bypass ISP blocks on MongoDB SRV queries
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
    // Ignore if setServers fails
}

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            logger.error('MONGO_URI is missing from environment variables');
            process.exit(1);
        }

        mongoose.connection.on('connected', () => {
            logger.info('MongoDB Atlas Connected');
        });

        mongoose.connection.on('error', (err) => {
            logger.error('Database Error', err);
        });

        mongoose.connection.on('disconnected', () => {
            logger.info('Database Disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            logger.info('Database Reconnected');
        });

        // Connection Options for Atlas
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            retryWrites: true,
            w: 'majority',
            appName: 'UCAB',
            autoIndex: process.env.NODE_ENV === 'development',
        });

        logger.info('Database Ready');
        return conn;
    } catch (err) {
        logger.error('Database Connection Error', err);
        process.exit(1);
    }
};

module.exports = connectDB;
