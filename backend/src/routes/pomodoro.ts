import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// Validation Schema
const sessionSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
  duration: z.number().min(0),
  mode: z.enum(['work', 'shortBreak', 'longBreak']),
  completed: z.boolean().optional().default(false)
});

// GET /api/pomodoro - Get all sessions
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, limit } = req.query;

    const where: any = {
      userId: req.user!.id
    };

    if (startDate) {
      where.startTime = { gte: new Date(startDate as string) };
    }

    if (endDate) {
      where.startTime = { 
        ...where.startTime,
        lte: new Date(endDate as string) 
      };
    }

    const sessions = await prisma.pomodoroSession.findMany({
      where,
      orderBy: { startTime: 'desc' },
      take: limit ? parseInt(limit as string) : undefined
    });

    res.json(sessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Oturumlar yüklenirken bir hata oluştu' });
  }
});

// GET /api/pomodoro/stats - Get statistics
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const { period } = req.query; // week, month, all

    const now = new Date();
    let startDate: Date | undefined;

    if (period === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'month') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const where: any = {
      userId: req.user!.id,
      completed: true
    };

    if (startDate) {
      where.startTime = { gte: startDate };
    }

    // Total stats
    const totalStats = await prisma.pomodoroSession.aggregate({
      where,
      _count: true,
      _sum: { duration: true }
    });

    // Work sessions only
    const workStats = await prisma.pomodoroSession.aggregate({
      where: { ...where, mode: 'work' },
      _count: true,
      _sum: { duration: true }
    });

    // Daily breakdown (last 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekSessions = await prisma.pomodoroSession.findMany({
      where: {
        userId: req.user!.id,
        completed: true,
        startTime: {
          gte: sevenDaysAgo
        }
      },
      select: {
        startTime: true,
        duration: true
      }
    });

    const dailyStatsMap = new Map<string, { count: number; total_duration: number }>();

    lastWeekSessions.forEach(session => {
      const dateKey = session.startTime.toISOString().split('T')[0];
      const entry = dailyStatsMap.get(dateKey) || { count: 0, total_duration: 0 };
      entry.count += 1;
      entry.total_duration += session.duration;
      dailyStatsMap.set(dateKey, entry);
    });

    const dailyStats = Array.from(dailyStatsMap.entries())
      .map(([date, stats]) => ({
        date,
        count: stats.count,
        total_duration: stats.total_duration
      }))
      .sort((a, b) => b.date.localeCompare(a.date));

    res.json({
      total: {
        sessions: totalStats._count,
        duration: totalStats._sum.duration || 0
      },
      work: {
        sessions: workStats._count,
        duration: workStats._sum.duration || 0
      },
      daily: dailyStats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'İstatistikler yüklenirken bir hata oluştu' });
  }
});

// POST /api/pomodoro - Create session
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const validation = sessionSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: validation.error.errors[0].message 
      });
    }

    const data = validation.data;

    const session = await prisma.pomodoroSession.create({
      data: {
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        duration: data.duration,
        mode: data.mode,
        completed: data.completed,
        userId: req.user!.id
      }
    });

    res.status(201).json(session);
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Oturum kaydedilirken bir hata oluştu' });
  }
});

// DELETE /api/pomodoro/:id - Delete session
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existingSession = await prisma.pomodoroSession.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (!existingSession) {
      return res.status(404).json({ error: 'Oturum bulunamadı' });
    }

    await prisma.pomodoroSession.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Oturum silindi' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Oturum silinirken bir hata oluştu' });
  }
});

export default router;
