"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    getAppVersion: () => electron_1.ipcRenderer.invoke('get-app-version'),
    showNotification: (title, body) => electron_1.ipcRenderer.invoke('show-notification', title, body),
    // Database operations
    database: {
        // Notes
        getNotes: () => electron_1.ipcRenderer.invoke('db-get-notes'),
        createNote: (data) => electron_1.ipcRenderer.invoke('db-create-note', data),
        updateNote: (id, data) => electron_1.ipcRenderer.invoke('db-update-note', id, data),
        deleteNote: (id) => electron_1.ipcRenderer.invoke('db-delete-note', id),
        pinNote: (id, isPinned) => electron_1.ipcRenderer.invoke('db-pin-note', id, isPinned),
        getDeletedNotes: () => electron_1.ipcRenderer.invoke('db-get-deleted-notes'),
        restoreNote: (id) => electron_1.ipcRenderer.invoke('db-restore-note', id),
        permanentlyDeleteNote: (id) => electron_1.ipcRenderer.invoke('db-permanently-delete-note', id),
        // Tasks
        getTasks: () => electron_1.ipcRenderer.invoke('db-get-tasks'),
        createTask: (data) => electron_1.ipcRenderer.invoke('db-create-task', data),
        updateTask: (id, data) => electron_1.ipcRenderer.invoke('db-update-task', id, data),
        deleteTask: (id) => electron_1.ipcRenderer.invoke('db-delete-task', id),
        pinTask: (id, isPinned) => electron_1.ipcRenderer.invoke('db-pin-task', id, isPinned),
        getDeletedTasks: () => electron_1.ipcRenderer.invoke('db-get-deleted-tasks'),
        restoreTask: (id) => electron_1.ipcRenderer.invoke('db-restore-task', id),
        permanentlyDeleteTask: (id) => electron_1.ipcRenderer.invoke('db-permanently-delete-task', id),
        // Task Lists
        getTaskLists: () => electron_1.ipcRenderer.invoke('db-get-task-lists'),
        createTaskList: (data) => electron_1.ipcRenderer.invoke('db-create-task-list', data),
        updateTaskList: (id, data) => electron_1.ipcRenderer.invoke('db-update-task-list', id, data),
        deleteTaskList: (id) => electron_1.ipcRenderer.invoke('db-delete-task-list', id),
    },
    // Shortcut handlers
    onShortcut: (callback) => {
        electron_1.ipcRenderer.on('shortcut-new-note', () => callback('new-note'));
        electron_1.ipcRenderer.on('shortcut-new-task', () => callback('new-task'));
        electron_1.ipcRenderer.on('shortcut-search', () => callback('search'));
        electron_1.ipcRenderer.on('shortcut-spotlight', () => callback('spotlight'));
        electron_1.ipcRenderer.on('shortcut-navigate', (_, page) => callback('navigate', page));
    },
    removeAllListeners: () => {
        electron_1.ipcRenderer.removeAllListeners('shortcut-new-note');
        electron_1.ipcRenderer.removeAllListeners('shortcut-new-task');
        electron_1.ipcRenderer.removeAllListeners('shortcut-search');
        electron_1.ipcRenderer.removeAllListeners('shortcut-spotlight');
        electron_1.ipcRenderer.removeAllListeners('shortcut-navigate');
    }
});
