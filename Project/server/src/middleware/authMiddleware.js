const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        req.user.id = decoded.userId || decoded.id || decoded._id || decoded.user?.id || decoded.user?._id; 
        req.user.userId = req.user.id;
        req.user._id = req.user.id;


        
        if (!req.user.id) {
            console.error("AUTH ERROR: req.user.id is undefined! Token payload:", decoded);
        }
        
        next();
    } catch (e) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

module.exports = authMiddleware;
