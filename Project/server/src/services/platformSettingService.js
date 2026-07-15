const PlatformSetting = require('../models/PlatformSetting');
const AdminAuditService = require('./adminAuditService');

const DEFAULT_SETTINGS = [
    { category: 'Pricing', key: 'Base Fare', value: 50, description: 'Base fare for all rides' },
    { category: 'Pricing', key: 'Per KM Rate', value: 12, description: 'Rate per kilometer' },
    { category: 'Pricing', key: 'Per Minute Rate', value: 1.5, description: 'Rate per minute' },
    { category: 'Pricing', key: 'Minimum Fare', value: 80, description: 'Minimum fare' },
    { category: 'Pricing', key: 'Maximum Fare', value: 5000, description: 'Maximum fare' },
    { category: 'Pricing', key: 'Waiting Charge', value: 2, description: 'Waiting charge per minute' },
    { category: 'Pricing', key: 'Night Charge', value: 20, description: 'Night charge multiplier' },
    { category: 'Pricing', key: 'Cancellation Fee', value: 30, description: 'Cancellation fee' },
    { category: 'Pricing', key: 'Booking Fee', value: 5, description: 'Booking fee' },
    { category: 'Pricing', key: 'Airport Fee', value: 150, description: 'Airport surcharge' },

    { category: 'Commission', key: 'Platform Commission %', value: 20, description: 'Platform commission percentage' },
    { category: 'Commission', key: 'Driver Bonus %', value: 5, description: 'Driver bonus percentage' },
    { category: 'Commission', key: 'Referral %', value: 10, description: 'Referral bonus percentage' },
    { category: 'Commission', key: 'Tax %', value: 18, description: 'Tax percentage' },

    { category: 'Maps', key: 'Google Maps API Key', value: '', description: 'Google Maps API Key' },
    { category: 'Maps', key: 'Mapbox API Key', value: '', description: 'Mapbox API Key' },
    { category: 'Maps', key: 'Default Provider', value: 'Google Maps', description: 'Default map provider' },
    { category: 'Maps', key: 'Default Country', value: 'IN', description: 'Default country code' },
    { category: 'Maps', key: 'Default Radius', value: 5, description: 'Default search radius (km)' },
    { category: 'Maps', key: 'Default Zoom', value: 12, description: 'Default map zoom level' },

    { category: 'Payments', key: 'Stripe Keys', value: '', description: 'Stripe API Keys' },
    { category: 'Payments', key: 'Razorpay Keys', value: '', description: 'Razorpay API Keys' },
    { category: 'Payments', key: 'PayPal Keys', value: '', description: 'PayPal API Keys' },
    { category: 'Payments', key: 'Wallet Enabled', value: true, description: 'Enable wallet payments' },
    { category: 'Payments', key: 'Cash Enabled', value: true, description: 'Enable cash payments' },
    { category: 'Payments', key: 'Card Enabled', value: true, description: 'Enable card payments' },
    { category: 'Payments', key: 'Refund Enabled', value: true, description: 'Enable refunds' },

    { category: 'Notifications', key: 'Push Enabled', value: true, description: 'Enable push notifications' },
    { category: 'Notifications', key: 'SMS Enabled', value: true, description: 'Enable SMS notifications' },
    { category: 'Notifications', key: 'Email Enabled', value: true, description: 'Enable email notifications' },
    { category: 'Notifications', key: 'Marketing Notifications', value: true, description: 'Enable marketing notifications' },
    { category: 'Notifications', key: 'Ride Notifications', value: true, description: 'Enable ride notifications' },
    { category: 'Notifications', key: 'Emergency Notifications', value: true, description: 'Enable emergency notifications' },

    { category: 'Localization', key: 'Default Language', value: 'en', description: 'Default language' },
    { category: 'Localization', key: 'Supported Languages', value: ['en', 'hi', 'fr', 'es'], description: 'Supported languages' },
    { category: 'Localization', key: 'Currency', value: 'INR', description: 'Default currency' },
    { category: 'Localization', key: 'Timezone', value: 'Asia/Kolkata', description: 'Default timezone' },
    { category: 'Localization', key: 'Date Format', value: 'DD/MM/YYYY', description: 'Default date format' },

    { category: 'Security', key: 'JWT Expiration', value: '7d', description: 'JWT expiration time' },
    { category: 'Security', key: 'Password Policy', value: 'strong', description: 'Password policy (strong/medium/low)' },
    { category: 'Security', key: 'Session Timeout', value: 60, description: 'Session timeout (minutes)' },
    { category: 'Security', key: 'Two Factor Authentication', value: false, description: 'Enable 2FA' },
    { category: 'Security', key: 'Rate Limiting', value: 100, description: 'Rate limit (requests per minute)' },
    { category: 'Security', key: 'Maximum Login Attempts', value: 5, description: 'Max login attempts before lockout' },

    { category: 'Branding', key: 'Platform Name', value: 'UCAB Enterprise', description: 'Platform name' },
    { category: 'Branding', key: 'Support Email', value: 'support@ucab.com', description: 'Support email' },
    { category: 'Branding', key: 'Support Phone', value: '1800-UCAB-HELP', description: 'Support phone number' },
    { category: 'Branding', key: 'Logo', value: '', description: 'URL to logo' },
    { category: 'Branding', key: 'Favicon', value: '', description: 'URL to favicon' },
    { category: 'Branding', key: 'Theme Colors', value: { primary: '#FFD21F', secondary: '#1A1A1A' }, description: 'Theme colors' },

    { category: 'FeatureFlags', key: 'Ride Sharing', value: true, description: 'Enable ride sharing' },
    { category: 'FeatureFlags', key: 'Scheduled Rides', value: true, description: 'Enable scheduled rides' },
    { category: 'FeatureFlags', key: 'Promo Codes', value: true, description: 'Enable promo codes' },
    { category: 'FeatureFlags', key: 'Referral System', value: true, description: 'Enable referral system' },
    { category: 'FeatureFlags', key: 'Wallet', value: true, description: 'Enable wallet' },
    { category: 'FeatureFlags', key: 'Emergency SOS', value: true, description: 'Enable emergency SOS' },
    { category: 'FeatureFlags', key: 'Driver Rewards', value: true, description: 'Enable driver rewards' },
    { category: 'FeatureFlags', key: 'Analytics', value: true, description: 'Enable analytics' }
];

