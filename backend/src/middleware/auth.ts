import { Request, Response, NextFunction } from 'express';
import { ParamsFlatDictionary } from 'express-serve-static-core';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

export interface AuthRequest extends Request<ParamsFlatDictionary> {
  user?: {
    id: string;
    username: string;
    role: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('');
  console.error('╔══════════════════════════════════════════════════════╗');
  console.error('║  FATAL: JWT_SECRET is not set!                      ║');
  console.error('║                                                     ║');
  console.error('║  Set it in backend/.env or the container env.       ║');
  console.error('║  With Docker self-hosted mode it is auto-generated. ║');
  console.error('╚══════════════════════════════════════════════════════╝');
  console.error('');
  process.exit(1);
}

const extractToken = (authHeader: unknown): string | null => {
  if (typeof authHeader !== 'string') return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  return parts[1];
};

const verifyAuth = (authHeader: unknown): { userId: string; username: string } => {
  const token = extractToken(authHeader);
  if (!token) {
    throw new Error('Missing token');
  }
  return jwt.verify(token, JWT_SECRET) as { userId: string; username: string };
};

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const decoded = verifyAuth(req.headers.authorization);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true, role: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'Kullanıcı bulunamadı' });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Geçersiz token' });
  }
};