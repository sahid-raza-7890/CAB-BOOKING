const Ride = require('../models/Ride');
const WalletTransaction = require('../models/WalletTransaction');
const SavedPlace = require('../models/SavedPlace');
const CouponUsage = require('../models/CouponUsage');

class PassengerDashboardService {
  /**
   * Get comprehensive dashboard metrics for a passenger
   */
  async getDashboardData(userId) {
    const [
      totalRides,
      monthlyRides,
      walletTransactions,
      recentRides,
      savedPlaces,
      couponUsages
    ] = await Promise.all([
      Ride.countDocuments({ passenger: userId, status: 'completed' }),
      this._getMonthlyRides(userId),
      this._getRecentTransactions(userId),
      Ride.find({ passenger: userId, status: 'completed' })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('driver', 'firstName lastName avatar rating')
        .lean(),
      SavedPlace.find({ user: userId }).limit(3).lean(),
      CouponUsage.find({ user: userId }).populate('coupon', 'code discountType discountValue').limit(5).lean()
    ]);

    // Calculate total money saved
    let totalSaved = 0;
    couponUsages.forEach(usage => {
      totalSaved += usage.discountApplied || 0;
    });

    return {
      stats: {
        totalRides,
        monthlyTrips: monthlyRides.length,
        moneySaved: totalSaved
      },
      recentRides,
      walletTransactions,
      savedPlaces,
      couponUsages
    };
  }

  async _getMonthlyRides(userId) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    return Ride.find({
      passenger: userId,
      status: 'completed',
      createdAt: { $gte: startOfMonth }
    }).select('_id');
  }

  async _getRecentTransactions(userId) {
    return WalletTransaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
  }
}

module.exports = new PassengerDashboardService();
