import { Router, Response, NextFunction } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Validation Schema
const noteSchema = z.object({
  title: z.string().min(1, 'Başlık gerekli'),
  content: z.string().optional().default(''),
  isPinned: z.boolean().optional().default(false)
});

// GET /api/notes - Get all notes
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notes = await prisma.note.findMany({
      where: {
        userId: req.user!.id,
        isDeleted: false
      },
      orderBy: [
        { isPinned: 'desc' },
        { updatedAt: 'desc' }
      ]
    });

    res.json(notes);
  } catch (error) {
    next(error);
  }
});

// GET /api/notes/deleted - Get deleted notes
router.get('/deleted', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const notes = await prisma.note.findMany({
      where: {
        userId: req.user!.id,
        isDeleted: true
      },
      orderBy: { deletedAt: 'desc' }
    });

    res.json(notes);
  } catch (error) {
    next(error);
  }
});

// GET /api/notes/:id - Get single note
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const note = await prisma.note.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (!note) {
      return res.status(404).json({ error: 'Not bulunamadı' });
    }

    res.json(note);
  } catch (error) {
    next(error);
  }
});

// POST /api/notes - Create note
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const validation = noteSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ 
        error: validation.error.issues[0].message 
      });
    }

    const note = await prisma.note.create({
      data: {
        ...validation.data,
        userId: req.user!.id
      }
    });

    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
});

// PUT /api/notes/:id - Update note
router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existingNote = await prisma.note.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (!existingNote) {
      return res.status(404).json({ error: 'Not bulunamadı' });
    }

    const { title, content, isPinned } = req.body;

    const note = await prisma.note.update({
      where: { id: req.params.id },
      data: {
        title,
        content,
        isPinned
      }
    });

    res.json(note);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/notes/:id - Soft delete note
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existingNote = await prisma.note.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (!existingNote) {
      return res.status(404).json({ error: 'Not bulunamadı' });
    }

    await prisma.note.update({
      where: { id: req.params.id },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    });

    res.json({ message: 'Not silindi' });
  } catch (error) {
    next(error);
  }
});

// POST /api/notes/:id/restore - Restore deleted note
router.post('/:id/restore', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existingNote = await prisma.note.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id,
        isDeleted: true
      }
    });

    if (!existingNote) {
      return res.status(404).json({ error: 'Not bulunamadı' });
    }

    const note = await prisma.note.update({
      where: { id: req.params.id },
      data: {
        isDeleted: false,
        deletedAt: null
      }
    });

    res.json(note);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/notes/:id/permanent - Permanently delete note
router.delete('/:id/permanent', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const existingNote = await prisma.note.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.id
      }
    });

    if (!existingNote) {
      return res.status(404).json({ error: 'Not bulunamadı' });
    }

    await prisma.note.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Not kalıcı olarak silindi' });
  } catch (error) {
    next(error);
  }
});

export default router;
