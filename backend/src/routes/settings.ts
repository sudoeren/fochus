import { Router, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// GET /api/settings - Get user settings
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let settings = await prisma.userSettings.findUnique({
      where: { userId: req.user!.id }
    });

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
    next(error);
  }
});

// PUT /api/settings - Update user settings
router.put('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
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
    next(error);
  }
});

function extractArray(data: unknown, key: string): Record<string, unknown>[] {
  const val = (data as Record<string, unknown>)?.[key];
  return Array.isArray(val) ? val : [];
}

function normalizePayload(raw: unknown): {
  notes: Record<string, unknown>[];
  deletedNotes: Record<string, unknown>[];
  tasks: Record<string, unknown>[];
  deletedTasks: Record<string, unknown>[];
  taskLists: Record<string, unknown>[];
  settings: Record<string, unknown> | null;
  pomodoroSessions: Record<string, unknown>[];
} {
  const data = (raw as Record<string, unknown>)?.data ?? raw;
  return {
    notes: extractArray(data, 'notes'),
    deletedNotes: extractArray(data, 'deletedNotes'),
    tasks: extractArray(data, 'tasks'),
    deletedTasks: extractArray(data, 'deletedTasks'),
    taskLists: extractArray(data, 'taskLists'),
    settings: ((data as Record<string, unknown>)?.settings ?? null) as Record<string, unknown> | null,
    pomodoroSessions: extractArray(data, 'pomodoroSessions')
  };
}

