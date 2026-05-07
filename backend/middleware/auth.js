import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if(!token) {
        return res.status(401).json({ message: 'Access denied no token provided.'});
    }

    try {
        const decoded =  jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; //{id, email, role}
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired token'});
    }
};


export const isAdmin = (req, res, next) => {
    if(req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required.'});
    }
    next();
};


export const isOwner = (req, res, next) => {
    if(req.user.role !== 'owner') {
        return res.status(403).json({message: 'Store owner access required'});
    }
    next();
};