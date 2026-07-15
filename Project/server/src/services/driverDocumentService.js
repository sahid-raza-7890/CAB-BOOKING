const DriverDocument = require('../models/DriverDocument');
const Driver = require('../models/Driver');

class DriverDocumentService {
    /**
     * Upload a new document.
     * Assuming file upload to Cloudinary has happened on client, or we receive the URL in payload.
     */
    static async uploadDocument(driverId, payload, io) {
        const { documentType, documentNumber, documentUrl } = payload;
        
        if (!documentType || !documentUrl) {
            throw new Error('documentType and documentUrl are required');
        }

        // Check if there is already a Pending document of this type
        const existing = await DriverDocument.findOne({ driverId, documentType, status: 'Pending' });
        if (existing) {
            existing.documentUrl = documentUrl;
            if (documentNumber) existing.documentNumber = documentNumber;
            existing.uploadedAt = new Date();
            await existing.save();
            await DriverDocumentService.calculateComplianceScore(driverId, io);
            return existing;
        }

        const newDoc = new DriverDocument({
            driverId,
            documentType,
            documentNumber,
            documentUrl,
            status: 'Pending'
        });

        await newDoc.save();
        await DriverDocumentService.calculateComplianceScore(driverId, io);

        if (io) {
            io.to(`driver_${driverId}`).emit('documentUpdated', { driverId, documentId: newDoc._id, status: 'Pending' });
        }

        return newDoc;
    }

    static async getDocuments(driverId) {
        return await DriverDocument.find({ driverId }).sort({ uploadedAt: -1 }).lean();
    }

    static async getDocument(documentId, driverId) {
        const doc = await DriverDocument.findOne({ _id: documentId, driverId }).lean();
        if (!doc) throw new Error('Document not found or unauthorized');
        return doc;
    }

    static async deleteDocument(documentId, driverId, io) {
        const doc = await DriverDocument.findOne({ _id: documentId, driverId });
        if (!doc) throw new Error('Document not found or unauthorized');

        if (doc.status === 'Approved') {
            throw new Error('Cannot delete an approved document. Contact support.');
        }

        await doc.deleteOne();
        await DriverDocumentService.calculateComplianceScore(driverId, io);
        return { success: true };
    }

    static async verifyDocument(documentId, adminId, expiryDate, io) {
        const doc = await DriverDocument.findById(documentId);
        if (!doc) throw new Error('Document not found');

        doc.status = 'Approved';
        doc.verifiedAt = new Date();
        doc.verifiedBy = adminId;
        doc.expiryDate = expiryDate || null;
        
        await doc.save();
        await DriverDocumentService.calculateComplianceScore(doc.driverId, io);

        if (io) {
            io.to(`driver_${doc.driverId}`).emit('documentApproved', { driverId: doc.driverId, documentId: doc._id });
        }

        return doc;
    }

    static async rejectDocument(documentId, adminId, reason, io) {
        const doc = await DriverDocument.findById(documentId);
        if (!doc) throw new Error('Document not found');

        doc.status = 'Rejected';
        doc.verifiedAt = new Date();
        doc.verifiedBy = adminId;
        doc.rejectionReason = reason;

        await doc.save();
        await DriverDocumentService.calculateComplianceScore(doc.driverId, io);

        if (io) {
            io.to(`driver_${doc.driverId}`).emit('documentRejected', { driverId: doc.driverId, documentId: doc._id, reason });
        }

        return doc;
    }

    static async getComplianceStatus(driverId) {
        const requiredTypes = ['License', 'Insurance', 'Registration'];
        const documents = await DriverDocument.find({ driverId });

        let approvedCount = 0;
        let pendingCount = 0;
        const missing = [];

        requiredTypes.forEach(type => {
            const docsOfType = documents.filter(d => d.documentType === type);
            const approved = docsOfType.find(d => d.status === 'Approved');
            const pending = docsOfType.find(d => d.status === 'Pending');

            if (approved) {
                approvedCount++;
            } else if (pending) {
                pendingCount++;
            } else {
                missing.push(type);
            }
        });

        const percentage = Math.round((approvedCount / requiredTypes.length) * 100);
        const isCompliant = percentage === 100;

        return {
            percentage,
            isCompliant,
            approvedCount,
            pendingCount,
            missing,
            totalRequired: requiredTypes.length
        };
    }

    static async calculateComplianceScore(driverId, io) {
        const status = await DriverDocumentService.getComplianceStatus(driverId);
        
        await Driver.findByIdAndUpdate(driverId, {
            complianceScore: status.percentage,
            isVerified: status.isCompliant
        });

        if (io) {
            io.to(`driver_${driverId}`).emit('complianceUpdated', { driverId, status });
        }

        return status;
    }

