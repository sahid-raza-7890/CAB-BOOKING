const Sentry = require('@sentry/node');

const initSentry = (app) => {
    // Only initialize if SENTRY_DSN is provided
    if (process.env.SENTRY_DSN) {
        Sentry.init({
            dsn: process.env.SENTRY_DSN,
            environment: process.env.NODE_ENV || 'development',
            integrations: [
                new Sentry.Integrations.Http({ tracing: true }),
                new Sentry.Integrations.Express({ app }),
            ],
            tracesSampleRate: 1.0,
        });
        
        // RequestHandler creates a separate execution context, so that all
        // transactions/spans/breadcrumbs are isolated across requests
        app.use(Sentry.Handlers.requestHandler());
        app.use(Sentry.Handlers.tracingHandler());
    }
};

const sentryErrorHandler = (app) => {
    if (process.env.SENTRY_DSN) {
        app.use(Sentry.Handlers.errorHandler());
    }
};

module.exports = { initSentry, sentryErrorHandler };
