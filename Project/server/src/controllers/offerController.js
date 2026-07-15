const OfferService = require('../services/offerService');
const Offer = require('../models/Offer');
const ResponseFormatter = require('../utils/responseFormatter');

class OfferController {
    static async getAutoOffers(req, res) {
        const { userId } = req.user;
        const { fare, rideType, vehicleType } = req.query;

        const bestOffer = await OfferService.getBestOffer(
            userId, parseFloat(fare), rideType, vehicleType
        );

        return ResponseFormatter.success(res, { bestOffer });
    }

    static async getActiveOffers(req, res) {
        const offers = await OfferService.getActiveOffers();
        return ResponseFormatter.success(res, { offers });
    }
}

module.exports = OfferController;
