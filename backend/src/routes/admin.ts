import { Router, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';

const router = Router();

// Protect all admin routes
router.use(authenticate);

// GET /api/admin/users - List all users
router.get('/users', requireAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            notes: true,
            tasks: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/users/:id - Delete a user
router.delete('/users/:id', requireAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (id === req.user!.id) {
      return res.status(400).json({ error: 'Kendinizi silemezsiniz' });
    }

    await prisma.user.delete({
      where: { id }
    });

    res.json({ message: 'Kullanıcı başarıyla silindi' });
  } catch (error) {
    next(error);
  }
});

// GET /api/admin/settings - Get system settings
router.get('/settings', requireAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let settings = await prisma.systemSettings.findFirst();

    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          allowRegistration: process.env.ALLOW_REGISTRATION !== 'false'
        }
      });
    }

    res.json(settings);
  } catch (error) {
    next(error);
  }
});

// PUT /api/admin/settings - Update system settings
router.put('/settings', requireAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { allowRegistration } = req.body;

    const settings = await prisma.systemSettings.findFirst();

    if (settings) {
      await prisma.systemSettings.update({
        where: { id: settings.id },
        data: { allowRegistration }
      });
    } else {
      await prisma.systemSettings.create({
        data: { allowRegistration }
      });
    }

    res.json({ message: 'Ayarlar güncellendi', allowRegistration });
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/promote/:id - Promote user to admin (Only accessible by other admins)
router.post('/promote/:id', requireAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    await prisma.user.update({
      where: { id },
      data: { role: 'ADMIN' }
    });

    res.json({ message: 'Kullanıcı yönetici yapıldı' });
  } catch (error) {
    next(error);
  }
});

export default router;
