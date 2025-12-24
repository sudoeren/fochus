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

// GET /api/settings/export - Export all user data
router.get('/export', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const data = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        email: true, // If exists in schema
        createdAt: true,
        updatedAt: true,
        settings: true,
        notes: {
          where: { isDeleted: false }
        },
        taskLists: {
          where: { isDeleted: false },
          include: {
            tasks: {
              where: { isDeleted: false }
            }
          }
        },
        pomodoroSessions: true
      }
    });

    if (!data) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    // Tasks that are not in a list (orphaned or default list)
    const independentTasks = await prisma.task.findMany({
      where: {
        userId,
        listId: null,
        isDeleted: false
      }
    });

    const exportData = {
      ...data,
      independentTasks,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=fokus-export-${userId}-${Date.now()}.json`);
    res.json(exportData);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Veri dışa aktarılırken bir hata oluştu' });
  }
});

export default router;
