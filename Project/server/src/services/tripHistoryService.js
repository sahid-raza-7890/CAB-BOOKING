const Ride = require('../models/Ride');
const RideInvoice = require('../models/RideInvoice');
const RideService = require('./rideService');
const SupportService = require('./supportService');

class TripHistoryService {
    /**
     * Get passenger's ride history with filters and pagination
     */
    static async getRideHistory(userId, queryParams) {
        // Reuse RideService.getMyRides since it already does exactly this
        return await RideService.getMyRides(userId, queryParams);
    }

    /**
     * Get details for a specific past ride
     */
    static async getRideDetails(rideId, userId) {
        // Reuse RideService.getRideDetails
        return await RideService.getRideDetails(userId, rideId);
    }

    /**
     * Generate or fetch invoice for a completed ride
     */
    static async generateInvoice(rideId, userId) {
        // Validate ownership and status
        const ride = await Ride.findOne({ _id: rideId, userId });
        if (!ride) throw new Error("Ride not found or unauthorized");
        if (ride.status !== 'Completed') throw new Error("Invoices are only available for completed rides.");

        let invoice = await RideInvoice.findOne({ rideId, userId });
        if (invoice) return invoice;

        // Extract and aggregate fare breakdown
        const fare = ride.fareBreakdown || {};
        const base = fare.baseFare || 0;
        const dist = fare.distanceFare || 0;
        const time = fare.timeFare || 0;
        const wait = fare.waitingCharge || 0;
        const plat = fare.platformFee || 0;
        
        const rawTotal = base + dist + time + wait + plat;
        const taxes = fare.taxes || (rawTotal * 0.05); // Assume 5% tax if not specified
        const discounts = ride.discountAmount || fare.coupon || 0;
        const walletUsed = ride.paymentMethod === 'Wallet' ? ride.fare : 0;
        const externalPayment = ride.paymentMethod !== 'Wallet' ? ride.fare : 0;

        const newInvoice = new RideInvoice({
            rideId,
            userId,
            invoiceNumber: `INV-${rideId.toString().substring(16).toUpperCase()}-${Date.now().toString().slice(-4)}`,
            fareBreakdown: {
                baseFare: base,
                distanceFare: dist,
                timeFare: time,
                waitingCharge: wait,
                platformFee: plat,
                total: rawTotal
            },
            taxes: Math.round(taxes * 100) / 100,
            discounts,
            walletUsed,
            externalPayment,
            totalAmount: ride.fare
        });

        await newInvoice.save();
        return newInvoice;
    }

    /**
     * Rebook a past ride
     */
    static async rebookRide(rideId, userId, io) {
        const pastRide = await Ride.findOne({ _id: rideId, userId });
        if (!pastRide) throw new Error("Past ride not found");

        const rideData = {
            type: 'Immediate',
            pickupLocation: pastRide.pickupLocation,
            dropoffLocation: pastRide.dropoffLocation,
            vehicleType: pastRide.vehicleType,
            paymentMethod: 'Cash', // Default to cash for new bookings
            notes: 'Rebooked from previous trip'
        };

        // Reuse RideService core logic to create the new ride
        return await RideService.createRide(userId, pastRide.passengerName, rideData, io);
    }

    /**
     * Attach a support ticket linked to this ride
     */
    static async attachSupportTicket(rideId, userId, payload, io) {
        const ride = await Ride.findOne({ _id: rideId, userId });
        if (!ride) throw new Error("Ride not found");

        // Format ticket payload specifically for this ride context
        const ticketData = {
            subject: payload.subject || `Issue with Ride ${ride._id.toString().substring(16)}`,
            description: payload.description,
            category: payload.category || 'Ride Issue',
            priority: payload.priority || 'Medium',
            metadata: {
                rideId: ride._id,
                driverId: ride.driver,
                pickupLocation: ride.pickupLocation,
                dropoffLocation: ride.dropoffLocation
            }
        };

        // Reuse SupportService to maintain strict module boundaries
        return await SupportService.createTicket(userId, ticketData, io);
    }
}

module.exports = TripHistoryService;
