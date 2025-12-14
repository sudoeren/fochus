import { useState, useEffect } from 'react';
import { Task } from '../types/index';
import { triggerInstantRefresh } from '../utils/refreshUtils';
import { tasksAPI } from '../services/api';
import { deserializeApiDates } from '../utils/apiTransforms';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const normalizeTask = (raw: any): Task => {
    const task = deserializeApiDates(raw) as any;

    return {
      ...task,
      title: (task.title ?? '').toString(),
      description: task.description ?? undefined,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      deletedAt: task.deletedAt ?? undefined,
      dueDate: task.dueDate ?? undefined,
      reminderAt: task.reminderAt ?? undefined,
      lastCompleted: task.lastCompleted ?? undefined,
      nextDue: task.nextDue ?? undefined,
      isCompleted: Boolean(task.isCompleted),
      status: (task.status ?? (task.isCompleted ? 'COMPLETED' : 'PENDING')) as any,
      isPinned: Boolean(task.isPinned ?? false),
      isDeleted: Boolean(task.isDeleted ?? false),
      order: Number(task.order ?? 0),
      listId: task.listId ?? null,
      hasReminder: Boolean(task.hasReminder ?? false),
      isRecurring: Boolean(task.isRecurring ?? false)
    } as Task;
  };

  const toISOStringOrUndefined = (value: unknown): string | undefined => {
    if (!value) return undefined;
    const date = value instanceof Date ? value : new Date(value as any);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
  };

  // Load tasks from storage
  // Load tasks from storage
  const loadTasks = async (silent: boolean = false) => {
    try {
      if (!silent) setLoading(true);
      const apiTasks = await tasksAPI.getAll();
      const normalized = apiTasks.map(normalizeTask);
      const sortedTasks = normalized.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return (a.order || 0) - (b.order || 0);
      });
      setTasks(sortedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    // İlk yüklemede tasks'ları al
    loadTasks();

    // INSTANT refresh event listener
    const handleInstantRefresh = () => {
      console.log('⚡ INSTANT refresh - Tasks yeniden yükleniyor...');
      loadTasks(true); // Silent refresh
    };

    // Custom event for instant refresh
    window.addEventListener('refresh-tasks', handleInstantRefresh);

    // Cleanup
    return () => {
      window.removeEventListener('refresh-tasks', handleInstantRefresh);
    };
  }, []);

  // Add new task
  const addTask = async (taskData: Partial<Task>) => {
    try {
      const newTaskRaw = await tasksAPI.create({
        title: taskData.title || '',
        description: taskData.description,
        dueDate: toISOStringOrUndefined(taskData.dueDate),
        listId: taskData.listId ?? undefined,
        isPinned: taskData.isPinned,
        hasReminder: taskData.hasReminder,
        reminderAt: toISOStringOrUndefined(taskData.reminderAt),
        isRecurring: taskData.isRecurring,
        recurringType: taskData.recurringType as any,
        recurringInterval: taskData.recurringInterval as any,
        recurringDays: Array.isArray(taskData.recurringDays)
          ? JSON.stringify(taskData.recurringDays)
          : (taskData.recurringDays as any),
        linkedNoteId: (taskData as any).linkedNoteId
      });
      const newTask = normalizeTask(newTaskRaw);

      // ULTRA FAST refresh - hemen tetikle!
      triggerInstantRefresh(); // Hemen global refresh
      await loadTasks(true); // Local silent refresh
      triggerInstantRefresh(); // Bir kez daha global refresh
      return newTask;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  // Update task
  const updateTask = async (id: string, taskData: Partial<Task>) => {
    try {
      const updatedRaw = await tasksAPI.update(id, {
        ...taskData,
        dueDate: taskData.dueDate ? toISOStringOrUndefined(taskData.dueDate) : undefined,
        reminderAt: taskData.reminderAt ? toISOStringOrUndefined(taskData.reminderAt) : undefined,
        lastCompleted: taskData.lastCompleted ? toISOStringOrUndefined(taskData.lastCompleted) : undefined,
        nextDue: taskData.nextDue ? toISOStringOrUndefined(taskData.nextDue) : undefined
      });
      const updatedTask = normalizeTask(updatedRaw);

      // ULTRA FAST refresh - hemen tetikle!
      triggerInstantRefresh(); // Hemen global refresh
      await loadTasks(true); // Local silent refresh
      triggerInstantRefresh(); // Bir kez daha global refresh
      return updatedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  // Delete task
  const deleteTask = async (id: string) => {
    try {
      // ULTRA FAST refresh - hemen tetikle!
      triggerInstantRefresh(); // Hemen global refresh
      await tasksAPI.delete(id);
      await loadTasks(true); // Local silent refresh
      triggerInstantRefresh(); // Bir kez daha global refresh
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  // Toggle task completion
  const toggleTask = async (id: string) => {
    try {
      const updated = await tasksAPI.toggle(id);
      triggerInstantRefresh();
      await loadTasks(true);
      triggerInstantRefresh();
      return normalizeTask(updated);
    } catch (error) {
      console.error('Error toggling task:', error);
      throw error;
    }
  };

  // Get tasks by filter
  const getTasksByFilter = (filter: 'all' | 'pending' | 'completed' | 'today' | 'overdue') => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let filteredTasks: Task[] = [];

    switch (filter) {
      case 'pending':
        filteredTasks = tasks.filter(task => !task.isCompleted);
        break;
      case 'completed':
        filteredTasks = tasks.filter(task => task.isCompleted);
        break;
      case 'today':
        filteredTasks = tasks.filter(task =>
          task.dueDate &&
          task.dueDate >= today &&
          task.dueDate < tomorrow
        );
        break;
      case 'overdue':
        filteredTasks = tasks.filter(task =>
          task.dueDate &&
          task.dueDate < today &&
          !task.isCompleted
        );
        break;
      default:
        filteredTasks = tasks;
        break;
    }

    // Filtrelenmiş görevleri de sırala (pinned görevler önce, sonra order)
    return filteredTasks.sort((a, b) => {
      // Pinned görevler önce
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      // Sonra order değerine göre sırala
      return (a.order || 0) - (b.order || 0);
    });
  };

  // Get task statistics
  const getTaskStats = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.isCompleted).length;
    const pendingTasks = totalTasks - completedTasks;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTasks = tasks.filter(task =>
      task.dueDate &&
      task.dueDate >= today &&
      task.dueDate < new Date(today.getTime() + 24 * 60 * 60 * 1000)
    ).length;

    const overdueTasks = tasks.filter(task =>
      task.dueDate &&
      task.dueDate < today &&
      !task.isCompleted
    ).length;

    return {
      total: totalTasks,
      completed: completedTasks,
      pending: pendingTasks,
      today: todayTasks,
      overdue: overdueTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
  };

  // Pin/unpin task
  const pinTask = async (id: string, isPinned: boolean) => {
    try {
      const updatedRaw = await tasksAPI.update(id, { isPinned });
      const updatedTask = normalizeTask(updatedRaw);
      setTasks(prev =>
        prev.map(task =>
          task.id === id
            ? updatedTask
            : task
        )
      );
    } catch (error) {
      console.error('Error pinning task:', error);
    }
  };

  // Reorder tasks - SADECE 'ALL' FILTER IÇIN ÇALIŞIR
  const reorderTasks = async (startIndex: number, endIndex: number, currentFilter: string = 'all') => {
    console.log('🔄 reorderTasks çağrıldı:', { startIndex, endIndex, currentFilter });

    // Sadece 'all' filter'da drag-drop yapılabilir
    if (currentFilter !== 'all') {
      console.warn('⚠️ Drag-drop sadece "Hepsi" görünümünde çalışır!');
      return;
    }

    try {
      // 1. Tüm görevleri al (filtresiz)
      const allTasks = [...tasks].sort((a, b) => (a.order || 0) - (b.order || 0));

      // 2. Yerel state'i hemen güncelle (immediate feedback)
      const newTasks = Array.from(allTasks);
      const [movedTask] = newTasks.splice(startIndex, 1);
      newTasks.splice(endIndex, 0, movedTask);

      // 3. Hemen local state'i güncelle
      setTasks(newTasks);

      // 4. Backend sıralamasını güncelle
      await tasksAPI.reorder(newTasks.map(t => t.id));
      await loadTasks(true);

    } catch (error) {
      console.error('❌ reorderTasks HATASI:', error);
      await loadTasks(true);
    }
  };

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    pinTask,
    reorderTasks,
    getTasksByFilter,
    getTaskStats,
    loadTasks,
    setTasks
  };
};
