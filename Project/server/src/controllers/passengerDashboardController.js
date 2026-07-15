const asyncHandler = require('../utils/asyncWrapper');
const passengerDashboardService = require('../services/passengerDashboardService');
const ResponseFormatter = require('../utils/responseFormatter');

/**
 * @desc    Get passenger dashboard metrics
 * @route   GET /api/passenger-dashboard
 * @access  Private (User)
 */
exports.getDashboard = asyncHandler(async (req, res) => {
  const data = await passengerDashboardService.getDashboardData(req.user.id);
  res.status(200).json(ResponseFormatter.success(data));
});
