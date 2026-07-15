const DriverDocumentService = require('../services/driverDocumentService');
const DriverVehicleService = require('../services/driverVehicleService');
const ResponseFormatter = require('../utils/responseFormatter');
const asyncWrapper = require('../utils/asyncWrapper');

class AdminComplianceController {

  // GET /api/admin/compliance/documents
  static listPendingDocuments = asyncWrapper(async (req, res) => {
    const docs = await DriverDocumentService.getPendingDocuments();
    return ResponseFormatter.successAdmin(res, docs, 'Pending compliance documents retrieved successfully');
  });

  // GET /api/admin/compliance/documents/:driverId
  static getDriverDocuments = asyncWrapper(async (req, res) => {
    const docs = await DriverDocumentService.getDriverDocuments(req.params.driverId);
    return ResponseFormatter.successAdmin(res, docs, 'Driver compliance documents retrieved successfully');
  });

  // PUT /api/admin/compliance/documents/:id/approve
  static approveDocument = asyncWrapper(async (req, res) => {
    const { expiryDate, remarks } = req.body;
    const io = req.app.get('io');
    const doc = await DriverDocumentService.adminApproveDocument(
      req.params.id,
      req.user._id,
      expiryDate,
      req.ip,
      remarks,
      io
    );
    return ResponseFormatter.successAdmin(res, doc, 'Document approved successfully');
  });

  // PUT /api/admin/compliance/documents/:id/reject
  static rejectDocument = asyncWrapper(async (req, res) => {
    const { reason } = req.body;
    if (!reason) {
      return ResponseFormatter.error(res, 'Rejection reason is required', 'VALIDATION_ERROR', {}, 400);
    }
    const io = req.app.get('io');
    const doc = await DriverDocumentService.adminRejectDocument(
      req.params.id,
      req.user._id,
      reason,
      req.ip,
      io
    );
    return ResponseFormatter.successAdmin(res, doc, 'Document rejected successfully');
  });

  // GET /api/admin/compliance/vehicles
  static listPendingVehicles = asyncWrapper(async (req, res) => {
    const vehicles = await DriverVehicleService.getPendingVehicles();
    return ResponseFormatter.successAdmin(res, vehicles, 'Pending vehicles retrieved successfully');
  });

  // GET /api/admin/compliance/vehicles/:driverId
  static getDriverVehicles = asyncWrapper(async (req, res) => {
    const vehicles = await DriverVehicleService.getDriverVehicles(req.params.driverId);
    return ResponseFormatter.successAdmin(res, vehicles, 'Driver vehicles retrieved successfully');
  });

  // PUT /api/admin/compliance/vehicles/:id/approve
  static approveVehicle = asyncWrapper(async (req, res) => {
    const { remarks } = req.body;
    const io = req.app.get('io');
    const vehicle = await DriverVehicleService.adminApproveVehicle(
      req.params.id,
      req.user._id,
      req.ip,
      remarks,
      io
    );
    return ResponseFormatter.successAdmin(res, vehicle, 'Vehicle approved successfully');
  });

  // PUT /api/admin/compliance/vehicles/:id/reject
  static rejectVehicle = asyncWrapper(async (req, res) => {
    const { reason } = req.body;
    if (!reason) {
      return ResponseFormatter.error(res, 'Rejection reason is required', 'VALIDATION_ERROR', {}, 400);
    }
    const io = req.app.get('io');
    const vehicle = await DriverVehicleService.adminRejectVehicle(
      req.params.id,
      req.user._id,
      reason,
      req.ip,
      io
    );
    return ResponseFormatter.successAdmin(res, vehicle, 'Vehicle rejected successfully');
  });

  // â”€â”€â”€ SPRINT 39 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  // POST /api/admin/compliance/documents/check-expiry
  static triggerExpiryCheck = asyncWrapper(async (req, res) => {
    const io = req.app.get('io');
    const result = await DriverDocumentService.checkDocumentExpiry(io);
    return ResponseFormatter.successAdmin(res, result, 'Document expiry check completed');
  });
}

module.exports = AdminComplianceController;
