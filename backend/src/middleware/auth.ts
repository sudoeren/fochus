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

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Yetkilendirme gerekli' });
    }

    const token = authHeader.split(' ')[1];
    
    if (!process.env.JWT_SECRET) {
      console.error('FATAL: JWT_SECRET ortam değişkeni tanımlanmamış!');
      return res.status(500).json({ error: 'Sunucu yapılandırma hatası' });
    }
    
    const secret = process.env.JWT_SECRET;

    const decoded = jwt.verify(token, secret) as { userId: string; username: string };

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