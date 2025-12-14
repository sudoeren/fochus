import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message
    });
  }

  // Prisma errors (misconfig / connection / schema)
  // We treat these as operational and return actionable messages.
  const errName = (err as any)?.name as string | undefined;
  const errMessage = err?.message ?? '';
  if (errName?.startsWith('PrismaClient')) {
    if (errMessage.includes('Environment variable not found: DATABASE_URL')) {
      return res.status(500).json({
        error: 'DATABASE_URL ayarlı değil (backend/.env oluşturun)'
      });
    }

    if (
      errMessage.includes("Can't reach database server") ||
      errMessage.includes('Connection refused')
    ) {
      return res.status(503).json({
        error: 'Veritabanına bağlanılamadı (DB çalışıyor mu?)'
      });
    }

    if (
      errMessage.includes('does not exist in the current database') ||
      errMessage.includes('The table')
    ) {
      return res.status(500).json({
        error: 'Veritabanı tabloları yok (backend içinde `npm run db:push` çalıştırın)'
      });
    }
  }

  console.error('Unexpected error:', err);

  return res.status(500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Bir hata oluştu' 
      : err.message
  });
};
