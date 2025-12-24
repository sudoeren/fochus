import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';

export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Oturum açmanız gerekiyor' });
    }

    // Note: req.user is populated in auth middleware, but might not have 'role'
    // if the token payload or db query there didn't include it.
    // However, we will update auth middleware or query here to be sure.
    // For performance, let's assume auth middleware attaches the user object from DB
    // OR we trust the token if we put role in it.
    // Let's check the DB fresh to be safe for admin actions.
    
    // Check role from the user object attached by authenticate middleware
    // We need to ensure authenticate middleware selects 'role'
    if ((user as any).role !== 'ADMIN') {
      return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Yetki kontrolü sırasında hata oluştu' });
  }
};
