const MapService = require('../services/mapService');
const ResponseFormatter = require('../utils/responseFormatter');
const { validatePickup } = require('../utils/geoUtils');

// Rate Limiting Bucket
const REQUEST_LOG = new Map();
const MIN_GAP_MS = 200;

function isThrottled(ip) {
    const last = REQUEST_LOG.get(ip) || 0;
    const now = Date.now();
    if (now - last < MIN_GAP_MS) return true;
    REQUEST_LOG.set(ip, now);
    return false;
}

class MapController {
    static async autocomplete(req, res) {
        const { input, session } = req.query;
        const ip = req.ip;

        if (!input || input.trim().length < 2) {
            return ResponseFormatter.error(res, 'Input must be at least 2 characters.', 'VALIDATION_ERROR', {}, 400);
        }

        try {
            const suggestions = await MapService.googleAutocomplete(input.trim(), session);
            return ResponseFormatter.success(res, { suggestions });
        } catch (err) {
            console.error('Autocomplete error:', err.message);
            return ResponseFormatter.error(res, 'Location search temporarily unavailable.', 'SERVICE_ERROR', {}, 500);
        }
    }

    static async reverseGeocode(req, res) {
        const { lat, lon } = req.body;
        if (lat == null || lon == null) return ResponseFormatter.error(res, 'lat and lon are required.', 'VALIDATION_ERROR', {}, 400);
        if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return ResponseFormatter.error(res, 'Invalid coordinates.', 'VALIDATION_ERROR', {}, 400);

        try {
            const result = await MapService.reverseGeocode(lat, lon);
            return ResponseFormatter.success(res, result);
        } catch (err) {
            console.error('Reverse geocode error:', err.message);
            return ResponseFormatter.error(res, 'Could not resolve coordinates to an address.', 'SERVICE_ERROR', {}, 500);
        }
    }

    static async validatePickup(req, res) {
        const { lat, lon } = req.body;
        if (lat == null || lon == null) return ResponseFormatter.error(res, 'lat and lon are required.', 'VALIDATION_ERROR', {}, 400);
        try {
            const result = validatePickup(lat, lon);
            return ResponseFormatter.success(res, result);
        } catch (err) {
            console.error('Validate pickup error:', err.message);
            return ResponseFormatter.error(res, 'Validation failed.', 'SERVICE_ERROR', {}, 500);
        }
    }

    static async provider(req, res) {
        return ResponseFormatter.success(res, {
            provider: 'google',
            label: 'Google Places API',
            keyConfigured: MapService.isGoogleEnabled(),
            googleKey: MapService.getGoogleKey(),
        });
    }

    static async calculateDistance(req, res) {
        const { pickup, dropoff } = req.body;
        try {
            const distanceInKm = await MapService.calculateDistance(pickup, dropoff);
            return ResponseFormatter.success(res, { distance: distanceInKm });
        } catch (err) {
            if (err.message.includes('maximum capacity')) {
                return ResponseFormatter.error(res, err.message, 'RATE_LIMIT', {}, 429);
            }
            return ResponseFormatter.error(res, err.message || 'Failed to connect to routing servers', 'SERVICE_ERROR', {}, 500);
        }
    }
}

module.exports = MapController;
