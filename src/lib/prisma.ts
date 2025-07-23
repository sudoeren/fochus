import { PrismaClient } from '@prisma/client';
import path from 'path';

// Electron ortamında database dosyasının yolu
const getDatabaseUrl = () => {
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    // Development ortamında proje klasöründeki database
    return 'file:./prisma/fokus.db';
  } else {
    // Production ortamında kullanıcı data klasöründe database
    const { app } = require('electron');
    const userDataPath = app.getPath('userData');
    return `file:${path.join(userDataPath, 'fokus.db')}`;
  }
};

declare global {
  var __prisma: PrismaClient | undefined;
}

// Singleton pattern ile PrismaClient oluştur
const prisma = globalThis.__prisma || new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl()
    }
  }
});

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma;
}

export default prisma;
