import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// Validation Schemas
const taskSchema = z.object({
  title: z.string().min(1, 'Başlık gerekli'),
  description: z.string().optional(),
  dueDate: z.string().optional().nullable(),
  listId: z.string().optional().nullable(),
  isPinned: z.boolean().optional().default(false),
  hasReminder: z.boolean().optional().default(false),
  reminderAt: z.string().optional().nullable(),
  isRecurring: z.boolean().optional().default(false),
  recurringType: z.string().optional().nullable(),
  recurringInterval: z.number().optional().nullable(),
  recurringDays: z.string().optional().nullable(),
  linkedNoteId: z.string().optional().nullable()
});

const taskUpdateSchema = z.object({
  title: z.string().min(1, 'Başlık gerekli').optional(),
  description: z.string().optional(),
  dueDate: z.string().optional().nullable(),
  listId: z.string().optional().nullable(),
  isPinned: z.boolean().optional(),
  isCompleted: z.boolean().optional(),
  status: z.string().optional(),
  hasReminder: z.boolean().optional(),
  reminderAt: z.string().optional().nullable(),
  isRecurring: z.boolean().optional(),
  recurringType: z.string().optional().nullable(),
  recurringInterval: z.number().optional().nullable(),
  recurringDays: z.string().optional().nullable(),
  linkedNoteId: z.string().optional().nullable(),
  order: z.number().optional()
});

// GET /api/tasks - Get all tasks
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { listId, completed } = req.query;

    const where: any = {
      userId: req.user!.id,
      isDeleted: false
    };

    if (listId) {
      where.listId = listId as string;
    }

    if (completed !== undefined) {
      where.isCompleted = completed === 'true';
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [
        { isPinned: 'desc' },
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
      include: {
        list: {
          select: {
            id: true,
            title: true,
            color: true
          }
        }
      }
    });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

// GET /api/tasks/deleted - Get deleted tasks
router.get('/deleted', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        userId: req.user!.id,
        isDeleted: true
      },
      orderBy: { deletedAt: 'desc' }
    });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

// GET /api/tasks/:id - Get single task with subtasks
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      },
      include: {
        list: true,
        linkedNote: true,
        subtasks: {
          where: { isDeleted: false },
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Görev bulunamadı' });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
});

// POST /api/tasks - Create task
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validation = taskSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: validation.error.issues[0].message 
      });
    }

    const data = validation.data;

    // Get max order
    const maxOrder = await prisma.task.aggregate({
      where: { userId: req.user!.id },
      _max: { order: true }
    });

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        listId: data.listId,
        isPinned: data.isPinned,
        hasReminder: data.hasReminder,
        reminderAt: data.reminderAt ? new Date(data.reminderAt) : null,
        isRecurring: data.isRecurring,
        recurringType: data.recurringType,
        recurringInterval: data.recurringInterval,
        recurringDays: data.recurringDays,
        linkedNoteId: data.linkedNoteId,
        order: (maxOrder._max.order || 0) + 1,
        userId: req.user!.id
      },
      include: {
        list: {
          select: {
            id: true,
            title: true,
            color: true
          }
        }
      }
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

// PUT /api/tasks/reorder - Reorder tasks
router.put('/reorder', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { taskIds } = req.body;

    if (!Array.isArray(taskIds)) {
      return res.status(400).json({ error: 'taskIds dizisi gerekli' });
    }

    // Update order for each task
    await Promise.all(
      taskIds.map((id: string, index: number) =>
        prisma.task.updateMany({
          where: {
            id,
            userId: req.user!.id
          },
          data: { order: index }
        })
      )
    );

    res.json({ message: 'Sıralama güncellendi' });
  } catch (error) {
    next(error);
  }
});

