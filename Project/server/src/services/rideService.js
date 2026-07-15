const Ride = require('../models/Ride');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const Driver = require('../models/Driver');
const CommunicationService = require('./CommunicationService');
const NotificationService = require('./notificationService');
const DispatchService = require('./dispatchService');

class RideService {
    static async estimateFare(vehicleId, vehicleType, distanceKm = 0) {
        let baseFare = 0, perKmRate = 0;
        if (vehicleId) {
            const vehicle = await Vehicle.findById(vehicleId);
            if (vehicle) { baseFare = vehicle.baseFare; perKmRate = vehicle.perKmRate; }
        } else if (vehicleType) {
            const vehicle = await Vehicle.findOne({ type: vehicleType, isActive: true });
            if (vehicle) { baseFare = vehicle.baseFare; perKmRate = vehicle.perKmRate; }
        }
        const total = baseFare + (perKmRate * distanceKm);
        return { baseFare, perKmRate, total: Math.round(total * 100) / 100 };
    }

    static async getActiveVehicles() {
        return await Vehicle.find({ isActive: true });
    }

    static async createRide(userId, userName, rideData, io) {
        const {
            type = 'Immediate', scheduledTime, rentalDurationHours, pickupLocation,
            dropoffLocation, vehicleId, vehicleType, distanceKm, paymentMethod, notes,
            flightNumber, isGuestBooking, guestName, guestPhone, intermediateStops,
            preferences, intercity, rental, schedule, fareBreakdown
        } = rideData;

        if (!pickupLocation && type !== 'Personal Driver') throw new Error('Pickup location is required.');

        if (type === 'Personal Driver') {
            const userDoc = await User.findById(userId);
            if (!userDoc || !userDoc.registeredVehicles || userDoc.registeredVehicles.length === 0) {
                throw new Error('Personal Driver requires at least one registered vehicle in your profile.');
            }
        }
        
        if (type === 'Scheduled' && !scheduledTime) throw new Error('scheduledTime is required for Scheduled rides.');
        if (type === 'Scheduled' && new Date(scheduledTime) <= new Date()) throw new Error('Scheduled time must be in the future.');

        if (schedule && schedule.scheduled) {
            const pickupDateTime = new Date(`${schedule.pickupDate}T${schedule.pickupTime}`);
            if (pickupDateTime <= new Date()) throw new Error('Scheduled time must be in the future.');
            const existingScheduled = await Ride.findOne({ userId, 'schedule.scheduled': true, status: 'Pending' });
            if (existingScheduled) throw new Error('You already have an active scheduled ride. Please manage it before booking another.');
            schedule.assignmentWindow = new Date(pickupDateTime.getTime() - 30 * 60000);
        }

        if (type === 'Rental' && (!rentalDurationHours || rentalDurationHours < 1)) throw new Error('rentalDurationHours must be at least 1.');

        const { baseFare, perKmRate, total } = await RideService.estimateFare(vehicleId, vehicleType, distanceKm || 0);

        const newRide = new Ride({
            userId, passengerName: userName || 'Passenger', type,
            scheduledTime: type === 'Scheduled' ? new Date(scheduledTime) : undefined,
            rentalDurationHours: type === 'Rental' ? Number(rentalDurationHours) : undefined,
            vehicleId: vehicleId || undefined, vehicleType: vehicleType || 'Basic',
            pickupLocation: pickupLocation || 'Home Location', dropoffLocation: dropoffLocation || '',
            intermediateStops: Array.isArray(intermediateStops) ? intermediateStops : [],
            flightNumber: type === 'Airport Transfer' ? flightNumber : undefined,
            isGuestBooking: Boolean(isGuestBooking), guestName: isGuestBooking ? guestName : undefined, guestPhone: isGuestBooking ? guestPhone : undefined,
            distanceKm: distanceKm || 0, baseFare, perKmRate, fare: total,
            fareBreakdown: fareBreakdown || undefined, paymentMethod: paymentMethod || 'Cash', notes: notes || '',
            preferences: preferences || undefined, intercity: type === 'Inter City' ? intercity : undefined,
            rental: type === 'Rental' ? rental : undefined, schedule: schedule && schedule.scheduled ? schedule : undefined,
            otp: Math.floor(1000 + Math.random() * 9000).toString(),
            status: 'Pending', paymentStatus: 'Unpaid'
        });

        newRide.liveTrackingUrl = CommunicationService.generateLiveTrackingUrl(newRide._id);
        await newRide.save();

        if (!schedule || !schedule.scheduled) {
            if (io) {
                // Delegate to DispatchService instead of broadcasting to all
                DispatchService.createDispatch(newRide, io).catch(err => {
                    console.error("[DispatchService] Error creating dispatch:", err);
                });

            }
        }

        // Emit Passenger Notification
        await NotificationService.createNotification({
            userId,
            title: schedule && schedule.scheduled ? 'Ride Scheduled' : 'Ride Requested',
            description: `Your ride from ${pickupLocation} has been requested.`,
            type: 'RIDE_REQUESTED',
            category: 'Ride',
            icon: 'car',
            actionUrl: `/dashboard/rides/${newRide._id}`
        }, io).catch(err => console.error("Notification Error:", err));

        if (io) {
            io.to('admin_global').emit('admin_activity_update', {
                type: 'ride_start', text: 'New Ride Request', sub: userName || 'Passenger', ago: 'just now'
            });
            io.to('admin_global').emit('admin_dashboard_update');
        }

        return newRide;
    }

