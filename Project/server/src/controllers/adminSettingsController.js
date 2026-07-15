const PlatformSettingService = require('../services/platformSettingService');
const ResponseFormatter = require('../utils/responseFormatter');
const asyncWrapper = require('../utils/asyncWrapper');

class AdminSettingsController {
    
    // GET /api/admin/settings
    static getAllSettings = asyncWrapper(async (req, res) => {
        const settings = await PlatformSettingService.getAllSettings();
        return ResponseFormatter.successAdmin(res, settings, 'All platform settings retrieved');
    });

    // POST /api/admin/settings
    static createSetting = asyncWrapper(async (req, res) => {
        const adminId = req.user.id;
        const ipAddress = req.ip;
        const setting = await PlatformSettingService.createSetting(req.body, adminId, ipAddress);
        return ResponseFormatter.successAdmin(res, setting, 'Platform setting created successfully');
    });

    // GET /api/admin/settings/:category
    static getCategory = asyncWrapper(async (req, res) => {
        const { category } = req.params;
        const settings = await PlatformSettingService.getCategorySettings(category);
        return ResponseFormatter.successAdmin(res, settings, `${category} settings retrieved`);
    });

    // PUT /api/admin/settings/:key
    static updateSetting = asyncWrapper(async (req, res) => {
        const { key } = req.params;
        const { value } = req.body;
        const adminId = req.user.id;
        const ipAddress = req.ip;
        const io = req.app.get('io');

        const updated = await PlatformSettingService.updateSetting(key, value, adminId, ipAddress, io);
        return ResponseFormatter.successAdmin(res, updated, 'Setting updated successfully');
    });

    // PUT /api/admin/settings
    static bulkUpdate = asyncWrapper(async (req, res) => {
        const { updates } = req.body; // [{ key, value }]
        const adminId = req.user.id;
        const ipAddress = req.ip;
        const io = req.app.get('io');

        const results = await PlatformSettingService.bulkUpdateSettings(updates, adminId, ipAddress, io);
        return ResponseFormatter.successAdmin(res, results, 'Settings bulk updated successfully');
    });

    // POST /api/admin/settings/reset/:category
    static resetCategory = asyncWrapper(async (req, res) => {
        const { category } = req.params;
        const adminId = req.user.id;
        const ipAddress = req.ip;
        const io = req.app.get('io');

        const resetSettings = await PlatformSettingService.resetCategory(category, adminId, ipAddress, io);
        return ResponseFormatter.successAdmin(res, resetSettings, `${category} settings reset to default`);
    });

    // POST /api/admin/settings/reset
    static resetAll = asyncWrapper(async (req, res) => {
        const adminId = req.user.id;
        const ipAddress = req.ip;
        const io = req.app.get('io');

        const resetSettings = await PlatformSettingService.resetAll(adminId, ipAddress, io);
        return ResponseFormatter.successAdmin(res, resetSettings, 'All settings reset to default');
    });
}

module.exports = AdminSettingsController;
