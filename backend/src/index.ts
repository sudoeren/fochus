import express from 'express';
import path from 'node:path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import notesRoutes from './routes/notes.js';
import tasksRoutes from './routes/tasks.js';
import taskListsRoutes from './routes/taskLists.js';
import pomodoroRoutes from './routes/pomodoro.js';
import settingsRoutes from './routes/settings.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5800;

// Global Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Çok fazla istek gönderdiniz, lütfen daha sonra tekrar deneyin.' }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(limiter);
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/task-lists', taskListsRoutes);
app.use('/api/pomodoro', pomodoroRoutes);
app.use('/api/settings', settingsRoutes);

// Serve built frontend in production (self-hosted mode)
if (process.env.NODE_ENV === 'production') {
  const publicDir = path.resolve(process.cwd(), 'public');
  app.use(express.static(publicDir));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}

// Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Fokus API running on http://localhost:${PORT}`);
});

export default app;
