import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Task } from '../types/index';
import { tasksAPI } from '../services/api';
import { deserializeApiDates } from '../utils/apiTransforms';

export const useTasks = () => {
  const queryClient = useQueryClient();

  const normalizeTask = (raw: Record<string, unknown>): Task => {
    const task = deserializeApiDates(raw) as Record<string, unknown>;
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
      status: (task.status ?? (task.isCompleted ? 'COMPLETED' : 'PENDING')) as Task['status'],
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
    const date = value instanceof Date ? value : new Date(value as string);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
  };

  const { data: tasks = [], isLoading: loading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const apiTasks = await tasksAPI.getAll();
      const normalized = apiTasks.map(normalizeTask);
      return normalized.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return (a.order || 0) - (b.order || 0);
      });
    }
  });

  const addTaskMutation = useMutation({
    mutationFn: async (taskData: Partial<Task>) => {
      const newTaskRaw = await tasksAPI.create({
        title: taskData.title || '',
        description: taskData.description,
        dueDate: toISOStringOrUndefined(taskData.dueDate),
        listId: taskData.listId ?? undefined,
        isPinned: taskData.isPinned,
        hasReminder: taskData.hasReminder,
        reminderAt: toISOStringOrUndefined(taskData.reminderAt),
        isRecurring: taskData.isRecurring,
        recurringType: taskData.recurringType,
        recurringInterval: taskData.recurringInterval,
        recurringDays: Array.isArray(taskData.recurringDays)
          ? JSON.stringify(taskData.recurringDays)
          : taskData.recurringDays,
        linkedNoteId: taskData.linkedNoteId ?? undefined
      });
      return normalizeTask(newTaskRaw);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Task> }) => {
      const updatedRaw = await tasksAPI.update(id, {
        ...data,
        dueDate: data.dueDate ? toISOStringOrUndefined(data.dueDate) : undefined,
        reminderAt: data.reminderAt ? toISOStringOrUndefined(data.reminderAt) : undefined,
        lastCompleted: data.lastCompleted ? toISOStringOrUndefined(data.lastCompleted) : undefined,
        nextDue: data.nextDue ? toISOStringOrUndefined(data.nextDue) : undefined
      });
      return normalizeTask(updatedRaw);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      await tasksAPI.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  const toggleTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const updated = await tasksAPI.toggle(id);
      return normalizeTask(updated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  const reorderTasksMutation = useMutation({
    mutationFn: async (taskIds: string[]) => {
      await tasksAPI.reorder(taskIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  const getTasksByFilter = (filter: 'all' | 'pending' | 'completed' | 'today' | 'overdue') => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let filteredTasks: Task[];

    switch (filter) {
      case 'pending':
        filteredTasks = tasks.filter((task) => !task.isCompleted);
        break;
      case 'completed':
        filteredTasks = tasks.filter((task) => task.isCompleted);
        break;
      case 'today':
        filteredTasks = tasks.filter(
          (task) => task.dueDate && task.dueDate >= today && task.dueDate < tomorrow
        );
        break;
      case 'overdue':
        filteredTasks = tasks.filter(
          (task) => task.dueDate && task.dueDate < today && !task.isCompleted
        );
        break;
      default:
        filteredTasks = tasks;
        break;
    }

    return filteredTasks.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return (a.order || 0) - (b.order || 0);
    });
  };

  const getTaskStats = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.isCompleted).length;
    const pendingTasks = totalTasks - completedTasks;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTasks = tasks.filter(
      (task) =>
        task.dueDate &&
        task.dueDate >= today &&
        task.dueDate < new Date(today.getTime() + 24 * 60 * 60 * 1000)
    ).length;

    const overdueTasks = tasks.filter(
      (task) => task.dueDate && task.dueDate < today && !task.isCompleted
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

  const reorderTasks = async (
    startIndex: number,
    endIndex: number,
    currentFilter: string = 'all'
  ) => {
    if (currentFilter !== 'all') {
      console.warn('⚠️ Drag-drop sadece "Hepsi" görünümünde çalışır!');
      return;
    }

    const allTasks = [...tasks].sort((a, b) => (a.order || 0) - (b.order || 0));
    const newTasks = Array.from(allTasks);
    const [movedTask] = newTasks.splice(startIndex, 1);
    newTasks.splice(endIndex, 0, movedTask);

    // Optimistic update
    queryClient.setQueryData(['tasks'], newTasks);

    try {
      await reorderTasksMutation.mutateAsync(newTasks.map((t) => t.id));
    } catch (error) {
      console.error('Reorder error', error);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  };

  return {
    tasks,
    loading,
    addTask: (data: Partial<Task>) => addTaskMutation.mutateAsync(data),
    updateTask: (id: string, data: Partial<Task>) => updateTaskMutation.mutateAsync({ id, data }),
    deleteTask: (id: string) => deleteTaskMutation.mutateAsync(id),
    toggleTask: (id: string) => toggleTaskMutation.mutateAsync(id),
    pinTask: (id: string, isPinned: boolean) =>
      updateTaskMutation.mutateAsync({ id, data: { isPinned } }),
    reorderTasks,
    getTasksByFilter,
    getTaskStats,
    loadTasks: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
    setTasks: (newTasks: Task[] | ((prev: Task[]) => Task[])) => {
      // Manual override for local drag-drop state if needed, though react-query handles this via cache
      // This signature was in the old hook, mapping it to cache update for compatibility if strictly needed
      // But ideally components should rely on 'tasks' from the hook.
      if (typeof newTasks === 'function') {
        queryClient.setQueryData(['tasks'], newTasks);
      } else {
        queryClient.setQueryData(['tasks'], newTasks);
      }
    }
  };
};
