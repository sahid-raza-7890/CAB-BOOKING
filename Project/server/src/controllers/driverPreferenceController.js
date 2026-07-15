const DriverPreferenceService = require('../services/driverPreferenceService');
const ResponseFormatter = require('../utils/responseFormatter');

class DriverPreferenceController {
    static async getPreferences(req, res) {
        const prefs = await DriverPreferenceService.getPreferences(req.user.id);
        return ResponseFormatter.success(res, prefs, 'Preferences retrieved');
    }

    static async updatePreferences(req, res) {
        const prefs = await DriverPreferenceService.updatePreferences(req.user.id, req.body, req.app.get('io'));
        return ResponseFormatter.success(res, prefs, 'Preferences updated');
    }

    static async updateTheme(req, res) {
        const prefs = await DriverPreferenceService.updateTheme(req.user.id, req.body.theme, req.app.get('io'));
        return ResponseFormatter.success(res, prefs, 'Theme updated');
    }

    static async updateLanguage(req, res) {
        const prefs = await DriverPreferenceService.updateLanguage(req.user.id, req.body.language, req.app.get('io'));
        return ResponseFormatter.success(res, prefs, 'Language updated');
    }

    static async updateNotifications(req, res) {
        const prefs = await DriverPreferenceService.updateNotifications(req.user.id, req.body, req.app.get('io'));
        return ResponseFormatter.success(res, prefs, 'Notification preferences updated');
    }

    static async updatePrivacy(req, res) {
        const prefs = await DriverPreferenceService.updatePrivacy(req.user.id, req.body, req.app.get('io'));
        return ResponseFormatter.success(res, prefs, 'Privacy preferences updated');
    }

    static async updateNavigation(req, res) {
        const prefs = await DriverPreferenceService.updateNavigationPreferences(req.user.id, req.body, req.app.get('io'));
        return ResponseFormatter.success(res, prefs, 'Navigation preferences updated');
    }

    static async updateRides(req, res) {
        const prefs = await DriverPreferenceService.updateRidePreferences(req.user.id, req.body, req.app.get('io'));
        return ResponseFormatter.success(res, prefs, 'Ride preferences updated');
    }

    static async updateAvailability(req, res) {
        const prefs = await DriverPreferenceService.updateAvailabilityPreferences(req.user.id, req.body, req.app.get('io'));
        return ResponseFormatter.success(res, prefs, 'Availability preferences updated');
    }

    static async updateSecurity(req, res) {
        const prefs = await DriverPreferenceService.updateSecurity(req.user.id, req.body, req.app.get('io'));
        return ResponseFormatter.success(res, prefs, 'Security preferences updated');
    }

    static async updateMapProvider(req, res) {
        const prefs = await DriverPreferenceService.updateMapProvider(req.user.id, req.body.mapProvider, req.app.get('io'));
        return ResponseFormatter.success(res, prefs, 'Map provider updated');
    }

    static async updateVoiceNavigation(req, res) {
        const prefs = await DriverPreferenceService.updateVoiceNavigation(req.user.id, req.body.voiceNavigation, req.app.get('io'));
        return ResponseFormatter.success(res, prefs, 'Voice navigation updated');
    }

    static async resetPreferences(req, res) {
        const prefs = await DriverPreferenceService.resetPreferences(req.user.id, req.app.get('io'));
        return ResponseFormatter.success(res, prefs, 'Preferences reset to default');
    }
}

module.exports = DriverPreferenceController;
