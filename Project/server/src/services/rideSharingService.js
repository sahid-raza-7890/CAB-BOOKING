const crypto = require('crypto');
const Ride = require('../models/Ride');
const ErrorResponse = require('../utils/errorResponse');

class RideSharingService {
  /**
   * Generate a secure tracking token for a ride
   */
  async generateTrackingLink(rideId, userId) {
    const ride = await Ride.findById(rideId);
    if (!ride) {
      throw new ErrorResponse('Ride not found', 404);
    }

    if (ride.passenger.toString() !== userId.toString()) {
      throw new ErrorResponse('Not authorized to share this ride', 403);
    }

    // Generate a secure token
    const token = crypto.randomBytes(20).toString('hex');
    
    // Set token and expiration (e.g., 24 hours from now or ride end time)
    ride.sharingToken = token;
    ride.sharingExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    await ride.save();

    const link = `/track/${token}`;
    return { link, token, expiresAt: ride.sharingExpiresAt };
  }

  /**
   * Get ride by tracking token
   */
  async getRideByToken(token) {
    const ride = await Ride.findOne({
      sharingToken: token,
      sharingExpiresAt: { $gt: Date.now() }
    }).populate('driver', 'firstName lastName avatar rating vehicle')
      .populate('vehicle');

    if (!ride) {
      throw new ErrorResponse('Tracking link is invalid or expired', 404);
    }

    return ride;
  }
}

module.exports = new RideSharingService();
