const SavedPlaceService = require('../services/savedPlaceService');
const ResponseFormatter = require('../utils/responseFormatter');

class SavedPlaceController {
    static async getPlaces(req, res) {
        const userId = req.user.userId || req.user.id;
        const places = await SavedPlaceService.getPlaces(userId);
        return ResponseFormatter.success(res, places);
    }

    static async getRecentPlaces(req, res) {
        const userId = req.user.userId || req.user.id;
        const places = await SavedPlaceService.getRecentPlaces(userId);
        return ResponseFormatter.success(res, places);
    }

    static async createPlace(req, res) {
        const userId = req.user.userId || req.user.id;
        const place = await SavedPlaceService.createPlace(userId, req.body, req.io);
        return ResponseFormatter.success(res, place, "Location saved successfully");
    }

    static async updatePlace(req, res) {
        const userId = req.user.userId || req.user.id;
        const place = await SavedPlaceService.updatePlace(req.params.id, userId, req.body, req.io);
        return ResponseFormatter.success(res, place, "Location updated successfully");
    }

    static async deletePlace(req, res) {
        const userId = req.user.userId || req.user.id;
        await SavedPlaceService.deletePlace(req.params.id, userId, req.io);
        return ResponseFormatter.success(res, null, "Location deleted successfully");
    }

    static async setDefault(req, res) {
        const userId = req.user.userId || req.user.id;
        const place = await SavedPlaceService.setDefault(req.params.id, userId, req.io);
        return ResponseFormatter.success(res, place, "Default location set");
    }
}

module.exports = SavedPlaceController;
