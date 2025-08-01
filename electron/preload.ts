import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  showNotification: (title: string, body: string) => 
    ipcRenderer.invoke('show-notification', title, body),

  // Database operations
  database: {
    // Notes
    getNotes: () => ipcRenderer.invoke('db-get-notes'),
    createNote: (data: any) => ipcRenderer.invoke('db-create-note', data),
    updateNote: (id: string, data: any) => ipcRenderer.invoke('db-update-note', id, data),
    deleteNote: (id: string) => ipcRenderer.invoke('db-delete-note', id),
    pinNote: (id: string, isPinned: boolean) => ipcRenderer.invoke('db-pin-note', id, isPinned),
    getDeletedNotes: () => ipcRenderer.invoke('db-get-deleted-notes'),
    restoreNote: (id: string) => ipcRenderer.invoke('db-restore-note', id),
    permanentlyDeleteNote: (id: string) => ipcRenderer.invoke('db-permanently-delete-note', id),

    // Tasks
    getTasks: () => ipcRenderer.invoke('db-get-tasks'),
    createTask: (data: any) => ipcRenderer.invoke('db-create-task', data),
    updateTask: (id: string, data: any) => ipcRenderer.invoke('db-update-task', id, data),
    deleteTask: (id: string) => ipcRenderer.invoke('db-delete-task', id),
    pinTask: (id: string, isPinned: boolean) => ipcRenderer.invoke('db-pin-task', id, isPinned),
    getDeletedTasks: () => ipcRenderer.invoke('db-get-deleted-tasks'),
    restoreTask: (id: string) => ipcRenderer.invoke('db-restore-task', id),
    permanentlyDeleteTask: (id: string) => ipcRenderer.invoke('db-permanently-delete-task', id),

    // Task Lists
    getTaskLists: () => ipcRenderer.invoke('db-get-task-lists'),
    createTaskList: (data: any) => ipcRenderer.invoke('db-create-task-list', data),
    updateTaskList: (id: string, data: any) => ipcRenderer.invoke('db-update-task-list', id, data),
    deleteTaskList: (id: string) => ipcRenderer.invoke('db-delete-task-list', id),
  },

  // Shortcut handlers
  onShortcut: (callback: (event: string, data?: any) => void) => {
    ipcRenderer.on('shortcut-new-note', () => callback('new-note'));
    ipcRenderer.on('shortcut-new-task', () => callback('new-task'));
    ipcRenderer.on('shortcut-search', () => callback('search'));
    ipcRenderer.on('shortcut-spotlight', () => callback('spotlight'));
    ipcRenderer.on('shortcut-navigate', (_, page) => callback('navigate', page));
  },
  
  removeAllListeners: () => {
    ipcRenderer.removeAllListeners('shortcut-new-note');
    ipcRenderer.removeAllListeners('shortcut-new-task'); 
    ipcRenderer.removeAllListeners('shortcut-search');
    ipcRenderer.removeAllListeners('shortcut-spotlight');
    ipcRenderer.removeAllListeners('shortcut-navigate');
  }
});

// Type definitions for TypeScript
declare global {
  interface Window {
    electronAPI: {
      getAppVersion: () => Promise<string>;
      showNotification: (title: string, body: string) => Promise<void>;
      database: {
        getNotes: () => Promise<any[]>;
        createNote: (data: any) => Promise<any>;
        updateNote: (id: string, data: any) => Promise<any>;
        deleteNote: (id: string) => Promise<void>;
        getTasks: () => Promise<any[]>;
        createTask: (data: any) => Promise<any>;
        updateTask: (id: string, data: any) => Promise<any>;
        deleteTask: (id: string) => Promise<void>;
        getTaskLists: () => Promise<any[]>;
        createTaskList: (data: any) => Promise<any>;
        updateTaskList: (id: string, data: any) => Promise<any>;
        deleteTaskList: (id: string) => Promise<void>;
      };
    };
  }
}
