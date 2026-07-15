const CommissionCalculator = require('./commissionCalculator');

class EarningCalculator {
    /**
     * Calculates the exact final breakdown for a single ride's earnings.
     */
    static calculateRide(grossFare, tip = 0, bonus = 0, incentive = 0, rideType = 'City', source = 'CompletedRide') {
        const { commission, platformFee, totalDeduction } = CommissionCalculator.calculate(grossFare, rideType);
        const penalty = CommissionCalculator.calculatePenalty(source);

        // Net Earning = (Gross Fare - Commission - Platform Fee - Penalty) + Tip + Bonus + Incentive
        // Tip is 100% tax and commission free.
        
        let netEarning = (grossFare - totalDeduction - penalty) + tip + bonus + incentive;

        // Ensure net earning doesn't go negative just from platform fees on a â‚¹10 ride
        // (In a real system, you'd carry forward negative balance, but we'll floor it at 0 for simplicity if no penalties)
        if (netEarning < 0 && penalty === 0) {
            netEarning = 0; 
        }

        return {
            grossFare,
            commission,
            platformFee,
            penalty,
            tip,
            bonus,
            incentive,
            netEarning
        };
    }
}

module.exports = EarningCalculator;
