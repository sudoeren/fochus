import { Router, Response } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// GET /api/settings - Get user settings
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    let settings = await prisma.userSettings.findUnique({
      where: { userId: req.user!.id }
    });

    // Create default settings if not exists
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId: req.user!.id,
          theme: 'system',
          language: 'tr'
        }
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Ayarlar yüklenirken bir hata oluştu' });
  }
});

// PUT /api/settings - Update user settings
router.put('/', async (req: AuthRequest, res: Response) => {
  try {
    const { theme, language } = req.body;

    const updateData: any = {};

    if (theme && ['light', 'dark', 'system'].includes(theme)) {
      updateData.theme = theme;
    }

    if (language && ['tr', 'en'].includes(language)) {
      updateData.language = language;
    }

    const settings = await prisma.userSettings.upsert({
      where: { userId: req.user!.id },
      update: updateData,
      create: {
        userId: req.user!.id,
        ...updateData
      }
    });

    res.json(settings);
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Ayarlar güncellenirken bir hata oluştu' });
  }
});

export default router;
