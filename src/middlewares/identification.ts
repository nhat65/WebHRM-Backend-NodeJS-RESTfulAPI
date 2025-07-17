import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

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

// Identify token
export const identifier = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  let token: string | undefined;

  // Determine token source based on client type
  if (req.headers.client === 'not-browser') {
    const authHeader = req.headers.authorization;
    if (typeof authHeader === 'string') {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
        token = parts[1];
      }
    }
  } else {
    token = req.cookies['Authorization'] as string;
  }

  // Check if token exists
  if (!token) {
    res.status(403).json({ success: false, message: 'Unauthorized: No token provided' });
    return; 
  }

  // Verify token
  if (!process.env.TOKEN_SECRET) {
    res.status(500).json({ success: false, message: 'Server configuration error' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error: any) {
    console.log('Identifier error: ' + error.message);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};