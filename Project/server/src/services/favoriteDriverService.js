const FavoriteDriver = require('../models/FavoriteDriver');
const ErrorResponse = require('../utils/errorResponse');
const Driver = require('../models/Driver');

class FavoriteDriverService {
  /**
   * Add a driver to favorites
   */
  async addFavorite(userId, driverId, notes = '') {
    const driver = await Driver.findById(driverId);
    if (!driver) {
      throw new ErrorResponse('Driver not found', 404);
    }

    const existing = await FavoriteDriver.findOne({ user: userId, driver: driverId });
    if (existing) {
      throw new ErrorResponse('Driver is already in your favorites', 400);
    }

    const favorite = await FavoriteDriver.create({
      user: userId,
      driver: driverId,
      notes
    });

    return favorite;
  }

  /**
   * Remove a driver from favorites
   */
  async removeFavorite(userId, driverId) {
    const result = await FavoriteDriver.findOneAndDelete({ user: userId, driver: driverId });
    if (!result) {
      throw new ErrorResponse('Favorite not found', 404);
    }
    return { success: true };
  }

  /**
   * Get all favorite drivers for a user
   */
  async getFavorites(userId) {
    const favorites = await FavoriteDriver.find({ user: userId })
      .populate('driver', 'firstName lastName avatar rating vehicle completedRides')
      .sort({ createdAt: -1 });
    return favorites;
  }
}

module.exports = new FavoriteDriverService();
