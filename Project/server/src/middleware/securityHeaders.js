const helmet = require('helmet');

const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://maps.googleapis.com"],
            connectSrc: ["'self'", "wss:", "ws:"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    frameguard: {
        action: 'deny'
    },
    hidePoweredBy: true,
    noSniff: true,
    xssFilter: true,
    referrerPolicy: {
        policy: 'strict-origin-when-cross-origin'
    },
    permittedCrossDomainPolicies: {
        permittedPolicies: 'none'
    },
    crossOriginEmbedderPolicy: false, // sometimes breaks images if true without proper setup
    crossOriginResourcePolicy: { policy: "cross-origin" }
});

module.exports = securityHeaders;
