const asyncHandler = require('../utils/asyncWrapper');
const receiptService = require('../services/receiptService');

/**
 * @desc    Download receipt PDF
 * @route   GET /api/receipts/rides/:rideId/pdf
 * @access  Private (User/Driver)
 */
exports.downloadReceipt = asyncHandler(async (req, res) => {
  const doc = await receiptService.generateReceipt(req.params.rideId, req.user.id);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=receipt-${req.params.rideId}.pdf`);

  doc.pipe(res);
});
