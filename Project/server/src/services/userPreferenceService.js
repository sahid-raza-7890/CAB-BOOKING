const UserPreference = require('../models/UserPreference');
const notificationService = require('./notificationService');

const _getOrCreatePreferences = async (userId) => {
    let prefs = await UserPreference.findOne({ userId });
    if (!prefs) {
        try {
            prefs = await UserPreference.create({ userId });
        } catch (err) {
            if (err.code === 11000) {
                // Handled concurrent creation race condition
                prefs = await UserPreference.findOne({ userId });
            } else {
                throw err;
            }
        }
    }
    return prefs;
};

const _emitAndNotify = async (userId, io, prefs, notificationPayload = null) => {
    if (io) {
        io.emit(`preferencesUpdated_${userId}`, { data: prefs });
    }
    if (notificationPayload) {
        await notificationService.createNotification(userId, notificationPayload.title, notificationPayload.message, 'SYSTEM', io);
    }
};

const getPreferences = async (userId) => {
    return await _getOrCreatePreferences(userId);
};

const updatePreferences = async (userId, data, io) => {
    // Only allow updating specific root level fields that don't need special validation
    // E.g. devicePreferences
    const prefs = await _getOrCreatePreferences(userId);
    if (data.devicePreferences !== undefined) {
        prefs.devicePreferences = { ...prefs.devicePreferences, ...data.devicePreferences };
    }
    await prefs.save();
    await _emitAndNotify(userId, io, prefs);
    return prefs;
};

const updateNotifications = async (userId, data, io) => {
    const prefs = await _getOrCreatePreferences(userId);
    prefs.notificationPreferences = { ...prefs.notificationPreferences, ...data };
    await prefs.save();
    await _emitAndNotify(userId, io, prefs);
    return prefs;
};

const updatePrivacy = async (userId, data, io) => {
    const prefs = await _getOrCreatePreferences(userId);
    prefs.privacy = { ...prefs.privacy, ...data };
    await prefs.save();
    await _emitAndNotify(userId, io, prefs);
    return prefs;
};

const updateRidePreferences = async (userId, data, io) => {
    const prefs = await _getOrCreatePreferences(userId);
    prefs.ridePreferences = { ...prefs.ridePreferences, ...data };
    await prefs.save();
    await _emitAndNotify(userId, io, prefs);
    return prefs;
};

const updateTheme = async (userId, theme, io) => {
    if (!['System', 'Dark', 'Light'].includes(theme)) {
        throw new Error('Invalid theme');
    }
    const prefs = await _getOrCreatePreferences(userId);
    if (prefs.theme !== theme) {
        prefs.theme = theme;
        await prefs.save();
        await _emitAndNotify(userId, io, prefs, {
            title: 'Theme Updated',
            message: `Your theme has been set to ${theme}`
        });
    }
    return prefs;
};

const updateLanguage = async (userId, language, io) => {
    if (!['English', 'Hindi', 'Telugu'].includes(language)) {
        throw new Error('Invalid language');
    }
    const prefs = await _getOrCreatePreferences(userId);
    if (prefs.language !== language) {
        prefs.language = language;
        await prefs.save();
        await _emitAndNotify(userId, io, prefs, {
            title: 'Language Updated',
            message: `Your preferred language has been set to ${language}`
        });
    }
    return prefs;
};

const updateSecurity = async (userId, data, io) => {
    const prefs = await _getOrCreatePreferences(userId);
    let changed = false;
    
    if (data.biometricEnabled !== undefined && prefs.security.biometricEnabled !== data.biometricEnabled) {
        prefs.security.biometricEnabled = data.biometricEnabled;
        changed = true;
    }
    if (data.twoFactorEnabled !== undefined && prefs.security.twoFactorEnabled !== data.twoFactorEnabled) {
        prefs.security.twoFactorEnabled = data.twoFactorEnabled;
        changed = true;
    }

    if (changed) {
        await prefs.save();
        await _emitAndNotify(userId, io, prefs, {
            title: 'Security Settings Updated',
            message: 'Your account security preferences have been updated.'
        });
    }
    return prefs;
};

const resetPreferences = async (userId, io) => {
    await UserPreference.findOneAndDelete({ userId });
    const newPrefs = await _getOrCreatePreferences(userId);
    await _emitAndNotify(userId, io, newPrefs, {
        title: 'Preferences Reset',
        message: 'Your settings have been reset to default values.'
    });
    return newPrefs;
};

module.exports = {
    getPreferences,
    updatePreferences,
    updateNotifications,
    updatePrivacy,
    updateRidePreferences,
    updateTheme,
    updateLanguage,
    updateSecurity,
    resetPreferences
};