    static async getScheduledRides(userId) {
        return await Ride.find({ userId, 'schedule.scheduled': true, status: 'Pending' })
            .sort({ 'schedule.pickupDate': 1, 'schedule.pickupTime': 1 });
    }

    static async rebookRide(userId, rideId, io) {
        const oldRide = await Ride.findOne({ _id: rideId, userId });
        if (!oldRide) throw new Error('Original ride not found');

        const rideData = {
            type: oldRide.type,
            pickupLocation: oldRide.pickupLocation,
            dropoffLocation: oldRide.dropoffLocation,
            vehicleId: oldRide.vehicleId,
            vehicleType: oldRide.vehicleType,
            distanceKm: oldRide.distanceKm,
            paymentMethod: oldRide.paymentMethod,
            intermediateStops: oldRide.intermediateStops,
            preferences: oldRide.preferences
        };

        return await RideService.createRide(userId, oldRide.passengerName, rideData, io);
    }

    static async cancelScheduledRide(userId, rideId) {
        const ride = await Ride.findOne({ _id: rideId, userId });
        if (!ride) throw new Error('Ride not found');
        if (ride.status !== 'Pending' && ride.schedule?.scheduledStatus !== 'Scheduled') throw new Error('Cannot cancel a ride that is already in progress.');
        
        ride.status = 'Cancelled'; ride.cancelReason = 'Cancelled by passenger';
        if (ride.schedule) ride.schedule.scheduledStatus = 'Cancelled';
        await ride.save();
        return ride;
    }

    // â”€â”€â”€ SPRINT 39 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    static async modifyScheduledRide(userId, rideId, updates, io) {
        const ride = await Ride.findOne({ _id: rideId, userId });
        if (!ride) throw new Error('Ride not found');
        if (ride.type !== 'Scheduled' && (!ride.schedule || !ride.schedule.scheduled)) {
            throw new Error('This is not a scheduled ride');
        }
        if (ride.status !== 'Pending') {
            throw new Error('Cannot modify a scheduled ride that has already been dispatched');
        }

        // If they update the time
        if (updates.scheduledTime) {
            const newTime = new Date(updates.scheduledTime);
            if (newTime <= new Date()) throw new Error('Scheduled time must be in the future.');
            ride.scheduledTime = newTime;
            
            // Extract YYYY-MM-DD and HH:MM
            const dateStr = newTime.toISOString().split('T')[0];
            const timeStr = newTime.toTimeString().split(' ')[0].substring(0, 5);
            
            ride.schedule.pickupDate = dateStr;
            ride.schedule.pickupTime = timeStr;
            ride.schedule.assignmentWindow = new Date(newTime.getTime() - 30 * 60000);
        }

        // Apply other safe updates
        if (updates.pickupLocation) ride.pickupLocation = updates.pickupLocation;
        if (updates.dropoffLocation) ride.dropoffLocation = updates.dropoffLocation;
        if (updates.notes !== undefined) ride.notes = updates.notes;
        
        await ride.save();

        if (io) {
            io.to(`passenger_${userId}`).emit('ride_updated', ride);
        }