// PUT /api/tasks/:id - Update task
router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validation = taskUpdateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: validation.error.issues[0].message 
      });
    }

    const existingTask = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Görev bulunamadı' });
    }

    const { 
      title, 
      description, 
      dueDate, 
      listId, 
      isPinned,
      isCompleted,
      status,
      hasReminder,
      reminderAt,
      isRecurring,
      recurringType,
      recurringInterval,
      recurringDays,
      linkedNoteId,
      order
    } = validation.data;

    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (listId !== undefined) updateData.listId = listId;
    if (isPinned !== undefined) updateData.isPinned = isPinned;
    if (order !== undefined) updateData.order = order;
    if (hasReminder !== undefined) updateData.hasReminder = hasReminder;
    if (reminderAt !== undefined) updateData.reminderAt = reminderAt ? new Date(reminderAt) : null;
    if (isRecurring !== undefined) updateData.isRecurring = isRecurring;
    if (recurringType !== undefined) updateData.recurringType = recurringType;
    if (recurringInterval !== undefined) updateData.recurringInterval = recurringInterval;
    if (recurringDays !== undefined) updateData.recurringDays = recurringDays;
    if (linkedNoteId !== undefined) updateData.linkedNoteId = linkedNoteId;

    // Handle completion
    if (isCompleted !== undefined) {
      updateData.isCompleted = isCompleted;
      updateData.status = isCompleted ? 'COMPLETED' : 'PENDING';
      if (isCompleted) {
        updateData.lastCompleted = new Date();
      }
    }

    if (status !== undefined) {
      updateData.status = status;
      updateData.isCompleted = status === 'COMPLETED';
    }

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        list: {
          select: {
            id: true,
            title: true,
            color: true
          }
        }
      }
    });

    res.json(task);
  } catch (error) {
    next(error);
  }
});

// PUT /api/tasks/:id/toggle - Toggle task completion
router.put('/:id/toggle', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existingTask = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Görev bulunamadı' });
    }

    const isCompleting = !existingTask.isCompleted;

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        isCompleted: isCompleting,
        status: isCompleting ? 'COMPLETED' : 'PENDING',
        lastCompleted: isCompleting ? new Date() : existingTask.lastCompleted
      }
    });

    // Recurring task engine: create next occurrence when completing
    if (isCompleting && existingTask.isRecurring && existingTask.recurringType) {
      const now = new Date();
      let nextDue: Date;

      switch (existingTask.recurringType) {
        case 'DAILY':
          nextDue = new Date(now);
          nextDue.setDate(nextDue.getDate() + (existingTask.recurringInterval || 1));
          break;
        case 'WEEKLY':
          nextDue = new Date(now);
          nextDue.setDate(nextDue.getDate() + 7 * (existingTask.recurringInterval || 1));
          break;
        case 'MONTHLY':
          nextDue = new Date(now);
          nextDue.setMonth(nextDue.getMonth() + (existingTask.recurringInterval || 1));
          break;
        default:
          nextDue = now;
      }

      await prisma.task.create({
        data: {
          title: existingTask.title,
          description: existingTask.description,
          status: 'PENDING',
          dueDate: nextDue,
          listId: existingTask.listId,
          isPinned: false,
          order: existingTask.order,
          isRecurring: existingTask.isRecurring,
          recurringType: existingTask.recurringType,
          recurringInterval: existingTask.recurringInterval,
          recurringDays: existingTask.recurringDays,
          linkedNoteId: existingTask.linkedNoteId,
          nextDue,
          userId: existingTask.userId
        }
      });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
});

// POST /api/tasks/:id/subtasks - Create subtask
router.post('/:id/subtasks', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const parentTask = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (!parentTask) {
      return res.status(404).json({ error: 'Görev bulunamadı' });
    }

    const validation = z.object({
      title: z.string().min(1, 'Başlık gerekli')
    }).safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({ error: validation.error.issues[0].message });
    }

    const subtask = await prisma.task.create({
      data: {
        title: validation.data.title,
        parentId: req.params.id,
        userId: req.user!.id
      }
    });

    res.status(201).json(subtask);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/tasks/:id - Soft delete task
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existingTask = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Görev bulunamadı' });
    }

    await prisma.task.update({
      where: { id: req.params.id },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    });

    res.json({ message: 'Görev silindi' });
  } catch (error) {
    next(error);
  }
});

// POST /api/tasks/:id/restore - Restore deleted task
router.post('/:id/restore', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existingTask = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id,
        isDeleted: true
      }
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Görev bulunamadı' });
    }

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        isDeleted: false,
        deletedAt: null
      }
    });

    res.json(task);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/tasks/:id/permanent - Permanently delete task
router.delete('/:id/permanent', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existingTask = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Görev bulunamadı' });
    }

    await prisma.task.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Görev kalıcı olarak silindi' });
  } catch (error) {
    next(error);
  }
});

export default router;
