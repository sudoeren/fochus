import { app, BrowserWindow, Menu, ipcMain, Notification, globalShortcut } from 'electron';
import path from 'path';
import { isDev } from './utils.js';
import { PrismaClient } from '@prisma/client';

let mainWindow: BrowserWindow;
let prisma: PrismaClient;

// Initialize Prisma
function initDatabase() {
  const databasePath = isDev 
    ? path.join(__dirname, '..', 'prisma', 'fokus.db')
    : path.join(app.getPath('userData'), 'fokus.db');
    
  console.log('Database path:', databasePath);
    
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: `file:${databasePath}`
      }
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'default',
    show: false
  });

  // Load URL or file
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // DevTools sadece F12 ile açılacak
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist-renderer/index.html'));
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null as any;
  });
}

// App event listeners
app.whenReady().then(() => {
  initDatabase();
  createWindow();
  createMenu();
  setupGlobalShortcuts();
  setupDatabaseHandlers();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  globalShortcut.unregisterAll();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Setup global shortcuts
function setupGlobalShortcuts() {
  // Ctrl+N: Yeni not
  globalShortcut.register('CommandOrControl+N', () => {
    if (mainWindow) {
      mainWindow.webContents.send('shortcut-new-note');
    }
  });

  // Ctrl+Shift+N: Yeni görev
  globalShortcut.register('CommandOrControl+Shift+N', () => {
    if (mainWindow) {
      mainWindow.webContents.send('shortcut-new-task');
    }
  });

  // Ctrl+F: Arama
  globalShortcut.register('CommandOrControl+F', () => {
    if (mainWindow) {
      mainWindow.webContents.send('shortcut-search');
    }
  });

  // Ctrl+1: Ana sayfa
  globalShortcut.register('CommandOrControl+1', () => {
    if (mainWindow) {
      mainWindow.webContents.send('shortcut-navigate', 'home');
    }
  });

  // Ctrl+2: Notlar
  globalShortcut.register('CommandOrControl+2', () => {
    if (mainWindow) {
      mainWindow.webContents.send('shortcut-navigate', 'notes');
    }
  });

  // Ctrl+3: Görevler
  globalShortcut.register('CommandOrControl+3', () => {
    if (mainWindow) {
      mainWindow.webContents.send('shortcut-navigate', 'tasks');
    }
  });

  // Ctrl+4: Haftalık Planlayıcı
  globalShortcut.register('CommandOrControl+4', () => {
    if (mainWindow) {
      mainWindow.webContents.send('shortcut-navigate', 'weekly');
    }
  });
}

// Menu creation
function createMenu() {
  const template: any = [
    {
      label: 'Fokus',
      submenu: [
        {
          label: 'Hakkında',
          role: 'about'
        },
        { type: 'separator' },
        {
          label: 'Çıkış',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Düzenle',
      submenu: [
        { label: 'Geri Al', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
        { label: 'Yinele', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Kes', accelerator: 'CmdOrCtrl+X', role: 'cut' },
        { label: 'Kopyala', accelerator: 'CmdOrCtrl+C', role: 'copy' },
        { label: 'Yapıştır', accelerator: 'CmdOrCtrl+V', role: 'paste' }
      ]
    },
    {
      label: 'Görünüm',
      submenu: [
        { label: 'Yenile', accelerator: 'CmdOrCtrl+R', role: 'reload' },
        { label: 'Geliştirici Araçları', accelerator: 'F12', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: 'Tam Ekran', accelerator: 'F11', role: 'togglefullscreen' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('show-notification', (_event, title: string, body: string) => {
  if (Notification.isSupported()) {
    new Notification({
      title,
      body
    }).show();
  }
});

// Database handlers
function setupDatabaseHandlers() {
  console.log('Setting up database handlers...');
  
  // Notes handlers
  ipcMain.handle('db-get-notes', async () => {
    console.log('db-get-notes called');
    try {
      const notes = await prisma.note.findMany({
        where: { isDeleted: false },
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' }
        ]
      });
      console.log('Notes retrieved:', notes.length);
      return notes;
    } catch (error) {
      console.error('Error getting notes:', error);
      throw error;
    }
  });

  ipcMain.handle('db-create-note', async (_event, data) => {
    console.log('db-create-note called with:', data);
    try {
      const note = await prisma.note.create({
        data: {
          title: data.title,
          content: data.content,
          tags: JSON.stringify(data.tags),
          isPinned: data.isPinned || false
        }
      });
      console.log('Note created:', note.id);
      return note;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  });

  ipcMain.handle('db-update-note', async (_event, id: string, data) => {
    try {
      return await prisma.note.update({
        where: { id },
        data: {
          title: data.title,
          content: data.content,
          tags: JSON.stringify(data.tags),
          ...(data.isPinned !== undefined && { isPinned: data.isPinned })
        }
      });
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  });

  // Pin/unpin note
  ipcMain.handle('db-pin-note', async (_event, id: string, isPinned: boolean) => {
    try {
      return await prisma.note.update({
        where: { id },
        data: { isPinned }
      });
    } catch (error) {
      console.error('Error pinning note:', error);
      throw error;
    }
  });

  ipcMain.handle('db-delete-note', async (_event, id: string) => {
    try {
      // Soft delete - çöp kutusuna taşı
      await prisma.note.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  });

  // Trash/restore handlers for notes
  ipcMain.handle('db-get-deleted-notes', async () => {
    try {
      return await prisma.note.findMany({
        where: { isDeleted: true },
        orderBy: { deletedAt: 'desc' }
      });
    } catch (error) {
      console.error('Error getting deleted notes:', error);
      throw error;
    }
  });

  ipcMain.handle('db-restore-note', async (_event, id: string) => {
    try {
      return await prisma.note.update({
        where: { id },
        data: {
          isDeleted: false,
          deletedAt: null
        }
      });
    } catch (error) {
      console.error('Error restoring note:', error);
      throw error;
    }
  });

  ipcMain.handle('db-permanently-delete-note', async (_event, id: string) => {
    try {
      await prisma.note.delete({ where: { id } });
    } catch (error) {
      console.error('Error permanently deleting note:', error);
      throw error;
    }
  });

  // Tasks handlers
  ipcMain.handle('db-get-tasks', async () => {
    try {
      return await prisma.task.findMany({
        where: { isDeleted: false },
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' }
        ]
      });
    } catch (error) {
      console.error('Error getting tasks:', error);
      throw error;
    }
  });

  ipcMain.handle('db-create-task', async (_event, data) => {
    try {
      return await prisma.task.create({
        data: {
          title: data.title,
          description: data.description || null,
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
          isCompleted: false,
          status: 'PENDING'
        }
      });
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  });

  ipcMain.handle('db-update-task', async (_event, id: string, data) => {
    try {
      const updateData: any = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.isCompleted !== undefined) updateData.isCompleted = data.isCompleted;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;

      return await prisma.task.update({
        where: { id },
        data: updateData
      });
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  });

  // Pin/unpin task
  ipcMain.handle('db-pin-task', async (_event, id: string, isPinned: boolean) => {
    try {
      return await prisma.task.update({
        where: { id },
        data: { isPinned }
      });
    } catch (error) {
      console.error('Error pinning task:', error);
      throw error;
    }
  });

  ipcMain.handle('db-delete-task', async (_event, id: string) => {
    try {
      // Soft delete - çöp kutusuna taşı
      await prisma.task.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  });

  // Trash/restore handlers for tasks
  ipcMain.handle('db-get-deleted-tasks', async () => {
    try {
      return await prisma.task.findMany({
        where: { isDeleted: true },
        orderBy: { deletedAt: 'desc' }
      });
    } catch (error) {
      console.error('Error getting deleted tasks:', error);
      throw error;
    }
  });

  ipcMain.handle('db-restore-task', async (_event, id: string) => {
    try {
      return await prisma.task.update({
        where: { id },
        data: {
          isDeleted: false,
          deletedAt: null
        }
      });
    } catch (error) {
      console.error('Error restoring task:', error);
      throw error;
    }
  });

  ipcMain.handle('db-permanently-delete-task', async (_event, id: string) => {
    try {
      await prisma.task.delete({ where: { id } });
    } catch (error) {
      console.error('Error permanently deleting task:', error);
      throw error;
    }
  });
}
