/**
 * Commission Calculator
 * In a real-world scenario, these rates might be fetched from a dynamic config DB.
 * For now, they are centralized here to prevent hardcoding deep inside services.
 */

const COMMISSION_RATES = {
    City: 0.20,      // 20% commission on City rides
    Rental: 0.15,    // 15% on Rentals
    InterCity: 0.10, // 10% on Intercity
    Scheduled: 0.20,
    Airport: 0.15
};

const PLATFORM_FEE = 15.0; // Flat â‚¹15 platform fee per ride (excluding tax)
const GST_RATE = 0.05;     // 5% GST on Commission (just an example of tax)

class CommissionCalculator {
    /**
     * Calculates the exact commission and platform fee for a ride.
     * Note: Tips are never subjected to commission.
     */
    static calculate(grossFare, rideType = 'City') {
        const rate = COMMISSION_RATES[rideType.replace(' ', '')] || 0.20;
        
        let commission = grossFare * rate;
        let platformFee = PLATFORM_FEE;
        
        // Example: Add GST to the commission itself (if company policy dictates deducting it from driver)
        const totalDeduction = commission + platformFee;
        
        return {
            commission,
            platformFee,
            totalDeduction
        };
    }

    /**
     * Calculates cancellation penalty (if applicable)
     */
    static calculatePenalty(source) {
        if (source === 'DriverCancellation') return 50.0;
        return 0.0;
    }
}

module.exports = CommissionCalculator;