        return ride;
    }

    static async getActiveRide(userId) {
        return await Ride.findOne({ userId, status: { $in: ['Searching', 'Accepted', 'InProgress'] } })
            .populate('vehicleId').populate('driver').sort({ createdAt: -1 });
    }

    static async getMyRides(userId, queryParams) {
        const { page = 1, limit = 10, status, vehicleType, days, sort = 'newest', search } = queryParams;
        const query = { userId };
        if (status && status !== 'All') {
            if (status === 'Active') {
                query.status = { $in: ['Pending', 'Searching', 'Accepted', 'InProgress'] };
            } else {
                query.status = status;
            }
        }
        if (vehicleType && vehicleType !== 'All') query.vehicleType = vehicleType;
        if (days && days !== 'All') {
            const date = new Date(); date.setDate(date.getDate() - parseInt(days));
            query.createdAt = { $gte: date };
        }
        if (search && search.trim()) {
            const re = new RegExp(search.trim(), 'i');
            query.$or = [
                { pickupLocation: re },
                { dropoffLocation: re }
            ];
        }
        let sortOption = { createdAt: -1 };
        if (sort === 'oldest') sortOption = { createdAt: 1 };
        if (sort === 'fare-high') sortOption = { fare: -1 };
        if (sort === 'fare-low') sortOption = { fare: 1 };

        const maxLimit = Math.min(parseInt(limit) || 10, 50);
        const skip = (parseInt(page) - 1) * maxLimit;

        const rides = await Ride.find(query).populate('vehicleId', 'label emoji baseFare').populate('driver', 'name phone rating avatar')
            .sort(sortOption).skip(skip).limit(maxLimit);
        const total = await Ride.countDocuments(query);
        return { rides, total, pages: Math.ceil(total / maxLimit) };
    }

    static async getAllRides() {
        return await Ride.find({}).populate('vehicleId', 'label emoji').populate('driver', 'name').sort({ createdAt: -1 });
    }

    static async getPendingRides() {
        return await Ride.find({ status: { $in: ['Pending', 'Searching'] } }).populate('userId', 'name email').sort({ createdAt: -1 });
    }

    static async acceptRide(rideId, driverId, io) {
        const ride = await Ride.findByIdAndUpdate(rideId, { status: 'Accepted', driver: driverId }, { new: true }).populate('userId', 'name email');
        if (!ride) throw new Error("Ride not found");
        if (io) io.emit('ride_accepted', ride); // Will broadcast to all, frontend filters by user

        await NotificationService.createNotification({
            userId: ride.userId._id || ride.userId,
            title: 'Ride Accepted',
            description: `A driver has accepted your ride request and is on their way!`,
            type: 'RIDE_ACCEPTED',
            category: 'Ride',
            icon: 'check-circle',
            actionUrl: `/dashboard/rides/${ride._id}`
        }, io).catch(err => console.error("Notification Error:", err));

        if (io) io.to('admin_global').emit('admin_dashboard_update');

        return ride;
    }

    static async assignDriver(rideId, driverId, io) {
        const ride = await Ride.findByIdAndUpdate(rideId, { driver: driverId, status: 'Accepted' }, { new: true });
        if (!ride) throw new Error('Ride not found.');
        if (io) io.emit('rideUpdated', { rideId: ride._id, status: 'Accepted' });
        return ride;
    }

    static async cancelRide(userId, rideId, reason, io) {
        const ride = await Ride.findOne({ _id: rideId, userId });
        if (!ride) throw new Error('Ride not found.');
        if (['Completed', 'Cancelled'].includes(ride.status)) throw new Error(`Ride is already ${ride.status}.`);
        ride.status = 'Cancelled'; ride.cancelledBy = 'User'; ride.cancelReason = reason || 'No reason provided';
        await ride.save();
        if (io) io.emit('rideUpdated', { rideId: ride._id, status: 'Cancelled', source: 'passenger' });

        await NotificationService.createNotification({
            userId,
            title: 'Ride Cancelled',
            description: `Your ride has been successfully cancelled.`,
            type: 'RIDE_CANCELLED',
            category: 'Ride',
            icon: 'x-circle',
            actionUrl: `/dashboard/rides/${ride._id}`
        }, io).catch(err => console.error("Notification Error:", err));

        if (io) io.to('admin_global').emit('admin_dashboard_update');

        return ride;
    }

    static async deleteRideAsAdmin(rideId, io) {
        const cancelledRide = await Ride.findByIdAndDelete(rideId);
        if (io) io.emit('rideUpdated');
        return cancelledRide;
    }

    static async getRideDetails(userId, rideId) {
        const ride = await Ride.findOne({ _id: rideId, userId }).populate('vehicleId').populate('driver');
        if (!ride) throw new Error('Ride not found.');
        return ride;
    }

    static async rateRide(userId, rideId, data, io) {
        const { driverRating, vehicleRating, text, suggestions } = data;
        const ride = await Ride.findOne({ _id: rideId, userId });
        if (!ride) throw new Error('Ride not found.');
        if (ride.status !== 'Completed') throw new Error('Can only rate completed rides.');
        if (ride.rating && ride.rating.submittedAt) {
            const err = new Error('Ride already rated.');
            err.name = 'ConflictError';
            err.statusCode = 409;
            throw err;
        }

        ride.rating = { driver: driverRating, vehicle: vehicleRating, text, suggestions, submittedAt: new Date() };
        await ride.save();

        if (ride.driver) {
            const driver = await Driver.findById(ride.driver);
            if (driver) {
                const newCount = (driver.ratingCount || 0) + 1;
                const newRating = (((driver.rating || 0) * (driver.ratingCount || 0)) + driverRating) / newCount;
                driver.rating = newRating; driver.ratingCount = newCount;
                await driver.save();
            }
        }
        if (io) io.emit('rideUpdated', { rideId: ride._id, status: 'Rated', source: 'passenger' });
        return ride;
    }

    static async startRide(rideId, otp, io) {
        const ride = await Ride.findById(rideId);
        if (!ride) throw new Error('Ride not found.');
        if (ride.otp !== otp) throw new Error('Invalid OTP. Cannot start ride.');
        ride.status = 'InProgress';
        await ride.save();
        if (io) io.emit('rideUpdated', { rideId: ride._id, status: 'InProgress' });

        await NotificationService.createNotification({
            userId: ride.userId,
            title: 'Ride Started',
            description: `Your ride is now in progress. Enjoy your trip!`,
            type: 'RIDE_STARTED',
            category: 'Ride',
            icon: 'map',
            actionUrl: `/dashboard/active-ride`
        }, io).catch(err => console.error("Notification Error:", err));

        if (io) io.to('admin_global').emit('admin_dashboard_update');

        return ride;
    }

    static async completeRide(rideId, io) {
        const ride = await Ride.findById(rideId);
        if (!ride) throw new Error('Ride not found.');
        
        // Idempotency check: if already completed, return it immediately to prevent duplicate pipeline execution.
        if (ride.status === 'Completed') {
            return ride;
        }
        if (['Cancelled'].includes(ride.status)) {
            throw new Error(`Cannot complete a ${ride.status} ride.`);
        }
        
        // 1. Update Ride -> Completed
        ride.status = 'Completed';
        await ride.save();

        // 2. Dynamically load services to prevent circular dependencies
        const TripHistoryService = require('./tripHistoryService');
        const WalletService = require('./walletService');
        const DriverEarningService = require('./driverEarningService');
        const SafetyAlert = require('../models/SafetyAlert');

        try {
            // 3. Generate Invoice
            const invoice = await TripHistoryService.generateInvoice(ride._id, ride.userId);

            // 4. Process Payment (Wallet deduction if applicable)
            if (ride.paymentMethod === 'Wallet' && invoice.walletUsed > 0) {
                await WalletService.debit(
                    ride.userId, 
                    'Passenger', 
                    invoice.walletUsed, 
                    'RidePayment', 
                    { rideId: ride._id, invoiceId: invoice._id }
                ).catch(err => console.error("Wallet Debit Error:", err));
            }

            // 5. Driver Earnings (Credit driver)
            if (ride.driver) {
                // Normalize Ride.type → DriverEarning.rideType enum
                // DriverEarning only accepts: 'City', 'Inter City', 'Rental', 'Scheduled', 'Airport'
                const rideTypeMap = {
                    'Immediate':        'City',
                    'Scheduled':        'Scheduled',
                    'Rental':           'Rental',
                    'Airport Transfer': 'Airport',
                    'Inter City':       'Inter City',
                    'Personal Driver':  'City',  // fallback
                };
                const normalizedRideType = rideTypeMap[ride.type] || 'City';
                await DriverEarningService.processRideEarning(
                    ride.driver,
                    ride._id,
                    ride.fare,
                    0, // tip
                    normalizedRideType,
                    ride.paymentMethod
                ).catch(err => console.error("Driver Earning Error:", err));
            }

            // 6. Notification Service
            await NotificationService.createNotification({
                userId: ride.userId,
                title: 'Ride Completed',
                description: `Your ride has reached its destination. Tap to view invoice and rate your trip.`,
                type: 'RIDE_COMPLETED',
                category: 'Ride',
                icon: 'check-circle',
                actionUrl: `/dashboard/my-rides`
            }, io).catch(err => console.error("Notification Error:", err));

            // 7. Safety session closed
            // Resolve any active safety alerts for this ride automatically upon normal completion.
            await SafetyAlert.updateMany(
                { rideId: ride._id, status: 'Active' },
                { $set: { status: 'Resolved' } }
            ).catch(err => console.error("Safety Resolution Error:", err));

            // 8. Qualify Referrals (if this ride satisfies a pending referral)
            const ReferralService = require('./referralService');
            await ReferralService.qualifyReferral(ride.userId, io).catch(err => console.error("Referral Qualification Error:", err));

            // 9. Socket.IO events
            if (io) {
                io.emit('rideUpdated', { rideId: ride._id, status: 'Completed', source: 'system' });
                io.to('admin_global').emit('admin_activity_update', {
                    type: 'ride_complete', text: 'Ride Completed', sub: `Fare: â‚¹${ride.fare}`, ago: 'just now'
                });
                io.to('admin_global').emit('admin_dashboard_update');
            }

        } catch (pipelineError) {
            console.error("Ride Completion Pipeline Error:", pipelineError);
            // Even if downstream pipeline fails, the ride is marked completed.
            // Ideally, we'd use a DB transaction here, but for now we log.
        }

        return ride;
    }

    // --- Admin Dashboard Aggregations ---

    static async getAdminDashboardKPIs() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [revenueAgg, statsAgg] = await Promise.all([
            Ride.aggregate([
                { $match: { status: 'Completed', updatedAt: { $gte: today } } },
                { $group: { _id: null, totalRevenue: { $sum: '$fare' } } }
            ]),
            Ride.aggregate([
                { $match: { createdAt: { $gte: today } } },
                { 
                    $group: { 
                        _id: null, 
                        totalTrips: { $sum: 1 },
                        completedTrips: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
                        cancelledTrips: { $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] } }
                    } 
                }
            ])
        ]);

        const revenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;
        const trips = statsAgg.length > 0 ? statsAgg[0].totalTrips : 0;
        const completed = statsAgg.length > 0 ? statsAgg[0].completedTrips : 0;
        const cancelled = statsAgg.length > 0 ? statsAgg[0].cancelledTrips : 0;
        
        // Completion rate of concluded rides (completed / (completed + cancelled))
        const concluded = completed + cancelled;
        const completion = concluded > 0 ? Math.round((completed / concluded) * 100 * 10) / 10 : 100;

        return { revenue, trips, cancelled, completion };
    }

    static async getAdminRevenueAnalytics() {
        // Last 7 days revenue
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const agg = await Ride.aggregate([
            { $match: { status: 'Completed', updatedAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$updatedAt' },
                        month: { $month: '$updatedAt' },
                        day: { $dayOfMonth: '$updatedAt' },
                        dayOfWeek: { $dayOfWeek: '$updatedAt' }
                    },
                    value: { $sum: '$fare' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ]);

        // Map 1=Sun, 2=Mon... to index (0=Mon...6=Sun)
        const daysMap = { 2:'Mon',3:'Tue',4:'Wed',5:'Thu',6:'Fri',7:'Sat',1:'Sun' };
        
        // Ensure 7 days are populated even if empty
        const bars = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(sevenDaysAgo);
            d.setDate(d.getDate() + i);
            const y = d.getFullYear();
            const m = d.getMonth() + 1;
            const day = d.getDate();
            const dow = d.getDay() + 1; // 1-7 (Sun-Sat)

            const found = agg.find(x => x._id.year === y && x._id.month === m && x._id.day === day);
            bars.push({
                label: daysMap[dow],
                value: found ? found.value : 0
            });
        }

        return bars;
    }

    static async getAdminTopCities() {
        // We use pickupLocation and extract a generic "city" string if possible, or just group by pickupLocation
        // For foundation, we simply group by the first token or exact pickupLocation.
        const agg = await Ride.aggregate([
            { $match: { status: 'Completed' } },
            { $group: { _id: '$pickupLocation', rev: { $sum: '$fare' } } },
            { $sort: { rev: -1 } },
            { $limit: 5 }
        ]);

        if (agg.length === 0) return [];
        const maxRev = agg[0].rev;
        
        return agg.map(a => ({
            name: (a._id || 'Unknown City').split(',')[0].trim(),
            rev: a.rev,
            pct: maxRev > 0 ? Math.round((a.rev / maxRev) * 100) : 0
        }));
    }

    static async getAdminRideDistribution() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const agg = await Ride.aggregate([
            { $match: { createdAt: { $gte: today } } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const distribution = {
            Completed: 0,
            Ongoing: 0,
            Cancelled: 0,
            Pending: 0
        };

        agg.forEach(a => {
            if (a._id === 'Completed') distribution.Completed += a.count;
            else if (a._id === 'Cancelled') distribution.Cancelled += a.count;
            else if (['InProgress', 'Accepted'].includes(a._id)) distribution.Ongoing += a.count;
            else distribution.Pending += a.count;
        });

        return distribution;
    }
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    // â”€â”€â”€ ADMIN RIDE MANAGEMENT (Sprint 22) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

    /**
     * Paginated, filtered ride list for Admin Portal.
     * Supports: status, search (passengerName/pickupLocation), date range, sort.
     * Uses lean() for performance. No N+1 queries.
     */
    static async getFilteredRides({ page = 1, limit = 20, status, search, from, to, sort = 'newest' } = {}) {
        const query = {};

        if (status && status !== 'All') {
            if (status === 'Ongoing') {
                query.status = { $in: ['Accepted', 'InProgress', 'Searching'] };
            } else {
                query.status = status;
            }
        }

        if (search && search.trim()) {
            const re = new RegExp(search.trim(), 'i');
            query.$or = [
                { passengerName: re },
                { pickupLocation: re },
                { dropoffLocation: re },
            ];
        }

        if (from || to) {
            query.createdAt = {};
            if (from) query.createdAt.$gte = new Date(from);
            if (to) {
                const toDate = new Date(to);
                toDate.setHours(23, 59, 59, 999);
                query.createdAt.$lte = toDate;
            }
        }

        const sortMap = {
            newest:    { createdAt: -1 },
            oldest:    { createdAt:  1 },
            'fare-high': { fare: -1 },
            'fare-low':  { fare:  1 },
        };
        const sortOption = sortMap[sort] || { createdAt: -1 };

        const maxLimit = Math.min(limit, 100);
        const skip = (page - 1) * maxLimit;

        const [rides, total] = await Promise.all([
            Ride.find(query)
                .populate('userId', 'name email phone')
                .populate('driver', 'name phone rating avatar')
                .populate('vehicleId', 'label emoji type')
                .sort(sortOption)
                .skip(skip)
                .limit(maxLimit)
                .lean(),
            Ride.countDocuments(query),
        ]);

        return {
            rides,
            total,
            page,
            limit: maxLimit,
            pages: Math.ceil(total / maxLimit),
        };
    }

    /**
     * Full ride details for the Admin Drawer â€” includes populated fields and synthesized timeline.
     */
    static async adminGetRideDetails(rideId) {
        const ride = await Ride.findById(rideId)
            .populate('userId', 'name email phone avatar createdAt')
            .populate('driver', 'name phone rating avatar licenseNumber vehicleNumber')
            .populate('vehicleId', 'label emoji type baseFare perKmRate')
            .lean();

        if (!ride) throw new Error('Ride not found');

        // Build a chronological timeline from embedded timestamps + status
        const timeline = RideService._buildTimeline(ride);

        return { ...ride, timeline };
    }

    /**
     * Synthesize a timeline array from the embedded Ride.timeline object + status.
     */
    static _buildTimeline(ride) {
        const events = [];
        const tl = ride.timeline || {};

        if (tl.booking)        events.push({ event: 'Ride Booked',          at: tl.booking,        icon: 'ðŸ“‹' });
        if (tl.driverAssigned) events.push({ event: 'Driver Assigned',       at: tl.driverAssigned, icon: 'ðŸš—' });
        if (tl.driverArrived)  events.push({ event: 'Driver Arrived',        at: tl.driverArrived,  icon: 'ðŸ“' });
        if (tl.rideStarted)    events.push({ event: 'Ride Started',          at: tl.rideStarted,    icon: 'â–¶ï¸' });
        if (tl.rideCompleted)  events.push({ event: 'Ride Completed',        at: tl.rideCompleted,  icon: 'âœ…' });

        // Terminal states that don't have a timeline entry
        if (ride.status === 'Cancelled' && !tl.rideCompleted) {
            events.push({ event: `Ride Cancelled (by ${ride.cancelledBy || 'system'})`, at: ride.updatedAt, icon: 'âŒ', reason: ride.cancelReason });
        }

        return events.sort((a, b) => new Date(a.at) - new Date(b.at));
    }

    /**
     * Admin force-cancel a ride regardless of userId ownership.
     */
    static async adminCancelRide(rideId, reason, adminId, ipAddress, io) {
        const ride = await Ride.findById(rideId);
        if (!ride) throw new Error('Ride not found');
        if (['Completed', 'Cancelled'].includes(ride.status)) {
            throw new Error(`Cannot cancel a ride that is already ${ride.status}`);
        }

        const previousStatus = ride.status;
        ride.status = 'Cancelled';
        ride.cancelledBy = 'Admin';
        ride.cancelReason = reason || 'Cancelled by administrator';
        await ride.save();

        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'CANCEL_RIDE',
            targetType: 'Ride',
            targetId: ride._id,
            details: { reason: ride.cancelReason, previousStatus, newStatus: 'Cancelled' },
            ipAddress
        });

        if (io) {
            io.emit('rideUpdated', { rideId: ride._id, status: 'Cancelled', source: 'admin' });
            io.to('admin_global').emit('admin_activity_update', {
                type: 'ride_cancel', text: 'Ride Cancelled (Admin)', sub: `Ride #${ride._id}`, ago: 'just now'
            });
            io.to('admin_global').emit('admin_dashboard_update');
        }

        return ride;
    }

    /**
     * Admin force-complete â€” reuses the full completeRide pipeline.
     */
    static async adminForceComplete(rideId, adminId, ipAddress, io) {
        const ride = await Ride.findById(rideId);
        if (!ride) throw new Error('Ride not found');
        if (ride.status === 'Completed') return ride;
        if (ride.status === 'Cancelled') throw new Error('Cannot complete a cancelled ride');

        const previousStatus = ride.status;
        const completedRide = await RideService.completeRide(rideId, io);

        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'FORCE_COMPLETE_RIDE',
            targetType: 'Ride',
            targetId: ride._id,
            details: { previousStatus, newStatus: 'Completed' },
            ipAddress
        });

        return completedRide;
    }

    /**
     * Admin assign / reassign driver.
     */
    static async adminAssignDriver(rideId, driverId, adminId, ipAddress, io) {
        const ride = await Ride.findById(rideId);
        if (!ride) throw new Error('Ride not found');
        if (['Completed', 'Cancelled'].includes(ride.status)) {
            throw new Error(`Cannot assign a driver to a ${ride.status} ride`);
        }

        const previousStatus = ride.status;
        const previousDriver = ride.driver;
        ride.driver = driverId;
        if (ride.status === 'Pending' || ride.status === 'Searching') {
            ride.status = 'Accepted';
            if (!ride.timeline) ride.timeline = {};
            ride.timeline.driverAssigned = new Date();
        }
        await ride.save();

        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'ASSIGN_DRIVER',
            targetType: 'Ride',
            targetId: ride._id,
            details: { previousStatus, newStatus: ride.status, previousDriver, newDriver: driverId },
            ipAddress
        });

        if (io) {
            io.emit('rideUpdated', { rideId: ride._id, status: ride.status, source: 'admin' });
            io.to('admin_global').emit('admin_activity_update', {
                type: 'driver_online', text: 'Driver Assigned (Admin)', sub: `Ride #${ride._id}`, ago: 'just now'
            });
            io.to('admin_global').emit('admin_dashboard_update');
        }

        return ride;
    }

    /**
     * Admin trigger refund â€” marks paymentStatus as Refunded.
     * Actual payment gateway reversal handled by Payments team separately.
     */
    static async adminTriggerRefund(rideId, reason, adminId, ipAddress, io) {
        const ride = await Ride.findById(rideId);
        if (!ride) throw new Error('Ride not found');
        if (!['Completed', 'Cancelled'].includes(ride.status)) {
            throw new Error('Refunds can only be triggered for completed or cancelled rides');
        }
        if (ride.paymentStatus === 'Refunded') {
            throw new Error('Ride has already been refunded');
        }

        const previousPaymentStatus = ride.paymentStatus;
        ride.paymentStatus = 'Refunded';
        ride.notes = ride.notes
            ? `${ride.notes} | Refund: ${reason || 'Admin triggered'}`
            : `Refund: ${reason || 'Admin triggered'}`;
        await ride.save();

        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'TRIGGER_REFUND',
            targetType: 'Ride',
            targetId: ride._id,
            details: { reason, previousPaymentStatus, newPaymentStatus: 'Refunded' },
            ipAddress
        });

        if (io) {
            io.emit('rideUpdated', { rideId: ride._id, paymentStatus: 'Refunded', source: 'admin' });
            io.to('admin_global').emit('admin_activity_update', {
                type: 'payment', text: 'Refund Triggered (Admin)', sub: `â‚¹${ride.fare} â€” Ride #${ride._id}`, ago: 'just now'
            });
            io.to('admin_global').emit('admin_dashboard_update');
        }

        return ride;
    }

    // â”€â”€â”€ ADMIN FINANCIAL OPERATIONS (Sprint 26) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    static async getCommissionReport() {
        const Ride = require('../models/Ride');
        return await Ride.aggregate([
            { $match: { status: 'Completed' } },
            {
                $group: {
                    _id: null,
                    totalFare: { $sum: '$fare' },
                    estimatedCommission: { $sum: { $multiply: ['$fare', 0.20] } }, // Flat 20% platform commission
                    count: { $sum: 1 }
                }
            }
        ]);
    }

    // â”€â”€â”€ ADMIN ANALYTICS (Sprint 29) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    static async adminRideAnalytics() {
        const Ride = require('../models/Ride');
        const [statusAgg, distAgg, timeAgg] = await Promise.all([
            Ride.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            Ride.aggregate([
                { $match: { distance: { $exists: true, $ne: null } } },
                { $group: { _id: null, avgDistance: { $avg: '$distance' } } }
            ]),
            Ride.aggregate([
                { $match: { duration: { $exists: true, $ne: null } } },
                { $group: { _id: null, avgDuration: { $avg: '$duration' } } }
            ])
        ]);

        const statuses = {};
        statusAgg.forEach(s => { statuses[s._id] = s.count; });

        return {
            tripsByStatus: statuses,
            averageDistance: distAgg.length > 0 ? (distAgg[0].avgDistance / 1000).toFixed(2) + ' km' : '0 km',
            averageDuration: timeAgg.length > 0 ? Math.round(timeAgg[0].avgDuration / 60) + ' min' : '0 min',
            totalTrips: statusAgg.reduce((acc, curr) => acc + curr.count, 0)
        };
    }

    static async adminHeatmap() {
        const Ride = require('../models/Ride');
        // Fetch recent completed rides for heatmap data (latitude, longitude, weight)
        const recentDate = new Date();
        recentDate.setDate(recentDate.getDate() - 30);
        
        const rides = await Ride.find({ 
            status: 'Completed', 
            createdAt: { $gte: recentDate },
            'pickupCoordinates.lat': { $exists: true },
            'pickupCoordinates.lng': { $exists: true }
        }).select('pickupCoordinates fare').lean();
        
        return rides.map(r => ({
            lat: r.pickupCoordinates.lat,
            lng: r.pickupCoordinates.lng,
            weight: r.fare // Weight by fare or just 1
        }));
    }

    static async adminDemandAnalytics() {
        const Ride = require('../models/Ride');
        // Aggregate rides by hour of the day to find peak hours
        const agg = await Ride.aggregate([
            {
                $group: {
                    _id: { $hour: '$createdAt' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id': 1 } }
        ]);
        
        const peakHours = agg.map(a => ({
            hour: a._id,
            requests: a.count
        }));
        
        return { peakHours };
    }
}

module.exports = RideService;
