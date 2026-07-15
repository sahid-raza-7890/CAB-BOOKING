const Offer = require('../models/Offer');
const OfferRedemption = require('../models/OfferRedemption');

class OfferService {
    static async getActiveOffers() {
        return await Offer.find({ active: true, endDate: { $gte: new Date() } });
    }

    /**
     * Finds the best auto-applicable offer for a given ride
     */
    static async getBestOffer(userId, fare, rideType, vehicleType) {
        // Find all active offers that match ride/vehicle constraints
        const offers = await Offer.find({ 
            active: true,
            startDate: { $lte: new Date() },
            endDate: { $gte: new Date() },
            minFare: { $lte: fare },
            eligibleRideTypes: rideType,
            eligibleVehicleTypes: vehicleType
        });

        if (!offers || offers.length === 0) return null;

        // Note: For targetAudience = 'NewUser', we'd normally check if user has previous rides.
        // Assuming we evaluate all eligible ones and pick the highest discount:

        let bestOffer = null;
        let maxDiscount = 0;

        for (let offer of offers) {
            // Check if user already redeemed this auto-offer
            const used = await OfferRedemption.exists({ offerId: offer._id, userId });
            if (used) continue; // Single use per offer by default

            let discount = 0;
            if (offer.type === 'Flat') {
                discount = offer.value;
            } else if (offer.type === 'Percentage') {
                discount = fare * (offer.value / 100);
                if (offer.maxDiscount && discount > offer.maxDiscount) discount = offer.maxDiscount;
            }

            discount = Math.min(discount, fare);

            if (discount > maxDiscount) {
                maxDiscount = discount;
                bestOffer = offer;
            }
        }

        if (bestOffer) {
            return { discountAmount: maxDiscount, offer: bestOffer };
        }
        
        return null;
    }

    static async redeem(offerId, userId, rideId, discountApplied) {
        const offer = await Offer.findById(offerId);
        if (!offer) throw new Error('Offer not found');

        const redemption = new OfferRedemption({
            userId,
            offerId: offer._id,
            campaignId: offer.campaignId,
            rideId,
            discountApplied
        });
        await redemption.save();
        return redemption;
    }
}

module.exports = OfferService;
