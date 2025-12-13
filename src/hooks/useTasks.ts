import { useState, useEffect } from 'react';
import { Task } from '../types/index';
import { triggerInstantRefresh } from '../utils/refreshUtils';
import { storageService } from '../services/storage';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  // Load tasks from storage
  // Load tasks from storage
  const loadTasks = async (silent: boolean = false) => {
    try {
      if (!silent) setLoading(true);
      const dbTasks = await storageService.tasks.getAll() as unknown as Task[];

      // Order değerine göre sırala, sonra pinned görevleri en üste al
      const sortedTasks = dbTasks.sort((a, b) => {
        // Pinned görevler önce
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        // Sonra order değerine göre sırala
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
      const newTask = await storageService.tasks.create(taskData as any);

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
      const updatedTask = await storageService.tasks.update(id, taskData as any);

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
      await storageService.tasks.delete(id);
      await loadTasks(true); // Local silent refresh
      triggerInstantRefresh(); // Bir kez daha global refresh
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };

  // Toggle task completion
  const toggleTask = async (id: string) => {
    const task = tasks.find(task => task.id === id);
    if (task) {
      const newCompleted = !task.isCompleted;
      const newStatus = newCompleted ? 'COMPLETED' : 'PENDING';
      return await updateTask(id, { isCompleted: newCompleted, status: newStatus });
    }
    return null;
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
      const updatedTask = await storageService.tasks.pin(id, isPinned) as unknown as Task;
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

      // 4. Veritabanındaki order değerlerini güncelle
      const updatePromises = newTasks.map(async (task, index) => {
        if (task.order !== index) {
          try {
            await storageService.tasks.update(task.id, { order: index });
            return true;
          } catch (err) {
            console.error(`❌ Task ${task.id} order güncellenemedi:`, err);
            return false;
          }
        }
        return true;
      });

      await Promise.all(updatePromises);
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
