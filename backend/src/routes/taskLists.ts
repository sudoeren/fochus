import { Router, Response } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

// Validation Schema
const taskListSchema = z.object({
  title: z.string().min(1, 'Başlık gerekli'),
  description: z.string().optional(),
  color: z.string().optional().default('#3B82F6')
});

// GET /api/task-lists - Get all task lists
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const lists = await prisma.taskList.findMany({
      where: {
        userId: req.user!.id,
        isDeleted: false
      },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: {
            tasks: {
              where: { isDeleted: false }
            }
          }
        }
      }
    });

    res.json(lists);
  } catch (error) {
    console.error('Get task lists error:', error);
    res.status(500).json({ error: 'Listeler yüklenirken bir hata oluştu' });
  }
});

// GET /api/task-lists/:id - Get single task list with tasks
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const list = await prisma.taskList.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      },
      include: {
        tasks: {
          where: { isDeleted: false },
          orderBy: [
            { isPinned: 'desc' },
            { order: 'asc' }
          ]
        }
      }
    });

    if (!list) {
      return res.status(404).json({ error: 'Liste bulunamadı' });
    }

    res.json(list);
  } catch (error) {
    console.error('Get task list error:', error);
    res.status(500).json({ error: 'Liste yüklenirken bir hata oluştu' });
  }
});

// POST /api/task-lists - Create task list
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const validation = taskListSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: validation.error.issues[0].message 
      });
    }

    // Get max order
    const maxOrder = await prisma.taskList.aggregate({
      where: { userId: req.user!.id },
      _max: { order: true }
    });

    const list = await prisma.taskList.create({
      data: {
        ...validation.data,
        order: (maxOrder._max.order || 0) + 1,
        userId: req.user!.id
      }
    });

    res.status(201).json(list);
  } catch (error) {
    console.error('Create task list error:', error);
    res.status(500).json({ error: 'Liste oluşturulurken bir hata oluştu' });
  }
});

// PUT /api/task-lists/:id - Update task list
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existingList = await prisma.taskList.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (!existingList) {
      return res.status(404).json({ error: 'Liste bulunamadı' });
    }

    const { title, description, color, order } = req.body;

    const list = await prisma.taskList.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        color,
        order
      }
    });

    res.json(list);
  } catch (error) {
    console.error('Update task list error:', error);
    res.status(500).json({ error: 'Liste güncellenirken bir hata oluştu' });
  }
});

// PUT /api/task-lists/reorder - Reorder lists
router.put('/reorder', async (req: AuthRequest, res: Response) => {
  try {
    const { listIds } = req.body;

    if (!Array.isArray(listIds)) {
      return res.status(400).json({ error: 'listIds dizisi gerekli' });
    }

    await Promise.all(
      listIds.map((id: string, index: number) =>
        prisma.taskList.updateMany({
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
    console.error('Reorder lists error:', error);
    res.status(500).json({ error: 'Sıralama güncellenirken bir hata oluştu' });
  }
});

// DELETE /api/task-lists/:id - Delete task list
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existingList = await prisma.taskList.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (!existingList) {
      return res.status(404).json({ error: 'Liste bulunamadı' });
    }

    // Soft delete the list
    await prisma.taskList.update({
      where: { id: req.params.id },
      data: { isDeleted: true }
    });

    // Remove listId from tasks (don't delete tasks)
    await prisma.task.updateMany({
      where: { listId: req.params.id },
      data: { listId: null }
    });

    res.json({ message: 'Liste silindi' });
  } catch (error) {
    console.error('Delete task list error:', error);
    res.status(500).json({ error: 'Liste silinirken bir hata oluştu' });
  }
});

export default router;
