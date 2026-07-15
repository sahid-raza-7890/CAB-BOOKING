# UCAB Enterprise

UCAB Enterprise is a real-time, multi-portal ride-hailing platform built for production scale. It unifies a Passenger, Driver, and Admin ecosystem into a single, seamless, WebSockets-driven architecture. 

Currently at **v1.0.1**, this project is feature-complete and production-ready from a software perspective, having successfully passed rigorous integration, regression, and cross-portal synchronization gates.

## 🚀 Ecosystem Overview

The platform consists of three fully integrated React frontends and a robust Node/Express backend:

1. **Passenger Portal**: Allows users to book rides, track drivers via live GPS, manage their wallets, leave reviews, and view their ride history.
2. **Driver Portal**: A real-time dispatch interface for drivers to accept rides, verify OTPs, manage vehicle documents, track earnings, and request wallet withdrawals.
3. **Admin Portal**: A centralized command center for operations teams to monitor live rides, analyze platform revenue, manage users, handle support tickets, and configure platform-wide settings.
4. **Backend Gateway**: A Node.js API adhering strictly to MVC patterns, orchestrating real-time state via Socket.IO, and managing persistence via MongoDB.

## 🏗️ Architecture & Technologies

- **Frontend**: React.js, Vite, Context API, modular CSS.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose).
- **Real-Time Engine**: Socket.IO (with strict listener deduplication & room-based broadcasting).
- **Security**: JWT Authentication, RBAC (Role-Based Access Control), Express Rate Limiter, Helmet, strict CORS.
- **Data Integrity**: Global response normalization, robust array-safety fallbacks, and transactional wallet reconciliations.

## 🛡️ Production Stabilization (v1.0.1)

The current release represents the culmination of intense release-hardening sprints:
- **Zero Duplicate Sockets**: Extensive deduplication of `socket.on()` handlers ensures zero memory leaks during network reconnects.
- **Robust Error Handling**: Frontend heavily gated with `Array.isArray()` checks to prevent `.map()` crashes. All API timeouts and 4xx/5xx errors degrade gracefully with fallback UI.
- **Performance Optimized**: Eradicated infinite `useEffect` renders. Heavy aggregations optimized with `useMemo`.
- **Accessible & Responsive**: Form elements injected with ARIA labels. Layouts hardened with flex-wrapping and hidden overflows for all viewports from 320px to 1920px.

## 🛣️ Roadmap (v1.1)

While v1.0.x is locked for stability and bug fixes, the upcoming v1.1 branch will introduce:
1. **Production Infrastructure**: Kubernetes/Docker Swarm, Redis (caching/Socket.IO adapter), and BullMQ background jobs.
2. **Mobile Apps**: React Native ports for Passenger and Driver with background GPS and push notifications.
3. **Intelligent Dispatch**: Machine-learning driven ETA predictions, surge pricing, and demand forecasting.
4. **Operations**: Grafana/Prometheus telemetry and CI/CD Blue/Green deployments.

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally or via Atlas)
- Razorpay / Stripe API Keys
- Cloudinary API Keys (for document uploads)

### Installation
1. Clone the repository.
2. Navigate to `/server` and run `npm install`. Duplicate `.env.example` to `.env` and fill in secrets. Run `npm run start`.
3. Navigate to `/client` and run `npm install`. Run `npm run dev` to launch the Vite server.
