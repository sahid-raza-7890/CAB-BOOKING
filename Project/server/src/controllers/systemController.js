const SystemHealthService = require('../services/systemHealthService');
const BackupService = require('../services/backupService');
const ResponseFormatter = require('../utils/responseFormatter');
const fs = require('fs');
const path = require('path');

class SystemController {
    static async getLiveness(req, res) {
        const result = await SystemHealthService.checkLiveness();
        // Native response for basic HTTP checks
        res.status(200).json(result);
    }

    static async getReadiness(req, res) {
        const result = await SystemHealthService.checkReadiness();
        const statusCode = result.status === 'READY' ? 200 : 503;
        res.status(statusCode).json(result);
    }

    static async getMetrics(req, res) {
        const metrics = await SystemHealthService.getPrometheusMetrics();
        res.set('Content-Type', 'text/plain');
        res.status(200).send(metrics);
    }

    static async getStatus(req, res) {
        const status = await SystemHealthService.getServerStatus();
        return ResponseFormatter.successAdmin(res, status);
    }

    static async getSecurityAudit(req, res) {
        const audit = await SystemHealthService.getSecurityAudit();
        return ResponseFormatter.successAdmin(res, audit);
    }

    static async getLogs(req, res) {
        // Read recent logs from file (combined/error)
        // This is a basic implementation. For massive logs, we'd stream it or use a log aggregator.
        try {
            const logDir = path.join(__dirname, '../../logs');
            const files = fs.readdirSync(logDir).filter(f => f.startsWith('combined-') && f.endsWith('.log'));
            if (files.length === 0) return ResponseFormatter.successAdmin(res, { logs: [] });
            
            // Get most recent
            files.sort().reverse();
            const latestLog = path.join(logDir, files[0]);
            
            // Just read last 1000 lines or return whole file if small (mocking the last N lines logic here for brevity)
            const content = fs.readFileSync(latestLog, 'utf8');
            const lines = content.split('\n').filter(l => l.trim()).slice(-100);
            
            const logs = lines.map(l => JSON.parse(l));
            
            return ResponseFormatter.successAdmin(res, { logs });
        } catch (e) {
            return ResponseFormatter.error(res, 'Could not read logs', 'LOG_READ_ERROR', { error: e.message });
        }
    }

    static async getBackups(req, res) {
        const backups = await BackupService.listBackups();
        return ResponseFormatter.successAdmin(res, backups);
    }

    static async createBackup(req, res) {
        const adminId = req.user.userId || req.user.id;
        const backup = await BackupService.createBackup(adminId, req.io);
        return ResponseFormatter.successAdmin(res, backup, 'Backup created successfully');
    }

    static async restoreBackup(req, res) {
        const adminId = req.user.userId || req.user.id;
        const { backupId } = req.body;
        if (!backupId) return ResponseFormatter.error(res, 'Backup ID is required', 'MISSING_PARAM', {}, 400);

        const result = await BackupService.restoreBackup(backupId, adminId, req.io);
        return ResponseFormatter.successAdmin(res, result, 'Database restored successfully');
    }

    // â”€â”€â”€ SPRINT 39 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    static async getPublicSettings(req, res) {
        const PlatformSettingService = require('../services/platformSettingService');
        const settings = await PlatformSettingService.getPublicSettings();
        return ResponseFormatter.success(res, settings);
    }
}

module.exports = SystemController;
