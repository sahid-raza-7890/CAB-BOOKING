const crypto = require('crypto');

class CommunicationService {
    /**
     * Generates a mock VoIP session link to mask actual phone numbers.
     * @param {string} rideId 
     * @param {string} userId 
     * @param {string} driverId 
     * @returns {string} Masked call URL
     */
    static generateMaskedCall(rideId, userId, driverId) {
        // In a real app, this would use Twilio or a similar VoIP provider
        const sessionToken = crypto.randomBytes(16).toString('hex');
        return `https://call.ucab.app/session/${sessionToken}`;
    }

    /**
     * Generates a tokenized live-tracking URL for a ride.
     * @param {string} rideId 
     * @returns {string} Live tracking URL
     */
    static generateLiveTrackingUrl(rideId) {
        const shareToken = crypto.createHash('sha256').update(rideId + process.env.JWT_SECRET).digest('hex').substring(0, 16);
        return `http://localhost:5173/live/${rideId}?t=${shareToken}`;
    }
}

module.exports = CommunicationService;
