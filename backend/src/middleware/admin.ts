import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ error: 'Oturum açmanız gerekiyor' });
  }

  if (user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
  }

  next();
};
