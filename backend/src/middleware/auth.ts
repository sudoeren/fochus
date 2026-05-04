import { Request, Response, NextFunction } from 'express';
import { ParamsFlatDictionary } from 'express-serve-static-core';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

export interface AuthRequest extends Request<ParamsFlatDictionary> {
  user?: {
    id: string;
    username: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET ortam değişkeni tanımlanmamış!');
  process.exit(1);
}

const extractToken = (authHeader: unknown): string | null => {
  if (typeof authHeader !== 'string') return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  return parts[1];
};

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = extractToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({ error: 'Yetkilendirme gerekli' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; username: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true, role: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Kullanıcı bulunamadı' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Geçersiz token' });
  }
};