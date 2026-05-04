// API Client for Fokus Backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

import i18n from '../i18n';

// Token management
let authToken: string | null = localStorage.getItem('fokus_token');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('fokus_token', token);
  } else {
    localStorage.removeItem('fokus_token');
  }

  window.dispatchEvent(new Event('auth:token-changed'));
};

export const getAuthToken = () => authToken;

const translateApiError = (rawMessage: unknown): string => {
  if (typeof rawMessage !== 'string' || !rawMessage.trim()) {
    return i18n.t('errors.generic');
  }

  const message = rawMessage.trim();

  const map: Record<string, string> = {
    'Kullanıcı adı veya şifre hatalı': 'errors.invalid_credentials',
    'Bu kullanıcı adı zaten alınmış': 'errors.username_taken',
    'Kullanıcı adı en az 3 karakter olmalı': 'errors.username_min_3',
    'Şifre en az 6 karakter olmalı': 'errors.password_min_6',
    'Kullanıcı adı gerekli': 'errors.username_required',
    'Şifre gerekli': 'errors.password_required',
    'Çok fazla başarısız giriş denemesi, lütfen 15 dakika sonra tekrar deneyin':
      'errors.too_many_login_attempts',
    'Yeni kullanıcı kaydı devre dışı bırakılmıştır.': 'errors.registration_disabled',
    'Bir hata oluştu': 'errors.generic'
  };

  const key = map[message];
  return key ? i18n.t(key) : message;
};

// Generic fetch wrapper
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (authToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Bir hata oluştu' }));

    // Handle 401 - Unauthorized
    if (response.status === 401) {
      setAuthToken(null);
      window.dispatchEvent(new Event('auth:logout'));
    }

    const rawMessage = (error as any)?.error ?? (error as any)?.message ?? 'Bir hata oluştu';
    throw new Error(translateApiError(rawMessage));
  }

  return response.json();
}

