const axios = require('axios');
const ApiTracker = require('../models/ApiTracker');

const GOOGLE_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

class MapService {
    static isGoogleEnabled() {
        return !!GOOGLE_KEY;
    }

    static getGoogleKey() {
        return GOOGLE_KEY;
    }

    static async googleAutocomplete(input, sessionToken) {
        if (!GOOGLE_KEY) return MapService.osmAutocomplete(input);
        const params = new URLSearchParams({ input, key: GOOGLE_KEY, types: 'geocode|establishment' });
        if (sessionToken) params.set('sessiontoken', sessionToken);

        const { data } = await axios.get(`https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`, { timeout: 5000 });
        if (data.status === 'REQUEST_DENIED') return MapService.osmAutocomplete(input);
        if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
            throw new Error(`Google Places: ${data.status} — ${data.error_message || ''}`);
        }

        return (data.predictions || []).map(p => ({
            place_id: p.place_id,
            description: p.description,
            main_text: p.structured_formatting?.main_text || p.description,
            secondary_text: p.structured_formatting?.secondary_text || '',
            provider: 'google',
        }));
    }

    static async osmAutocomplete(input) {
        try {
            const { data } = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}&limit=6`, { 
                headers: { 'User-Agent': 'UCab/1.0' },
                timeout: 5000 
            });
            if (data && Array.isArray(data) && data.length > 0) {
                return data.map(p => {
                    const parts = p.display_name.split(',');
                    return {
                        place_id: p.place_id.toString(),
                        description: p.display_name,
                        main_text: p.name || parts[0].trim(),
                        secondary_text: parts.slice(1).join(',').trim(),
                        lat: parseFloat(p.lat),
                        lon: parseFloat(p.lon),
                        provider: 'osm'
                    };
                });
            }
        } catch (e) {
            console.error('OSM autocomplete error:', e.message);
        }
        return [
            { place_id: 'mock_fallback', description: input, main_text: input, secondary_text: 'Search term', provider: 'fallback' }
        ];
    }

    static async reverseGeocode(lat, lon) {
        try {
            if (GOOGLE_KEY) {
                const { data } = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${GOOGLE_KEY}`, { timeout: 5000 });
                if (data.status !== 'REQUEST_DENIED' && data.results?.[0]) {
                    return { address: data.results[0].formatted_address, place_id: data.results[0].place_id, provider: 'google' };
                }
            }
        } catch(e) {}
        
        try {
            // Fallback to OSM Nominatim
            const { data } = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, { 
                headers: { 'User-Agent': 'UCab/1.0' },
                timeout: 5000 
            });
            if (data && data.display_name) {
                return { address: data.display_name, place_id: data.place_id || 'osm_loc', provider: 'osm' };
            }
        } catch (e) {
            console.error('OSM reverse geocode error:', e.message);
        }

        return { address: `Location near ${lat.toFixed(2)}, ${lon.toFixed(2)}`, place_id: 'mock_loc', provider: 'mock' };
    }

    static async calculateDistance(pickup, dropoff) {
        const date = new Date();
        const currentMonthId = `${date.getFullYear()}-${date.getMonth() + 1}`;

        let tracker = await ApiTracker.findOne({ monthId: currentMonthId });
        if (!tracker) {
            tracker = new ApiTracker({ monthId: currentMonthId, requestCount: 0 });
        }

        const SAFE_LIMIT = 32000;
        if (tracker.requestCount >= SAFE_LIMIT) {
            throw new Error("System is currently at maximum capacity. Please try booking again later.");
        }

        const googleUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(pickup)}&destinations=${encodeURIComponent(dropoff)}&key=${GOOGLE_KEY}`;
        const googleResponse = await axios.get(googleUrl);
        const routeData = googleResponse.data;

        if (routeData.status === 'REQUEST_DENIED') {
            return 5.5; // Mock distance 5.5 km
        }

        if (routeData.status === 'OK' && routeData.rows[0].elements[0].status === 'OK') {
            tracker.requestCount += 1;
            await tracker.save();

            const distanceInMeters = routeData.rows[0].elements[0].distance.value;
            const distanceInKm = Math.round((distanceInMeters / 1000) * 10) / 10;
            return distanceInKm;
        } else {
            throw new Error("Google Maps could not find a driving route.");
        }
    }
}

module.exports = MapService;
