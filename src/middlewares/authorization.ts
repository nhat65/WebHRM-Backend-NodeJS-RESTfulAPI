import { Request, Response, NextFunction } from 'express';

// Interface for JWT payload
interface JwtPayload {
  employeeId: string;
  email: string;
  role: string;
}

// Extend Request interface to include user property
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// Authorization middleware
export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Check if user is identification
    if (!req.user || !req.user.role) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized: No user role found',
      });
      return; 
    }

    // Check role
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