class PlatformSettingService {
    static async _ensureDefaults() {
        const count = await PlatformSetting.countDocuments();
        if (count === 0) {
            await PlatformSetting.insertMany(DEFAULT_SETTINGS);
        }
    }

    static async getAllSettings() {
        await this._ensureDefaults();
        return await PlatformSetting.find().sort({ category: 1, key: 1 }).lean();
    }

    static async getCategorySettings(category) {
        await this._ensureDefaults();
        return await PlatformSetting.find({ category }).sort({ key: 1 }).lean();
    }

    static async getSetting(key) {
        await this._ensureDefaults();
        return await PlatformSetting.findOne({ key }).lean();
    }

    static async updateSetting(key, value, adminId, ipAddress, io) {
        await this._ensureDefaults();
        const setting = await PlatformSetting.findOne({ key });
        if (!setting) throw new Error('Setting not found');

        const oldValue = setting.value;
        setting.value = value;
        setting.updatedBy = adminId;
        await setting.save();

        await AdminAuditService.logAction({
            adminId,
            action: 'UPDATE_PLATFORM_SETTING',
            targetType: 'PlatformSetting',
            targetId: setting._id,
            details: { category: setting.category, settingKey: key, oldValue, newValue: value },
            ipAddress
        });

        if (io) {
            io.to('admin_global').emit('platformSettingsUpdated', { key, value });
            io.to('admin_global').emit('admin_dashboard_update');
        }

        return setting;
    }

