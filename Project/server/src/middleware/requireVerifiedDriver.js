const Driver = require('../models/Driver');
const DriverVehicle = require('../models/DriverVehicle');

/**
 * Middleware to enforce that a driver is fully verified and has an active vehicle 
 * before allowing them to go online or accept dispatches.
 */
const requireVerifiedDriver = async (req, res, next) => {
    try {
        const driverId = req.user.id;
        
        const driver = await Driver.findById(driverId);
        if (!driver) {
            return res.status(404).json({ success: false, message: 'Driver not found' });
        }

        if (driver.status === 'Suspended') {
            return res.status(403).json({ success: false, message: 'Account is suspended' });
        }

        if (!driver.isVerified) {
            return res.status(403).json({ 
                success: false, 
                message: 'Verification incomplete. Please upload required documents.',
                complianceScore: driver.complianceScore 
            });
        }

        const activeVehicle = await DriverVehicle.findOne({ driverId, isActive: true });
        if (!activeVehicle) {
            return res.status(403).json({ 
                success: false, 
                message: 'No active vehicle found. Please select an active vehicle.' 
            });
        }

        // Attach vehicle to request for downstream handlers
        req.driverVehicle = activeVehicle;
        
        next();
    } catch (error) {
        console.error('requireVerifiedDriver error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

module.exports = requireVerifiedDriver;
