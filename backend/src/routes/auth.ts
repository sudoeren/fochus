import { Router, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import prisma from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { error: 'Çok fazla başarısız giriş denemesi, lütfen 15 dakika sonra tekrar deneyin' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation Schemas
const registerSchema = z.object({
  username: z.string().min(3, 'Kullanıcı adı en az 3 karakter olmalı'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
  name: z.string().optional()
});

const loginSchema = z.object({
  username: z.string().min(1, 'Kullanıcı adı gerekli'),
  password: z.string().min(1, 'Şifre gerekli')
});

// Generate JWT
const generateToken = (userId: string, username: string): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET ortam değişkeni tanımlanmamış!');
  }
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ userId, username }, secret, { expiresIn: expiresIn as any });
};

// POST /api/auth/register
router.post('/register', authLimiter, async (req, res: Response, next: NextFunction) => {
  try {
    // Check if registration is allowed
    const allowRegistration = process.env.ALLOW_REGISTRATION !== 'false';
    if (!allowRegistration) {
      return res.status(403).json({ error: 'Yeni kullanıcı kaydı devre dışı bırakılmıştır.' });
    }

    const validation = registerSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: validation.error.errors[0].message 
      });
    }

    const { username, password, name } = validation.data;

    // Check existing user
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Bu kullanıcı adı zaten alınmış' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        settings: {
          create: {
            theme: 'dark',
            language: 'tr'
          }
        }
      },
      select: {
        id: true,
        username: true,
        name: true,
        createdAt: true
      }
    });

    // Generate token
    const token = generateToken(user.id, user.username);

    res.status(201).json({
      user,
      token
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res: Response, next: NextFunction) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: validation.error.errors[0].message 
      });
    }

    const { username, password } = validation.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı' });
    }

    // Generate token
    const token = generateToken(user.id, user.username);

    res.json({
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        avatar: user.avatar
      },
      token
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const updateSchema = z.object({
      name: z.string().min(1).optional(),
      username: z.string().min(3).optional(),
      avatar: z.string().optional().nullable()
    });

    const validation = updateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Geçersiz profil bilgisi' });
    }

    const { name, username, avatar } = validation.data;

    if (username) {
      const existing = await prisma.user.findUnique({ where: { username } });
      if (existing && existing.id !== req.user!.id) {
        return res.status(400).json({ error: 'Bu kullanıcı adı zaten alınmış' });
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (username !== undefined) updateData.username = username;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true
      }
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// PUT /api/auth/password
router.put('/password', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Mevcut ve yeni şifre gerekli' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Yeni şifre en az 6 karakter olmalı' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);

    if (!isValid) {
      return res.status(401).json({ error: 'Mevcut şifre hatalı' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: req.user!.id },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Şifre başarıyla güncellendi' });
  } catch (error) {
    next(error);
  }
});

/*
// POST /api/auth/google
router.post('/google', async (req, res: Response) => {
  // Google auth implementation removed as it relies on email
  res.status(501).json({ error: 'Google girişi devre dışı bırakıldı' });
});
*/

export default router;