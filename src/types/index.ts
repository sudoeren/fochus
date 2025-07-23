// Uygulama için tip tanımları

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
}

export type TaskStatus = 'PENDING' | 'COMPLETED' | 'POSTPONED';

export interface Task {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
}

export interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export interface WeeklyTask {
  id: string;
  title: string;
  day: string; // 'monday', 'tuesday', etc.
  isCompleted: boolean;
  createdAt: Date;
}