// POST /api/settings/import - Import all user data (atomic)
router.post('/import', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const payload = normalizePayload(req.body);

    await prisma.$transaction(async (tx) => {
      // 1. Clear all existing user data
      await tx.pomodoroSession.deleteMany({ where: { userId } });
      await tx.task.deleteMany({ where: { userId } });
      await tx.note.deleteMany({ where: { userId } });
      await tx.taskList.deleteMany({ where: { userId } });
      await tx.userSettings.deleteMany({ where: { userId } });

      // 2. Restore task lists (with original IDs)
      for (const list of payload.taskLists) {
        await tx.taskList.create({
          data: {
            id: String(list.id),
            title: String(list.title ?? ''),
            description: list.description != null ? String(list.description) : null,
            color: String(list.color ?? '#3B82F6'),
            order: typeof list.order === 'number' ? list.order : 0,
            isDeleted: Boolean(list.isDeleted ?? false),
            createdAt: list.createdAt ? new Date(String(list.createdAt)) : undefined,
            updatedAt: list.updatedAt ? new Date(String(list.updatedAt)) : undefined,
            userId
          }
        });
      }

      // 3. Restore notes (with original IDs, including deleted)
      const allNotes = [...payload.notes, ...payload.deletedNotes];
      for (const note of allNotes) {
        const deletedAt = note.deletedAt ? new Date(String(note.deletedAt)) : null;
        await tx.note.create({
          data: {
            id: String(note.id),
            title: String(note.title ?? ''),
            content: String(note.content ?? ''),
            isPinned: Boolean(note.isPinned ?? false),
            isDeleted: Boolean(note.isDeleted ?? false),
            deletedAt: Boolean(note.isDeleted ?? false) ? deletedAt : null,
            createdAt: note.createdAt ? new Date(String(note.createdAt)) : undefined,
            updatedAt: note.updatedAt ? new Date(String(note.updatedAt)) : undefined,
            userId
          }
        });
      }

      // 4. Restore tasks (with original IDs — two passes to handle subtask parentId)
      const allTasks = [...payload.tasks, ...payload.deletedTasks];
      const subtaskPairs: { id: string; parentId: string }[] = [];

      for (const task of allTasks) {
        const dueDate = task.dueDate ? new Date(String(task.dueDate)) : null;
        const reminderAt = task.reminderAt ? new Date(String(task.reminderAt)) : null;
        const lastCompleted = task.lastCompleted ? new Date(String(task.lastCompleted)) : null;
        const nextDue = task.nextDue ? new Date(String(task.nextDue)) : null;
        const deletedAt = task.deletedAt ? new Date(String(task.deletedAt)) : null;

        const parentId = task.parentId ? String(task.parentId) : null;

        if (parentId) {
          subtaskPairs.push({ id: String(task.id), parentId });
        }

        await tx.task.create({
          data: {
            id: String(task.id),
            title: String(task.title ?? ''),
            description: task.description != null ? String(task.description) : null,
            status: String(task.status ?? 'PENDING'),
            dueDate,
            isCompleted: Boolean(task.isCompleted ?? false),
            isPinned: Boolean(task.isPinned ?? false),
            isDeleted: Boolean(task.isDeleted ?? false),
            deletedAt: Boolean(task.isDeleted ?? false) ? deletedAt : null,
            order: typeof task.order === 'number' ? task.order : 0,
            createdAt: task.createdAt ? new Date(String(task.createdAt)) : undefined,
            updatedAt: task.updatedAt ? new Date(String(task.updatedAt)) : undefined,
            hasReminder: Boolean(task.hasReminder ?? false),
            reminderAt,
            isRecurring: Boolean(task.isRecurring ?? false),
            recurringType: task.recurringType ? String(task.recurringType) : null,
            recurringInterval: typeof task.recurringInterval === 'number' ? task.recurringInterval : null,
            recurringDays: task.recurringDays ? String(task.recurringDays) : null,
            lastCompleted,
            nextDue,
            userId,
            listId: task.listId ? String(task.listId) : null,
            linkedNoteId: task.linkedNoteId ? String(task.linkedNoteId) : null,
            parentId: null
          }
        });
      }

      // Second pass: set subtask parentId references
      for (const { id, parentId } of subtaskPairs) {
        await tx.task.update({
          where: { id },
          data: { parentId }
        });
      }

      // 5. Restore settings
      if (payload.settings) {
        await tx.userSettings.create({
          data: {
            userId,
            theme: String(payload.settings.theme ?? 'system'),
            language: String(payload.settings.language ?? 'tr')
          }
        });
      }

      // 6. Restore pomodoro sessions
      for (const session of payload.pomodoroSessions) {
        await tx.pomodoroSession.create({
          data: {
            id: String(session.id),
            startTime: new Date(String(session.startTime)),
            endTime: new Date(String(session.endTime)),
            duration: Number(session.duration ?? 0),
            mode: String(session.mode ?? 'work'),
            completed: Boolean(session.completed ?? true),
            createdAt: session.createdAt ? new Date(String(session.createdAt)) : undefined,
            userId
          }
        });
      }
    });

    res.json({ message: 'Veriler başarıyla geri yüklendi' });
  } catch (error) {
    next(error);
  }
});

// GET /api/settings/export - Export all user data
router.get('/export', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const [notes, deletedNotes, taskLists, allTasks, deletedTasks, settings, pomodoroSessions] =
      await Promise.all([
        prisma.note.findMany({ where: { userId, isDeleted: false } }),
        prisma.note.findMany({ where: { userId, isDeleted: true } }),
        prisma.taskList.findMany({
          where: { userId, isDeleted: false },
          include: { tasks: { where: { isDeleted: false } } }
        }),
        prisma.task.findMany({ where: { userId, isDeleted: false } }),
        prisma.task.findMany({ where: { userId, isDeleted: true } }),
        prisma.userSettings.findUnique({ where: { userId } }),
        prisma.pomodoroSession.findMany({ where: { userId } })
      ]);

    const exportData = {
      version: '1.1.0',
      exportedAt: new Date().toISOString(),
      notes,
      deletedNotes,
      tasks: allTasks,
      deletedTasks,
      taskLists,
      settings: settings ?? null,
      pomodoroSessions
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=fokus-export-${userId}-${Date.now()}.json`
    );
    res.json(exportData);
  } catch (error) {
    next(error);
  }
});

export default router;
