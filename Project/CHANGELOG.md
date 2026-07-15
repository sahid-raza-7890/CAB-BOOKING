# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-11
### Added
- **Monolithic Architecture:** Consolidated backend utilizing Node.js/Express.
- **Real-Time WebSockets:** Implemented Socket.io for immediate dispatch and location tracking.
- **Admin Portal (Phase 1-8):** Comprehensive administrative suites including Analytics, Operations, Settings, Finance, and Security.
- **Frontend Suites:** Polished passenger and driver responsive applications utilizing dark glassmorphism design.
- **Ride State Machine:** Strict phase transitions (Pending -> Searching -> Accepted -> InProgress -> Completed) with integrated idempotency protections.
- **Billing Engine:** Robust wallet transaction system, commission deductions, and automated driver settlement routing.
- **Security & Logging:** Helmet, CORS, Rate Limiting, OWASP best practices, centralized Winston logging, and Sentry error monitoring.
- **Documentation Suite:** Deployment, Security, Backup/Recovery, and API References.

### Changed
- Refactored legacy controllers to modern `asyncWrapper` patterns.
- Replaced `||` fallbacks with `??` (nullish coalescing) for robust `0` value handling in review ratings.
- Standardized response formatting via `ResponseFormatter` class.
- Consolidated error handling into a unified global `errorHandler.js` middleware intercepting all HTTP responses.

### Fixed
- Dual-driver race conditions mitigating simultaneous ride acceptance with explicit 409 Conflict mappings.
- Re-use of OTPs prevented on active rides.
- Idempotency guard implemented for `arriveAtPickup` to prevent duplicate state logging.
- Duplicate review submissions now gracefully emit proper 409 Conflict status codes rather than 500 Server Errors.

### Security
- Audited dependency tree.
- Hardened JWT lifecycle management.
- Parameter sanitization implemented for MongoDB query safety.
