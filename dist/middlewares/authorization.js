"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized: No user role found',
            });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'Forbidden: Insufficient permissions',
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
