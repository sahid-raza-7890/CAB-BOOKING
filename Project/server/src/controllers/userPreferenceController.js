const userPreferenceService = require('../services/userPreferenceService');
const ResponseFormatter = require('../utils/responseFormatter');

exports.getPreferences = async (req, res) => {
    const prefs = await userPreferenceService.getPreferences(req.user._id);
    return ResponseFormatter.success(res, prefs, 'Preferences fetched successfully');
};

exports.updatePreferences = async (req, res) => {
    const io = req.app.get('io');
    const prefs = await userPreferenceService.updatePreferences(req.user._id, req.body, io);
    return ResponseFormatter.success(res, prefs, 'Preferences updated successfully');
};

exports.updateTheme = async (req, res) => {
    const io = req.app.get('io');
    const prefs = await userPreferenceService.updateTheme(req.user._id, req.body.theme, io);
    return ResponseFormatter.success(res, prefs, 'Theme updated successfully');
};

exports.updateLanguage = async (req, res) => {
    const io = req.app.get('io');
    const prefs = await userPreferenceService.updateLanguage(req.user._id, req.body.language, io);
    return ResponseFormatter.success(res, prefs, 'Language updated successfully');
};

exports.updateNotifications = async (req, res) => {
    const io = req.app.get('io');
    const prefs = await userPreferenceService.updateNotifications(req.user._id, req.body, io);
    return ResponseFormatter.success(res, prefs, 'Notification preferences updated');
};

exports.updatePrivacy = async (req, res) => {
    const io = req.app.get('io');
    const prefs = await userPreferenceService.updatePrivacy(req.user._id, req.body, io);
    return ResponseFormatter.success(res, prefs, 'Privacy preferences updated');
};

exports.updateRidePreferences = async (req, res) => {
    const io = req.app.get('io');
    const prefs = await userPreferenceService.updateRidePreferences(req.user._id, req.body, io);
    return ResponseFormatter.success(res, prefs, 'Ride preferences updated');
};

exports.updateSecurity = async (req, res) => {
    const io = req.app.get('io');
    const prefs = await userPreferenceService.updateSecurity(req.user._id, req.body, io);
    return ResponseFormatter.success(res, prefs, 'Security preferences updated');
};

exports.resetPreferences = async (req, res) => {
    const io = req.app.get('io');
    const prefs = await userPreferenceService.resetPreferences(req.user._id, io);
    return ResponseFormatter.success(res, prefs, 'Preferences reset to defaults');
};
