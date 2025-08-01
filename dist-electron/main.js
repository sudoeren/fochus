"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const utils_js_1 = require("./utils.js");
const client_1 = require("@prisma/client");
let mainWindow;
let prisma;
// Initialize Prisma
function initDatabase() {
    const databasePath = utils_js_1.isDev
        ? path_1.default.join(__dirname, '..', 'prisma', 'fokus.db')
        : path_1.default.join(electron_1.app.getPath('userData'), 'fokus.db');
    console.log('Database path:', databasePath);
    prisma = new client_1.PrismaClient({
        datasources: {
            db: {
                url: `file:${databasePath}`
            }
        }
    });
}
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path_1.default.join(__dirname, 'preload.js'),
        },
        titleBarStyle: 'default',
        show: false
    });
    // Load URL or file
    if (utils_js_1.isDev) {
        mainWindow.loadURL('http://localhost:5173');
        // DevTools sadece F12 ile açılacak
    }
    else {
        mainWindow.loadFile(path_1.default.join(__dirname, '../dist-renderer/index.html'));
    }
    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });
    // Handle window closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
// App event listeners
electron_1.app.whenReady().then(() => {
    initDatabase();
    createWindow();
    createMenu();
    setupGlobalShortcuts();
    setupDatabaseHandlers();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    electron_1.globalShortcut.unregisterAll();
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
// Setup global shortcuts
function setupGlobalShortcuts() {
    // Ctrl+N: Yeni not
    electron_1.globalShortcut.register('CommandOrControl+N', () => {
        if (mainWindow) {
            mainWindow.webContents.send('shortcut-new-note');
        }
    });
    // Ctrl+Shift+N: Yeni görev
    electron_1.globalShortcut.register('CommandOrControl+Shift+N', () => {
        if (mainWindow) {
            mainWindow.webContents.send('shortcut-new-task');
        }
    });
    // Ctrl+F: Arama
    electron_1.globalShortcut.register('CommandOrControl+F', () => {
        if (mainWindow) {
            mainWindow.webContents.send('shortcut-search');
        }
    });
    // Ctrl+1: Ana sayfa
    electron_1.globalShortcut.register('CommandOrControl+1', () => {
        if (mainWindow) {
            mainWindow.webContents.send('shortcut-navigate', 'home');
        }
    });
    // Ctrl+2: Notlar
    electron_1.globalShortcut.register('CommandOrControl+2', () => {
        if (mainWindow) {
            mainWindow.webContents.send('shortcut-navigate', 'notes');
        }
    });
    // Ctrl+3: Görevler
    electron_1.globalShortcut.register('CommandOrControl+3', () => {
        if (mainWindow) {
            mainWindow.webContents.send('shortcut-navigate', 'tasks');
        }
    });
    // Ctrl+4: Haftalık Planlayıcı
    electron_1.globalShortcut.register('CommandOrControl+4', () => {
        if (mainWindow) {
            mainWindow.webContents.send('shortcut-navigate', 'weekly');
        }
    });
    // Ctrl+K: Spotlight
    electron_1.globalShortcut.register('CommandOrControl+K', () => {
        if (mainWindow) {
            mainWindow.webContents.send('shortcut-spotlight');
        }
    });
}
// Menu creation
function createMenu() {
    const template = [
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
                        electron_1.app.quit();
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
    const menu = electron_1.Menu.buildFromTemplate(template);
    electron_1.Menu.setApplicationMenu(menu);
}
// IPC handlers
electron_1.ipcMain.handle('get-app-version', () => {
    return electron_1.app.getVersion();
});
electron_1.ipcMain.handle('show-notification', (_event, title, body) => {
    if (electron_1.Notification.isSupported()) {
        new electron_1.Notification({
            title,
            body
        }).show();
    }
});
// Database handlers
function setupDatabaseHandlers() {
    console.log('Setting up database handlers...');
    // Notes handlers
    electron_1.ipcMain.handle('db-get-notes', async () => {
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
        }
        catch (error) {
            console.error('Error getting notes:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('db-create-note', async (_event, data) => {
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
        }
        catch (error) {
            console.error('Error creating note:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('db-update-note', async (_event, id, data) => {
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
        }
        catch (error) {
            console.error('Error updating note:', error);
            throw error;
        }
    });
    // Pin/unpin note
    electron_1.ipcMain.handle('db-pin-note', async (_event, id, isPinned) => {
        try {
            return await prisma.note.update({
                where: { id },
                data: { isPinned }
            });
        }
        catch (error) {
            console.error('Error pinning note:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('db-delete-note', async (_event, id) => {
        try {
            // Soft delete - çöp kutusuna taşı
            await prisma.note.update({
                where: { id },
                data: {
                    isDeleted: true,
                    deletedAt: new Date()
                }
            });
        }
        catch (error) {
            console.error('Error deleting note:', error);
            throw error;
        }
    });
    // Trash/restore handlers for notes
    electron_1.ipcMain.handle('db-get-deleted-notes', async () => {
        try {
            return await prisma.note.findMany({
                where: { isDeleted: true },
                orderBy: { deletedAt: 'desc' }
            });
        }
        catch (error) {
            console.error('Error getting deleted notes:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('db-restore-note', async (_event, id) => {
        try {
            return await prisma.note.update({
                where: { id },
                data: {
                    isDeleted: false,
                    deletedAt: null
                }
            });
        }
        catch (error) {
            console.error('Error restoring note:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('db-permanently-delete-note', async (_event, id) => {
        try {
            await prisma.note.delete({ where: { id } });
        }
        catch (error) {
            console.error('Error permanently deleting note:', error);
            throw error;
        }
    });
    // Tasks handlers
    electron_1.ipcMain.handle('db-get-tasks', async () => {
        try {
            return await prisma.task.findMany({
                where: { isDeleted: false },
                orderBy: [
                    { isPinned: 'desc' },
                    { createdAt: 'desc' }
                ]
            });
        }
        catch (error) {
            console.error('Error getting tasks:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('db-create-task', async (_event, data) => {
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
        }
        catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('db-update-task', async (_event, id, data) => {
        try {
            const updateData = {};
            if (data.title !== undefined)
                updateData.title = data.title;
            if (data.description !== undefined)
                updateData.description = data.description;
            if (data.isCompleted !== undefined)
                updateData.isCompleted = data.isCompleted;
            if (data.status !== undefined)
                updateData.status = data.status;
            if (data.dueDate !== undefined)
                updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
            if (data.order !== undefined)
                updateData.order = data.order; // ORDER FIELD EKLENDİ!
            if (data.isPinned !== undefined)
                updateData.isPinned = data.isPinned;
            if (data.listId !== undefined)
                updateData.listId = data.listId;
            if (data.priority !== undefined)
                updateData.priority = data.priority;
            if (data.hasReminder !== undefined)
                updateData.hasReminder = data.hasReminder;
            if (data.reminderAt !== undefined)
                updateData.reminderAt = data.reminderAt ? new Date(data.reminderAt) : null;
            if (data.isRecurring !== undefined)
                updateData.isRecurring = data.isRecurring;
            if (data.recurringType !== undefined)
                updateData.recurringType = data.recurringType;
            if (data.recurringInterval !== undefined)
                updateData.recurringInterval = data.recurringInterval;
            if (data.recurringDays !== undefined)
                updateData.recurringDays = data.recurringDays;
            if (data.recurringEndDate !== undefined)
                updateData.recurringEndDate = data.recurringEndDate ? new Date(data.recurringEndDate) : null;
            return await prisma.task.update({
                where: { id },
                data: updateData
            });
        }
        catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    });
    // Pin/unpin task
    electron_1.ipcMain.handle('db-pin-task', async (_event, id, isPinned) => {
        try {
            return await prisma.task.update({
                where: { id },
                data: { isPinned }
            });
        }
        catch (error) {
            console.error('Error pinning task:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('db-delete-task', async (_event, id) => {
        try {
            // Soft delete - çöp kutusuna taşı
            await prisma.task.update({
                where: { id },
                data: {
                    isDeleted: true,
                    deletedAt: new Date()
                }
            });
        }
        catch (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    });
    // Trash/restore handlers for tasks
    electron_1.ipcMain.handle('db-get-deleted-tasks', async () => {
        try {
            return await prisma.task.findMany({
                where: { isDeleted: true },
                orderBy: { deletedAt: 'desc' }
            });
        }
        catch (error) {
            console.error('Error getting deleted tasks:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('db-restore-task', async (_event, id) => {
        try {
            return await prisma.task.update({
                where: { id },
                data: {
                    isDeleted: false,
                    deletedAt: null
                }
            });
        }
        catch (error) {
            console.error('Error restoring task:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('db-permanently-delete-task', async (_event, id) => {
        try {
            await prisma.task.delete({ where: { id } });
        }
        catch (error) {
            console.error('Error permanently deleting task:', error);
            throw error;
        }
    });
    // Task List handlers
    electron_1.ipcMain.handle('db-get-task-lists', async () => {
        try {
            return await prisma.taskList.findMany({
                where: { isDeleted: false },
                include: {
                    tasks: {
                        where: { isDeleted: false },
                        orderBy: { order: 'asc' }
                    }
                },
                orderBy: { order: 'asc' }
            });
        }
        catch (error) {
            console.error('Error getting task lists:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('db-create-task-list', async (_event, data) => {
        try {
            // Get max order
            const maxOrderResult = await prisma.taskList.aggregate({
                where: { isDeleted: false },
                _max: { order: true }
            });
            const maxOrder = maxOrderResult._max.order || -1;
            return await prisma.taskList.create({
                data: {
                    title: data.title,
                    description: data.description,
                    color: data.color || '#6B7280',
                    order: maxOrder + 1
                },
                include: {
                    tasks: {
                        where: { isDeleted: false },
                        orderBy: { order: 'asc' }
                    }
                }
            });
        }
        catch (error) {
            console.error('Error creating task list:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('db-update-task-list', async (_event, id, data) => {
        try {
            return await prisma.taskList.update({
                where: { id },
                data,
                include: {
                    tasks: {
                        where: { isDeleted: false },
                        orderBy: { order: 'asc' }
                    }
                }
            });
        }
        catch (error) {
            console.error('Error updating task list:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('db-delete-task-list', async (_event, id) => {
        try {
            return await prisma.taskList.update({
                where: { id },
                data: { isDeleted: true }
            });
        }
        catch (error) {
            console.error('Error deleting task list:', error);
            throw error;
        }
    });
}
