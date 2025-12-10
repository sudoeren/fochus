import { Task, Note, TaskList, PomodoroSession } from '../types';

const STORAGE_KEYS = {
  TASKS: 'fokus_tasks',
  NOTES: 'fokus_notes',
  TASK_LISTS: 'fokus_task_lists',
  SETTINGS: 'fokus_settings',
  POMODORO_SESSIONS: 'fokus_pomodoro_sessions'
};

const generateId = () => Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

// Helper to get data with date conversion
const getStoredData = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return [];
    return JSON.parse(data, (key, value) => {
      // Convert date strings back to Date objects
      if (key.endsWith('At') || key === 'dueDate' || key === 'lastCompleted' || key === 'nextDue' || key === 'startTime' || key === 'endTime') {
        return value ? new Date(value) : undefined;
      }
      return value;
    });
  } catch (e) {
    console.error(`Error reading ${key}`, e);
    return [];
  }
};

const setStoredData = (key: string, data: any[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const storageService = {
  // Tasks
  tasks: {
    getAll: async (): Promise<Task[]> => {
      return getStoredData<Task>(STORAGE_KEYS.TASKS).filter(t => !t.isDeleted);
    },
    getDeleted: async (): Promise<Task[]> => {
        return getStoredData<Task>(STORAGE_KEYS.TASKS).filter(t => t.isDeleted);
    },
    create: async (data: Partial<Task>): Promise<Task> => {
      const tasks = getStoredData<Task>(STORAGE_KEYS.TASKS);
      const newTask: Task = {
        id: generateId(),
        title: data.title || '',
        description: data.description || '',
        status: 'PENDING',
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        isPinned: false,
        order: tasks.length,
        listId: data.listId || null,
        hasReminder: false,
        isRecurring: false,
        recurringType: null,
        recurringInterval: null,
        recurringDays: null,
        linkedNoteId: null,
        ...data
      } as Task;
      tasks.push(newTask);
      setStoredData(STORAGE_KEYS.TASKS, tasks);
      return newTask;
    },
    update: async (id: string, data: Partial<Task>): Promise<Task> => {
      const tasks = getStoredData<Task>(STORAGE_KEYS.TASKS);
      const index = tasks.findIndex(t => t.id === id);
      if (index === -1) throw new Error('Task not found');
      
      const updatedTask = { ...tasks[index], ...data, updatedAt: new Date() };
      
      // Update status if isCompleted changes
      if (data.isCompleted !== undefined) {
          updatedTask.status = data.isCompleted ? 'COMPLETED' : 'PENDING';
      }

      tasks[index] = updatedTask;
      setStoredData(STORAGE_KEYS.TASKS, tasks);
      return updatedTask;
    },
    delete: async (id: string): Promise<void> => {
       const tasks = getStoredData<Task>(STORAGE_KEYS.TASKS);
       const index = tasks.findIndex(t => t.id === id);
       if (index !== -1) {
         tasks[index].isDeleted = true;
         tasks[index].deletedAt = new Date();
         setStoredData(STORAGE_KEYS.TASKS, tasks);
       }
    },
    restore: async (id: string): Promise<void> => {
        const tasks = getStoredData<Task>(STORAGE_KEYS.TASKS);
        const index = tasks.findIndex(t => t.id === id);
        if (index !== -1) {
          tasks[index].isDeleted = false;
          tasks[index].deletedAt = undefined;
          setStoredData(STORAGE_KEYS.TASKS, tasks);
        }
    },
    permanentlyDelete: async (id: string): Promise<void> => {
        let tasks = getStoredData<Task>(STORAGE_KEYS.TASKS);
        tasks = tasks.filter(t => t.id !== id);
        setStoredData(STORAGE_KEYS.TASKS, tasks);
    },
    pin: async (id: string, isPinned: boolean): Promise<Task> => {
      return storageService.tasks.update(id, { isPinned });
    }
  },
  // Notes
  notes: {
    getAll: async (): Promise<Note[]> => {
      return getStoredData<Note>(STORAGE_KEYS.NOTES).filter(n => !n.isDeleted);
    },
    getDeleted: async (): Promise<Note[]> => {
        return getStoredData<Note>(STORAGE_KEYS.NOTES).filter(n => n.isDeleted);
    },
    create: async (data: Partial<Note>): Promise<Note> => {
      const notes = getStoredData<Note>(STORAGE_KEYS.NOTES);
      const newNote: Note = {
        id: generateId(),
        title: data.title || '',
        content: data.content || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
        isPinned: false,
        ...data
      } as Note;
      notes.push(newNote);
      setStoredData(STORAGE_KEYS.NOTES, notes);
      return newNote;
    },
    update: async (id: string, data: Partial<Note>): Promise<Note> => {
      const notes = getStoredData<Note>(STORAGE_KEYS.NOTES);
      const index = notes.findIndex(n => n.id === id);
      if (index === -1) throw new Error('Note not found');
      
      const updatedNote = { ...notes[index], ...data, updatedAt: new Date() };
      notes[index] = updatedNote;
      setStoredData(STORAGE_KEYS.NOTES, notes);
      return updatedNote;
    },
    delete: async (id: string): Promise<void> => {
       const notes = getStoredData<Note>(STORAGE_KEYS.NOTES);
       const index = notes.findIndex(n => n.id === id);
       if (index !== -1) {
         notes[index].isDeleted = true;
         notes[index].deletedAt = new Date();
         setStoredData(STORAGE_KEYS.NOTES, notes);
       }
    },
    restore: async (id: string): Promise<void> => {
        const notes = getStoredData<Note>(STORAGE_KEYS.NOTES);
        const index = notes.findIndex(n => n.id === id);
        if (index !== -1) {
          notes[index].isDeleted = false;
          notes[index].deletedAt = undefined;
          setStoredData(STORAGE_KEYS.NOTES, notes);
        }
    },
    permanentlyDelete: async (id: string): Promise<void> => {
        let notes = getStoredData<Note>(STORAGE_KEYS.NOTES);
        notes = notes.filter(n => n.id !== id);
        setStoredData(STORAGE_KEYS.NOTES, notes);
    },
    pin: async (id: string, isPinned: boolean): Promise<Note> => {
      return storageService.notes.update(id, { isPinned });
    }
  },
  // Task Lists
  taskLists: {
    getAll: async (): Promise<TaskList[]> => {
      return getStoredData<TaskList>(STORAGE_KEYS.TASK_LISTS).filter(l => !l.isDeleted);
    },
    create: async (data: Partial<TaskList>): Promise<TaskList> => {
      const lists = getStoredData<TaskList>(STORAGE_KEYS.TASK_LISTS);
      const newList: TaskList = {
        id: generateId(),
        title: data.title || '',
        description: data.description || '',
        color: data.color || '#3B82F6',
        order: lists.length,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data
      } as TaskList;
      lists.push(newList);
      setStoredData(STORAGE_KEYS.TASK_LISTS, lists);
      return newList;
    },
    update: async (id: string, data: Partial<TaskList>): Promise<TaskList> => {
      const lists = getStoredData<TaskList>(STORAGE_KEYS.TASK_LISTS);
      const index = lists.findIndex(l => l.id === id);
      if (index === -1) throw new Error('List not found');
      
      const updatedList = { ...lists[index], ...data, updatedAt: new Date() };
      lists[index] = updatedList;
      setStoredData(STORAGE_KEYS.TASK_LISTS, lists);
      return updatedList;
    },
    delete: async (id: string): Promise<void> => {
       const lists = getStoredData<TaskList>(STORAGE_KEYS.TASK_LISTS);
       const index = lists.findIndex(l => l.id === id);
       if (index !== -1) {
         lists[index].isDeleted = true;
         setStoredData(STORAGE_KEYS.TASK_LISTS, lists);
       }
    }
  },
  // Pomodoro
  pomodoro: {
    getAll: async (): Promise<PomodoroSession[]> => {
      return getStoredData<PomodoroSession>(STORAGE_KEYS.POMODORO_SESSIONS);
    },
    saveSession: async (session: Partial<PomodoroSession>): Promise<PomodoroSession> => {
      const sessions = getStoredData<PomodoroSession>(STORAGE_KEYS.POMODORO_SESSIONS);
      const newSession: PomodoroSession = {
        id: generateId(),
        startTime: session.startTime || new Date(),
        endTime: session.endTime || new Date(),
        duration: session.duration || 0,
        mode: session.mode || 'work',
        completed: session.completed || false
      } as PomodoroSession;
      
      sessions.push(newSession);
      setStoredData(STORAGE_KEYS.POMODORO_SESSIONS, sessions);
      return newSession;
    }
  }
};
