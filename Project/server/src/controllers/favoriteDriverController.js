const asyncHandler = require('../utils/asyncWrapper');
const favoriteDriverService = require('../services/favoriteDriverService');
const ResponseFormatter = require('../utils/responseFormatter');

/**
 * @desc    Get favorite drivers
 * @route   GET /api/favorites
 * @access  Private (User)
 */
exports.getFavorites = asyncHandler(async (req, res) => {
  const favorites = await favoriteDriverService.getFavorites(req.user.id);
  res.status(200).json(ResponseFormatter.success(favorites));
});

/**
 * @desc    Add favorite driver
 * @route   POST /api/favorites/:driverId
 * @access  Private (User)
 */
exports.addFavorite = asyncHandler(async (req, res) => {
  const favorite = await favoriteDriverService.addFavorite(req.user.id, req.params.driverId, req.body.notes);
  res.status(201).json(ResponseFormatter.success(favorite));
});

/**
 * @desc    Remove favorite driver
 * @route   DELETE /api/favorites/:driverId
 * @access  Private (User)
 */
exports.removeFavorite = asyncHandler(async (req, res) => {
  const result = await favoriteDriverService.removeFavorite(req.user.id, req.params.driverId);
  res.status(200).json(ResponseFormatter.success(result));
});
