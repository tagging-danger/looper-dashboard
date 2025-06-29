import { Request, Response, NextFunction } from 'express';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config';

interface AuthRequest extends Request {
  user?: IUser;
}

export const generateToken = (userId: string): string => {
  const payload = { userId };
  const secret: Secret = JWT_SECRET;
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN };
  return jwt.sign(payload, secret, options);
};

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Role-based permission middleware
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
      });
    }

    next();
  };
};

// Specific role checkers
export const requireAdmin = requireRole(['admin']);
export const requireAnalyst = requireRole(['admin', 'analyst']);
export const requireViewer = requireRole(['admin', 'analyst', 'viewer']);

// Permission-based middleware for specific actions
export const canEditTransactions = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Only admin and analyst can edit transactions
  if (!['admin', 'analyst'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied. Only admins and analysts can edit transactions.' });
  }

  next();
};

export const canDeleteTransactions = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Only admin can delete transactions
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Only admins can delete transactions.' });
  }

  next();
};

export const canManageUsers = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Only admin can manage users
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Only admins can manage users.' });
  }

  next();
};

export const canExportData = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Only admin and analyst can export data
  if (!['admin', 'analyst'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied. Only admins and analysts can export data.' });
  }

  next();
}; 