import { useState, useEffect } from 'react';
import { Task } from '../types/index';
import { refreshAllTasks, triggerInstantRefresh } from '../utils/refreshUtils';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  // Load tasks from database
  const loadTasks = async () => {
    try {
      setLoading(true);
      const dbTasks = await window.electronAPI.database.getTasks();
      
      // Convert database format to app format
      const formattedTasks: Task[] = dbTasks.map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        isCompleted: task.isCompleted,
        isPinned: task.isPinned || false,
        isDeleted: task.isDeleted || false,
        listId: task.listId,
        status: task.status,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        order: task.order || 0,
        hasReminder: task.hasReminder || false,
        isRecurring: task.isRecurring || false,
        recurringType: task.recurringType,
        recurringInterval: task.recurringInterval,
        recurringDays: task.recurringDays,
        reminderAt: task.reminderAt ? new Date(task.reminderAt) : undefined,
        lastCompleted: task.lastCompleted ? new Date(task.lastCompleted) : undefined,
        nextDue: task.nextDue ? new Date(task.nextDue) : undefined
      }));
      
      // Order değerine göre sırala, sonra pinned görevleri en üste al
      const sortedTasks = formattedTasks.sort((a, b) => {
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
      setLoading(false);
    }
  };

  useEffect(() => {
    // İlk yüklemede tasks'ları al
    loadTasks();

    // INSTANT refresh event listener
    const handleInstantRefresh = () => {
      console.log('⚡ INSTANT refresh - Tasks yeniden yükleniyor...');
      loadTasks();
    };

    // Custom event for instant refresh
    window.addEventListener('refresh-tasks', handleInstantRefresh);

    // Cleanup
    return () => {
      window.removeEventListener('refresh-tasks', handleInstantRefresh);
    };
  }, []);

  // Add new task
  const addTask = async (taskData: { title: string; description?: string; dueDate?: Date }) => {
    try {
      const newTask = await window.electronAPI.database.createTask({
        title: taskData.title,
        description: taskData.description,
        dueDate: taskData.dueDate
      });
      
      const formattedTask: Task = {
        id: newTask.id,
        title: newTask.title,
        description: newTask.description,
        isCompleted: newTask.isCompleted,
        status: newTask.status as any,
        createdAt: new Date(newTask.createdAt),
        updatedAt: new Date(newTask.updatedAt),
        dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
        isPinned: newTask.isPinned || false,
        isDeleted: newTask.isDeleted || false,
        listId: newTask.listId,
        order: newTask.order || 0,
        hasReminder: newTask.hasReminder || false,
        isRecurring: newTask.isRecurring || false,
        recurringType: newTask.recurringType,
        recurringInterval: newTask.recurringInterval,
        recurringDays: newTask.recurringDays,
        reminderAt: newTask.reminderAt ? new Date(newTask.reminderAt) : undefined,
        lastCompleted: newTask.lastCompleted ? new Date(newTask.lastCompleted) : undefined,
        nextDue: newTask.nextDue ? new Date(newTask.nextDue) : undefined
      };
      
      // ULTRA FAST refresh - hemen tetikle!
      triggerInstantRefresh(); // Hemen global refresh
      await loadTasks(); // Local refresh
      triggerInstantRefresh(); // Bir kez daha global refresh
      return formattedTask;
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  // Update task
  const updateTask = async (id: string, taskData: { title?: string; description?: string; isCompleted?: boolean; status?: 'PENDING' | 'COMPLETED' | 'POSTPONED'; dueDate?: Date }) => {
    try {
      const updatedTask = await window.electronAPI.database.updateTask(id, taskData);
      
      const formattedTask: Task = {
        id: updatedTask.id,
        title: updatedTask.title,
        description: updatedTask.description,
        isCompleted: updatedTask.isCompleted,
        status: updatedTask.status as any,
        createdAt: new Date(updatedTask.createdAt),
        updatedAt: new Date(updatedTask.updatedAt),
        dueDate: updatedTask.dueDate ? new Date(updatedTask.dueDate) : undefined,
        isPinned: updatedTask.isPinned || false,
        isDeleted: updatedTask.isDeleted || false,
        listId: updatedTask.listId,
        order: updatedTask.order || 0,
        hasReminder: updatedTask.hasReminder || false,
        isRecurring: updatedTask.isRecurring || false,
        recurringType: updatedTask.recurringType,
        recurringInterval: updatedTask.recurringInterval,
        recurringDays: updatedTask.recurringDays,
        reminderAt: updatedTask.reminderAt ? new Date(updatedTask.reminderAt) : undefined,
        lastCompleted: updatedTask.lastCompleted ? new Date(updatedTask.lastCompleted) : undefined,
        nextDue: updatedTask.nextDue ? new Date(updatedTask.nextDue) : undefined
      };
      
      // ULTRA FAST refresh - hemen tetikle!
      triggerInstantRefresh(); // Hemen global refresh
      await loadTasks(); // Local refresh
      triggerInstantRefresh(); // Bir kez daha global refresh
      return formattedTask;
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
      await window.electronAPI.database.deleteTask(id);
      await loadTasks(); // Local refresh
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
      const updatedTask = await (window.electronAPI.database as any).pinTask(id, isPinned);
      setTasks(prev => 
        prev.map(task => 
          task.id === id 
            ? { ...task, isPinned: updatedTask.isPinned, updatedAt: new Date(updatedTask.updatedAt) }
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
      console.log('📋 Başlangıç sıralaması:', allTasks.map((t, i) => `${i}: ${t.title} (order: ${t.order})`));
      
      // 2. Yerel state'i hemen güncelle (immediate feedback)
      const newTasks = Array.from(allTasks);
      const [movedTask] = newTasks.splice(startIndex, 1);
      newTasks.splice(endIndex, 0, movedTask);
      
      console.log('📋 Yeni sıralama:', newTasks.map((t, i) => `${i}: ${t.title}`));
      
      // 3. Hemen local state'i güncelle
      setTasks(newTasks);
      
      // 4. Veritabanındaki order değerlerini güncelle
      console.log('💾 Veritabanı güncellemesi başlıyor...');
      
      const updatePromises = newTasks.map(async (task, index) => {
        if (task.order !== index) {
          console.log(`📝 Task "${task.title}" order: ${task.order} -> ${index}`);
          try {
            await window.electronAPI.database.updateTask(task.id, { order: index });
            return true;
          } catch (err) {
            console.error(`❌ Task ${task.id} order güncellenemedi:`, err);
            return false;
          }
        }
        return true;
      });
      
      const results = await Promise.all(updatePromises);
      const failedUpdates = results.filter(r => !r).length;
      
      if (failedUpdates > 0) {
        console.warn(`⚠️ ${failedUpdates} task order güncellenemedi`);
      }
      
      // 5. Başarılı olduğundan emin olmak için tekrar yükle
      console.log('🔄 Tasks reload ediliyor...');
      await loadTasks();
      
      console.log('✅ reorderTasks tamamlandı!');
    } catch (error) {
      console.error('❌ reorderTasks HATASI:', error);
      // Hata durumunda görevleri yeniden yükle
      console.log('🔄 Hata sonrası reload...');
      await loadTasks();
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
    loadTasks
  };
};
