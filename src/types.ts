export interface ElectronAPI {
  getAppVersion: () => Promise<string>;
  showNotification: (title: string, body: string) => Promise<void>;
  database: {
    // Notes
    getNotes: () => Promise<Note[]>;
    createNote: (data: any) => Promise<Note>;
    updateNote: (id: string, data: any) => Promise<Note>;
    deleteNote: (id: string) => Promise<void>;
    pinNote: (id: string, isPinned: boolean) => Promise<Note>;
    getDeletedNotes: () => Promise<Note[]>;
    restoreNote: (id: string) => Promise<Note>;
    permanentlyDeleteNote: (id: string) => Promise<void>;

    // Tasks  
    getTasks: () => Promise<Task[]>;
    createTask: (data: any) => Promise<Task>;
    updateTask: (id: string, data: any) => Promise<Task>;
    deleteTask: (id: string) => Promise<void>;
    pinTask: (id: string, isPinned: boolean) => Promise<Task>;
    getDeletedTasks: () => Promise<Task[]>;
    restoreTask: (id: string) => Promise<Task>;
    permanentlyDeleteTask: (id: string) => Promise<void>;
  };
  
  // Shortcut handlers
  onShortcut: (callback: (event: string, data?: any) => void) => void;
  removeAllListeners: () => void;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  isPinned?: boolean;
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'PENDING' | 'COMPLETED' | 'POSTPONED';
  dueDate?: Date;
  isCompleted: boolean;
  isPinned?: boolean;
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'tr' | 'en';
}
