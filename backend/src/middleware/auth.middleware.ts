import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export enum RoleLevel {
  ATHLETE = 'ATHLETE',
  STAFF = 'STAFF',
  ORGANIZER = 'ORGANIZER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export const authenticateJWT = (req: any, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token' });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'super-secret-hardened-key-2026');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Not authorized, token failed' });
  }
};

// Alias for 'protect' if used elsewhere
export const protect = authenticateJWT;

export const requireRole = (...roles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `User role ${req.user?.role || 'unknown'} is not authorized to access this route` 
      });
    }
    next();
  };
};

// Alias for 'authorize' if used elsewhere
export const authorize = requireRole;
