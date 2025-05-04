const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const token = req.cookies?.auth_token;
    console.log('Token from cookies:', token);

    if (!token) {
        return res.status(401).json({ error: 'เซสชั่นหมดอายุ กรุณาเข้าสู่ระบบใหม่' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = verified;
        next();
    } catch (err) {
        console.error('Token verification failed:', err);

        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'เซสชั่นหมดอายุ กรุณาเข้าสู่ระบบใหม่' });
        }

        return res.status(403).json({ error: 'โทเค็นไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่' });
    }
};

module.exports = authenticateToken;