    // â”€â”€â”€ ADMIN COMPLIANCE CENTER METHODS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    static async getPendingDocuments() {
        return await DriverDocument.find({ status: 'Pending' })
            .populate({ path: 'driverId', select: 'name email phone' })
            .sort({ uploadedAt: -1 })
            .lean();
    }

    static async getApprovedDocuments() {
        return await DriverDocument.find({ status: 'Approved' })
            .populate({ path: 'driverId', select: 'name email phone' })
            .sort({ uploadedAt: -1 })
            .lean();
    }

    static async getRejectedDocuments() {
        return await DriverDocument.find({ status: 'Rejected' })
            .populate({ path: 'driverId', select: 'name email phone' })
            .sort({ uploadedAt: -1 })
            .lean();
    }

    static async adminApproveDocument(documentId, adminId, expiryDate, ipAddress, remarks = '', io) {
        const doc = await DriverDocument.findById(documentId);
        if (!doc) throw new Error('Document not found');

        const previousStatus = doc.status;
        doc.status = 'Approved';
        doc.verifiedAt = new Date();
        doc.verifiedBy = adminId;
        doc.expiryDate = expiryDate || null;
        if (remarks) doc.metadata = { ...doc.metadata, remarks };

        await doc.save();
        await DriverDocumentService.calculateComplianceScore(doc.driverId, io);

        // Audit Logging
        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'APPROVE_DOCUMENT',
            targetType: 'DriverDocument',
            targetId: doc._id,
            details: {
                driverId: doc.driverId,
                previousStatus,
                newStatus: 'Approved',
                remarks
            },
            ipAddress
        });

        if (io) {
            io.to(`driver_${doc.driverId}`).emit('driverDocumentUpdated', { driverId: doc.driverId, documentId: doc._id, status: 'Approved' });
            io.to('admin_global').emit('admin_dashboard_update');
        }

        return doc;
    }

    static async adminRejectDocument(documentId, adminId, reason, ipAddress, io) {
        const doc = await DriverDocument.findById(documentId);
        if (!doc) throw new Error('Document not found');

        const previousStatus = doc.status;
        doc.status = 'Rejected';
        doc.verifiedAt = new Date();
        doc.verifiedBy = adminId;
        doc.rejectionReason = reason;

        await doc.save();
        await DriverDocumentService.calculateComplianceScore(doc.driverId, io);

        // Audit Logging
        const AdminAuditService = require('./adminAuditService');
        await AdminAuditService.logAction({
            adminId,
            action: 'REJECT_DOCUMENT',
            targetType: 'DriverDocument',
            targetId: doc._id,
            details: {
                driverId: doc.driverId,
                previousStatus,
                newStatus: 'Rejected',
                remarks: reason
            },
            ipAddress
        });

        if (io) {
            io.to(`driver_${doc.driverId}`).emit('driverDocumentUpdated', { driverId: doc.driverId, documentId: doc._id, status: 'Rejected', reason });
            io.to('admin_global').emit('admin_dashboard_update');
        }

        return doc;
    }

    static async getDriverDocuments(driverId) {
        return await DriverDocument.find({ driverId }).sort({ uploadedAt: -1 }).lean();
    }

    // â”€â”€â”€ SPRINT 39: DOCUMENT EXPIRY & RENEWAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    static async checkDocumentExpiry(io) {
        const now = new Date();
        const expiredDocs = await DriverDocument.find({
            status: 'Approved',
            expiryDate: { $lte: now }
        });

        const updatedDrivers = new Set();

        for (const doc of expiredDocs) {
            doc.status = 'Expired';
            await doc.save();
            updatedDrivers.add(doc.driverId.toString());

            if (io) {
                io.to(`driver_${doc.driverId}`).emit('documentExpired', { documentId: doc._id, documentType: doc.documentType });
            }
        }

        for (const driverId of updatedDrivers) {
            await DriverDocumentService.calculateComplianceScore(driverId, io);
        }

        return { expiredCount: expiredDocs.length };
    }

    static async renewDocument(driverId, documentId, payload, io) {
        const existingDoc = await DriverDocument.findOne({ _id: documentId, driverId });
        if (!existingDoc) throw new Error('Document not found or unauthorized');

        if (existingDoc.status !== 'Approved' && existingDoc.status !== 'Expired') {
            throw new Error('Can only renew Approved or Expired documents');
        }

        const newDoc = new DriverDocument({
            driverId,
            documentType: existingDoc.documentType,
            documentNumber: payload.documentNumber || existingDoc.documentNumber,
            documentUrl: payload.documentUrl,
            status: 'Pending',
            metadata: { renewedFrom: existingDoc._id }
        });

        await newDoc.save();
        await DriverDocumentService.calculateComplianceScore(driverId, io);

        if (io) {
            io.to(`driver_${driverId}`).emit('documentUpdated', { driverId, documentId: newDoc._id, status: 'Pending' });
        }

        return newDoc;
    }
}

module.exports = DriverDocumentService;