    static async bulkUpdateSettings(updates, adminId, ipAddress, io) {
        await this._ensureDefaults();
        const results = [];
        for (const update of updates) {
            const { key, value } = update;
            const setting = await PlatformSetting.findOne({ key });
            if (setting) {
                const oldValue = setting.value;
                setting.value = value;
                setting.updatedBy = adminId;
                await setting.save();
                results.push(setting);

                await AdminAuditService.logAction({
                    adminId,
                    action: 'UPDATE_PLATFORM_SETTING',
                    targetType: 'PlatformSetting',
                    targetId: setting._id,
                    details: { category: setting.category, settingKey: key, oldValue, newValue: value, bulk: true },
                    ipAddress
                });
            }
        }

        await AdminAuditService.logAction({
            adminId,
            action: 'BULK_UPDATE_SETTINGS',
            targetType: 'PlatformSetting',
            targetId: adminId, // pseudo
            details: { updatesCount: updates.length },
            ipAddress
        });

        if (io) {
            io.to('admin_global').emit('platformSettingsUpdated', { bulk: true });
            io.to('admin_global').emit('admin_dashboard_update');
        }

        return results;
    }

    static async resetCategory(category, adminId, ipAddress, io) {
        await this._ensureDefaults();
        const defaults = DEFAULT_SETTINGS.filter(s => s.category === category);
        
        for (const def of defaults) {
            await PlatformSetting.updateOne({ key: def.key }, { $set: { value: def.value, updatedBy: adminId } });
        }

        await AdminAuditService.logAction({
            adminId,
            action: 'RESET_SETTINGS_CATEGORY',
            targetType: 'PlatformSetting',
            targetId: adminId,
            details: { category },
            ipAddress
        });

        if (io) {
            io.to('admin_global').emit('platformSettingsUpdated', { category, reset: true });
            io.to('admin_global').emit('admin_dashboard_update');
        }

        return await this.getCategorySettings(category);
    }

    static async resetAll(adminId, ipAddress, io) {
        await this._ensureDefaults();
        for (const def of DEFAULT_SETTINGS) {
            await PlatformSetting.updateOne({ key: def.key }, { $set: { value: def.value, updatedBy: adminId } });
        }

        await AdminAuditService.logAction({
            adminId,
            action: 'RESET_ALL_SETTINGS',
            targetType: 'PlatformSetting',
            targetId: adminId,
            details: {},
            ipAddress
        });

        if (io) {
            io.to('admin_global').emit('platformSettingsUpdated', { resetAll: true });
            io.to('admin_global').emit('admin_dashboard_update');
        }

        return await this.getAllSettings();
    }

    static async getPricingSettings() { return await this.getCategorySettings('Pricing'); }
    static async getCommissionSettings() { return await this.getCategorySettings('Commission'); }
    static async getMapSettings() { return await this.getCategorySettings('Maps'); }
    static async getPaymentSettings() { return await this.getCategorySettings('Payments'); }
    static async getNotificationSettings() { return await this.getCategorySettings('Notifications'); }
    static async getSecuritySettings() { return await this.getCategorySettings('Security'); }
    static async getLocalizationSettings() { return await this.getCategorySettings('Localization'); }

    // â”€â”€â”€ SPRINT 39 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    static async createSetting(data, adminId, ipAddress) {
        const { category, key, value, description } = data;
        
        const existing = await PlatformSetting.findOne({ key });
        if (existing) throw new Error('Setting with this key already exists');

        const setting = new PlatformSetting({ category, key, value, description, updatedBy: adminId });
        await setting.save();

        await AdminAuditService.logAction({
            adminId,
            action: 'CREATE_PLATFORM_SETTING',
            targetType: 'PlatformSetting',
            targetId: setting._id,
            details: { category, key, value },
            ipAddress
        });

        return setting;
    }

    static async getPublicSettings() {
        await this._ensureDefaults();
        const settings = await PlatformSetting.find({ 
            category: { $in: ['FeatureFlags', 'Branding', 'Localization'] } 
        }).lean();

        const publicConfig = {};
        settings.forEach(s => {
            if (!publicConfig[s.category]) publicConfig[s.category] = {};
            publicConfig[s.category][s.key] = s.value;
        });

        return publicConfig;
    }
}

module.exports = PlatformSettingService;
