const User = require('../models/User');

/**
 * Middleware to require and validate a PIN for sensitive actions.
 * Expects 'x-pin-code' in the headers.
 */
const requirePin = async (req, res, next) => {
    const pinCode = req.header('x-pin-code');

    if (!pinCode) {
        return res.status(403).json({ error: 'PIN verification required for this action.' });
    }

    try {
        const userId = req.user.userId || req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        if (user.pin !== pinCode) {
            return res.status(403).json({ error: 'Invalid PIN.' });
        }

        next();
    } catch (err) {
        console.error('Safety middleware error:', err);
        return res.status(500).json({ error: 'Internal server error during PIN validation.' });
    }
};

module.exports = requirePin;