// Auth API
export const authAPI = {
  register: (data: { username: string; password: string; name?: string }) =>
    fetchAPI<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  login: (data: { username: string; password: string }) =>
    fetchAPI<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  me: () => fetchAPI<any>('/auth/me'),

  updateProfile: (data: { name?: string; username?: string; avatar?: string | null }) =>
    fetchAPI<any>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    fetchAPI<{ message: string }>('/auth/password', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
};

// Notes API
export const notesAPI = {
  getAll: () => fetchAPI<any[]>('/notes'),

  getDeleted: () => fetchAPI<any[]>('/notes/deleted'),

  getById: (id: string) => fetchAPI<any>(`/notes/${id}`),

  create: (data: { title: string; content?: string; isPinned?: boolean }) =>
    fetchAPI<any>('/notes', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  update: (id: string, data: Partial<{ title: string; content: string; isPinned: boolean }>) =>
    fetchAPI<any>(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  delete: (id: string) =>
    fetchAPI<{ message: string }>(`/notes/${id}`, {
      method: 'DELETE'
    }),

  restore: (id: string) =>
    fetchAPI<any>(`/notes/${id}/restore`, {
      method: 'POST'
    }),

  permanentDelete: (id: string) =>
    fetchAPI<{ message: string }>(`/notes/${id}/permanent`, {
      method: 'DELETE'
    })
};

// Tasks API
export const tasksAPI = {
  getAll: (params?: { listId?: string; completed?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.listId) searchParams.set('listId', params.listId);
    if (params?.completed !== undefined) searchParams.set('completed', String(params.completed));
    const query = searchParams.toString();
    return fetchAPI<any[]>(`/tasks${query ? `?${query}` : ''}`);
  },

  getDeleted: () => fetchAPI<any[]>('/tasks/deleted'),

  getById: (id: string) => fetchAPI<any>(`/tasks/${id}`),

  create: (data: {
    title: string;
    description?: string;
    dueDate?: string;
    listId?: string;
    isPinned?: boolean;
    hasReminder?: boolean;
    reminderAt?: string;
    isRecurring?: boolean;
    recurringType?: string;
    recurringInterval?: number;
    recurringDays?: string;
    linkedNoteId?: string;
  }) =>
    fetchAPI<any>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  update: (id: string, data: Partial<any>) =>
    fetchAPI<any>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  toggle: (id: string) =>
    fetchAPI<any>(`/tasks/${id}/toggle`, {
      method: 'PUT'
    }),

  reorder: (taskIds: string[]) =>
    fetchAPI<{ message: string }>('/tasks/reorder', {
      method: 'PUT',
      body: JSON.stringify({ taskIds })
    }),

  delete: (id: string) =>
    fetchAPI<{ message: string }>(`/tasks/${id}`, {
      method: 'DELETE'
    }),

  restore: (id: string) =>
    fetchAPI<any>(`/tasks/${id}/restore`, {
      method: 'POST'
    }),

  permanentDelete: (id: string) =>
    fetchAPI<{ message: string }>(`/tasks/${id}/permanent`, {
      method: 'DELETE'
    })
};

// Task Lists API
export const taskListsAPI = {
  getAll: () => fetchAPI<any[]>('/task-lists'),

  getById: (id: string) => fetchAPI<any>(`/task-lists/${id}`),

  create: (data: { title: string; description?: string; color?: string }) =>
    fetchAPI<any>('/task-lists', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  update: (
    id: string,
    data: Partial<{ title: string; description: string; color: string; order: number }>
  ) =>
    fetchAPI<any>(`/task-lists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  reorder: (listIds: string[]) =>
    fetchAPI<{ message: string }>('/task-lists/reorder', {
      method: 'PUT',
      body: JSON.stringify({ listIds })
    }),

  delete: (id: string) =>
    fetchAPI<{ message: string }>(`/task-lists/${id}`, {
      method: 'DELETE'
    })
};

// Pomodoro API
export const pomodoroAPI = {
  getAll: (params?: { startDate?: string; endDate?: string; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const query = searchParams.toString();
    return fetchAPI<any[]>(`/pomodoro${query ? `?${query}` : ''}`);
  },

  getStats: (period?: 'week' | 'month' | 'all') =>
    fetchAPI<any>(`/pomodoro/stats${period ? `?period=${period}` : ''}`),

  create: (data: {
    startTime: string;
    endTime: string;
    duration: number;
    mode: 'work' | 'shortBreak' | 'longBreak';
    completed?: boolean;
  }) =>
    fetchAPI<any>('/pomodoro', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  delete: (id: string) =>
    fetchAPI<{ message: string }>(`/pomodoro/${id}`, {
      method: 'DELETE'
    })
};

// Settings API
export const settingsAPI = {
  get: () => fetchAPI<any>('/settings'),

  update: (data: { theme?: string; language?: string }) =>
    fetchAPI<any>('/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  exportData: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/settings/export`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Export failed');
    return response.blob();
  }
};

// Admin API
export const adminAPI = {
  getUsers: () => fetchAPI<any[]>('/admin/users'),

  deleteUser: (id: string) =>
    fetchAPI<{ message: string }>(`/admin/users/${id}`, {
      method: 'DELETE'
    }),

  getSettings: () => fetchAPI<{ allowRegistration: boolean }>('/admin/settings'),

  updateSettings: (data: { allowRegistration: boolean }) =>
    fetchAPI<{ message: string; allowRegistration: boolean }>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  promoteUser: (id: string) =>
    fetchAPI<{ message: string }>(`/admin/promote/${id}`, {
      method: 'POST'
    })
};

// Export default API object
export const api = {
  auth: authAPI,
  admin: adminAPI,
  notes: notesAPI,
  tasks: tasksAPI,
  taskLists: taskListsAPI,
  pomodoro: pomodoroAPI,
  settings: settingsAPI
};

export default api;
