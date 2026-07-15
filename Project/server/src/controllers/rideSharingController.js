const asyncHandler = require('../utils/asyncWrapper');
const rideSharingService = require('../services/rideSharingService');
const ResponseFormatter = require('../utils/responseFormatter');

/**
 * @desc    Generate a sharing link
 * @route   POST /api/ride-sharing/rides/:rideId/share
 * @access  Private (User)
 */
exports.generateLink = asyncHandler(async (req, res) => {
  const result = await rideSharingService.generateTrackingLink(req.params.rideId, req.user.id);
  res.status(201).json(ResponseFormatter.success(result));
});

/**
 * @desc    Get ride by tracking token
 * @route   GET /api/ride-sharing/track/:token
 * @access  Public
 */
exports.trackRide = asyncHandler(async (req, res) => {
  const ride = await rideSharingService.getRideByToken(req.params.token);
  res.status(200).json(ResponseFormatter.success(ride));
});
