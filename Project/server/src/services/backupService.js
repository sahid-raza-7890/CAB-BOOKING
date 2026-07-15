const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const crypto = require('crypto');
const BackupMetadata = require('../models/BackupMetadata');
const logger = require('../config/logger');
const mongoose = require('mongoose');

const BACKUP_DIR = path.join(__dirname, '../../backups');

class BackupService {
    static _ensureBackupDir() {
        if (!fs.existsSync(BACKUP_DIR)) {
            fs.mkdirSync(BACKUP_DIR, { recursive: true });
        }
    }

    static async createBackup(adminId, io) {
        this._ensureBackupDir();
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupId = `BKP_${timestamp}`;
        const filename = `${backupId}.archive`;
        const filepath = path.join(BACKUP_DIR, filename);
        
        const mongoUri = process.env.MONGO_URI;
        const startTime = Date.now();

        return new Promise((resolve, reject) => {
            // Using mongodump to create an archive
            const cmd = `mongodump --uri="${mongoUri}" --archive="${filepath}" --gzip`;
            
            exec(cmd, async (error, stdout, stderr) => {
                const duration = Date.now() - startTime;
                
                if (error) {
                    logger.error(`[BackupService] Backup failed: ${error.message}`);
                    if (io) io.emit('backupFailed', { backupId, error: error.message });
                    
                    await BackupMetadata.create({
                        backupId,
                        filename,
                        checksum: 'N/A',
                        duration,
                        createdBy: adminId,
                        status: 'Failed'
                    });
                    
                    return reject(new Error('Backup failed'));
                }

                try {
                    const fileBuffer = fs.readFileSync(filepath);
                    const hashSum = crypto.createHash('sha256');
                    hashSum.update(fileBuffer);
                    const checksum = hashSum.digest('hex');
                    
                    const stat = fs.statSync(filepath);

                    let mongoVersion = 'Unknown';
                    if (mongoose.connection.readyState === 1) {
                        const adminDb = mongoose.connection.db.admin();
                        const serverStatus = await adminDb.serverStatus();
                        mongoVersion = serverStatus.version;
                    }

                    const metadata = await BackupMetadata.create({
                        backupId,
                        filename,
                        checksum,
                        mongoVersion,
                        databaseSize: stat.size,
                        duration,
                        createdBy: adminId,
                        status: 'Success'
                    });

                    if (io) io.emit('backupCompleted', { backupId, filename, size: stat.size });
                    
                    resolve(metadata);
                } catch (err) {
                    logger.error(`[BackupService] Metadata creation failed: ${err.message}`);
                    reject(err);
                }
            });
        });
    }

    static async restoreBackup(backupId, adminId, io) {
        const metadata = await BackupMetadata.findOne({ backupId });
        if (!metadata) throw new Error('Backup metadata not found');
        if (metadata.status !== 'Success') throw new Error('Cannot restore from a failed backup');

        const filepath = path.join(BACKUP_DIR, metadata.filename);
        if (!fs.existsSync(filepath)) throw new Error('Backup file does not exist on disk');

        // Validate checksum
        const fileBuffer = fs.readFileSync(filepath);
        const hashSum = crypto.createHash('sha256');
        hashSum.update(fileBuffer);
        const currentChecksum = hashSum.digest('hex');

        if (currentChecksum !== metadata.checksum) {
            throw new Error('Backup file checksum mismatch. The file may have been tampered with or corrupted.');
        }

        // Check mongo version compatibility (very basic check)
        if (mongoose.connection.readyState === 1 && metadata.mongoVersion) {
            const adminDb = mongoose.connection.db.admin();
            const serverStatus = await adminDb.serverStatus();
            if (serverStatus.version.split('.')[0] !== metadata.mongoVersion.split('.')[0]) {
                logger.warn(`[BackupService] Restoring backup from Mongo ${metadata.mongoVersion} to ${serverStatus.version}`);
            }
        }

        const mongoUri = process.env.MONGO_URI;

        return new Promise((resolve, reject) => {
            const cmd = `mongorestore --uri="${mongoUri}" --archive="${filepath}" --gzip --drop`;
            
            exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    logger.error(`[BackupService] Restore failed: ${error.message}`);
                    return reject(new Error('Restore failed'));
                }
                
                // We emit serverRestart because the DB has been wiped and replaced. In real systems, we might just emit a restore completion.
                if (io) io.emit('serverRestart', { reason: 'Database Restored', timestamp: new Date() });
                
                resolve({ success: true, backupId });
            });
        });
    }

    static async listBackups() {
        return await BackupMetadata.find().sort({ createdAt: -1 }).populate('createdBy', 'name email');
    }
}

module.exports = BackupService;
