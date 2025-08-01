// Uygulama için tip tanımları

export interface Note {
  id: string;
  title: string;
  content: string;
  plainContent?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
  isDeleted: boolean;
  reminderAt?: Date;
  hasReminder: boolean;
}

export type TaskStatus = 'PENDING' | 'COMPLETED' | 'POSTPONED';
export type RecurringType = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface Task {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  parentId?: string;
  subtasks?: Task[];
  order: number;
  reminderAt?: Date;
  hasReminder: boolean;
  isRecurring: boolean;
  recurringType?: RecurringType;
  recurringInterval?: number;
  recurringDays?: number[];
  lastCompleted?: Date;
  nextDue?: Date;
  isPinned?: boolean;
  isDeleted?: boolean;
  listId?: string;
}

export interface SubTask {
  id: string;
  title: string;
  isCompleted: boolean;
  parentId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RecurringPattern {
  id: string;
  taskId: string;
  type: RecurringType;
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
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

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  silent?: boolean;
  tag?: string;
}

export interface SearchResult {
  type: 'note' | 'task';
  id: string;
  title: string;
  content?: string;
  matchedText?: string;
  score: number;
}
