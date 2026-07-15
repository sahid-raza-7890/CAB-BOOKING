const logger = require('./logger');

const requiredEnvs = [
    'PORT',
    'NODE_ENV',
    'JWT_SECRET',
    'JWT_EXPIRES',
    'COOKIE_SECRET',
    'MONGO_URI',
    'CLIENT_URL',
    'SERVER_URL',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'CLOUDINARY_NAME',
    'CLOUDINARY_KEY',
    'CLOUDINARY_SECRET',
    'GOOGLE_MAPS_API_KEY'
];

// REDIS_URL is optional, so it's not in the required list

const validateEnv = () => {
    let missingEnvs = [];

    requiredEnvs.forEach((env) => {
        if (!process.env[env]) {
            missingEnvs.push(env);
        }
    });

    if (missingEnvs.length > 0) {
        const errorMsg = `[BOOT FATAL] Missing required environment variables: ${missingEnvs.join(', ')}`;
        logger.error(errorMsg);
        console.error(errorMsg);
        process.exit(1); // Fail startup immediately
    }

    logger.info('[BOOT] Environment validation passed.');
};

module.exports = validateEnv;
