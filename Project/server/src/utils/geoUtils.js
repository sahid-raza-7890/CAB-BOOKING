const loadingZones = require('../data/loadingZones.json');
const venues = require('../data/venues.json');

/**
 * Calculates distance in meters between two lat/lng coordinates
 * using the Haversine formula.
 */
function getDistanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const p1 = lat1 * Math.PI / 180;
    const p2 = lat2 * Math.PI / 180;
    const dp = (lat2 - lat1) * Math.PI / 180;
    const dl = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(dp / 2) * Math.sin(dp / 2) +
              Math.cos(p1) * Math.cos(p2) *
              Math.sin(dl / 2) * Math.sin(dl / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

/**
 * Validates a pickup location against restricted zones.
 * Returns { valid: true, venueId: string? } if allowed.
 * Returns { valid: false, snappedLat, snappedLng, message, venueId: string? } if restricted.
 */
function validatePickup(lat, lng) {
    let result = { valid: true };

    // 1. Check Restricted Zones (Geofencing)
    for (const zone of loadingZones) {
        const dist = getDistanceMeters(lat, lng, zone.restrictedCenter.lat, zone.restrictedCenter.lng);
        
        if (dist <= zone.radiusMeters) {
            // It's in a restricted zone! Snap to the first legal snap point
            const snap = zone.legalSnaps[0];
            result = {
                valid: false,
                snappedLat: snap.lat,
                snappedLng: snap.lng,
                message: `Restricted zone detected (${zone.name}). Snapped to nearest legal loading zone: ${snap.name}.`
            };
            break; // Stop checking other zones once snapped
        }
    }

    // 2. Check Venues (Indoor Mapping Context)
    // We attach venueId if the pin is near a known complex venue
    // (We use the snapped coordinates if it was snapped, otherwise original)
    const checkLat = result.valid ? lat : result.snappedLat;
    const checkLng = result.valid ? lng : result.snappedLng;

    for (const venue of venues) {
        const dist = getDistanceMeters(checkLat, checkLng, venue.center.lat, venue.center.lng);
        if (dist <= venue.radiusMeters) {
            result.venue = {
                id: venue.id,
                name: venue.name,
                floorPlanUrl: venue.floorPlanUrl
            };
            break;
        }
    }

    return result;
}

module.exports = { validatePickup, getDistanceMeters };
