const DriverPreference = require('../models/DriverPreference');
const UserPreference = require('../models/UserPreference');
const NotificationService = require('./notificationService');

class DriverPreferenceService {
    static async getPreferences(driverId) {
        let prefs = await DriverPreference.findOne({ driverId });
        
        if (!prefs) {
            // Lazy create
            // Check if UserPreference exists for shared identity language/theme
            const userPrefs = await UserPreference.findOne({ userId: driverId });
            
            const initData = { driverId };
            if (userPrefs) {
                if (userPrefs.language) initData.language = userPrefs.language;
                if (userPrefs.theme) initData.theme = userPrefs.theme;
            }
            
            prefs = new DriverPreference(initData);
            await prefs.save();
        }
        
        return prefs;
    }

    static async updatePreferences(driverId, payload, io) {
        let prefs = await this.getPreferences(driverId);
        
        // This is a generic update, but we prefer granular methods.
        // We'll allow it for bulk updates but restrict top-level overwrites.
        Object.assign(prefs, payload);
        await prefs.save();
        
        this._emitUpdate(driverId, prefs, io);
        return prefs;
    }

    static async updateTheme(driverId, theme, io) {
        const prefs = await this.getPreferences(driverId);
        prefs.theme = theme;
        await prefs.save();
        
        this._emitUpdate(driverId, prefs, io);
        await this._notifyCriticalChange(driverId, 'Theme updated', `Your app theme was changed to ${theme}.`, io);
        
        return prefs;
    }

    static async updateLanguage(driverId, language, io) {
        const prefs = await this.getPreferences(driverId);
        prefs.language = language;
        await prefs.save();
        
        this._emitUpdate(driverId, prefs, io);
        await this._notifyCriticalChange(driverId, 'Language updated', `Your app language was changed to ${language}.`, io);
        
        return prefs;
    }

    static async updateNotifications(driverId, payload, io) {
        const prefs = await this.getPreferences(driverId);
        prefs.notificationPreferences = { ...prefs.notificationPreferences, ...payload };
        await prefs.save();
        
        this._emitUpdate(driverId, prefs, io);
        return prefs;
    }

    static async updatePrivacy(driverId, payload, io) {
        const prefs = await this.getPreferences(driverId);
        prefs.privacy = { ...prefs.privacy, ...payload };
        await prefs.save();
        
        this._emitUpdate(driverId, prefs, io);
        return prefs;
    }

    static async updateRidePreferences(driverId, payload, io) {
        const prefs = await this.getPreferences(driverId);
        prefs.ridePreferences = { ...prefs.ridePreferences, ...payload };
        await prefs.save();
        
        this._emitUpdate(driverId, prefs, io);
        return prefs;
    }

    static async updateAvailabilityPreferences(driverId, payload, io) {
        const prefs = await this.getPreferences(driverId);
        prefs.availabilityPreferences = { ...prefs.availabilityPreferences, ...payload };
        await prefs.save();
        
        this._emitUpdate(driverId, prefs, io);
        return prefs;
    }

    static async updateNavigationPreferences(driverId, payload, io) {
        const prefs = await this.getPreferences(driverId);
        prefs.navigationPreferences = { ...prefs.navigationPreferences, ...payload };
        await prefs.save();
        
        this._emitUpdate(driverId, prefs, io);
        return prefs;
    }

    static async updateSecurity(driverId, payload, io) {
        const prefs = await this.getPreferences(driverId);
        prefs.security = { ...prefs.security, ...payload };
        await prefs.save();
        
        this._emitUpdate(driverId, prefs, io);
        await this._notifyCriticalChange(driverId, 'Security settings updated', 'Your account security settings were recently modified.', io);
        
        return prefs;
    }

    static async updateMapProvider(driverId, mapProvider, io) {
        const prefs = await this.getPreferences(driverId);
        prefs.mapProvider = mapProvider;
        await prefs.save();
        
        this._emitUpdate(driverId, prefs, io);
        return prefs;
    }

    static async updateVoiceNavigation(driverId, voiceNavigation, io) {
        const prefs = await this.getPreferences(driverId);
        prefs.voiceNavigation = voiceNavigation;
        await prefs.save();
        
        this._emitUpdate(driverId, prefs, io);
        return prefs;
    }

    static async resetPreferences(driverId, io) {
        await DriverPreference.findOneAndDelete({ driverId });
        const prefs = await this.getPreferences(driverId); // Re-creates with defaults
        
        this._emitUpdate(driverId, prefs, io);
        return prefs;
    }

    // Helper to emit socket events
    static _emitUpdate(driverId, prefs, io) {
        if (io) {
            io.to(`driver_${driverId}`).emit(`preferencesUpdated_${driverId}`, {
                event: 'preferences:updated',
                data: prefs
            });
        }
    }

    // Helper to notify driver of critical changes
    static async _notifyCriticalChange(driverId, title, description, io) {
        try {
            await NotificationService.createNotification({
                userId: driverId,
                userType: 'Driver',
                title,
                description,
                type: 'System',
                category: 'Security',
                priority: 'High',
                icon: 'shield-alt'
            }, io);
        } catch (err) {
            console.error('Failed to send critical preference notification:', err);
        }
    }
}

module.exports = DriverPreferenceService;
