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
  listId?: string | null;
  order?: number;
  hasReminder?: boolean;
  isRecurring?: boolean;
  recurringType?: string | null;
  recurringInterval?: number | null;
  recurringDays?: string | null;
  reminderAt?: Date;
  lastCompleted?: Date;
  nextDue?: Date;
  linkedNoteId?: string | null; // New field for Note-Task linking
}

export interface PomodoroSession {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number; // in seconds
  mode: 'work' | 'shortBreak' | 'longBreak';
  completed: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'tr' | 'en';
}

export interface TaskList {
  id: string;
  title: string;
  description?: string;
  color: string;
  order: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}