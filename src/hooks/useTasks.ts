import { useState, useEffect } from 'react';
import { Task } from '../types/index';

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
      
      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
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
      
      setTasks(prev => [formattedTask, ...prev]);
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
      
      setTasks(prev => prev.map(task => 
        task.id === id ? formattedTask : task
      ));
      
      return formattedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  // Delete task
  const deleteTask = async (id: string) => {
    try {
      await window.electronAPI.database.deleteTask(id);
      setTasks(prev => prev.filter(task => task.id !== id));
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

    switch (filter) {
      case 'pending':
        return tasks.filter(task => !task.isCompleted);
      case 'completed':
        return tasks.filter(task => task.isCompleted);
      case 'today':
        return tasks.filter(task => 
          task.dueDate && 
          task.dueDate >= today && 
          task.dueDate < tomorrow
        );
      case 'overdue':
        return tasks.filter(task => 
          task.dueDate && 
          task.dueDate < today && 
          !task.isCompleted
        );
      default:
        return tasks;
    }
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

  // Reorder tasks
  const reorderTasks = async (startIndex: number, endIndex: number) => {
    try {
      const result = Array.from(tasks);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      
      // Update local state immediately for better UX
      setTasks(result);
      
      // Update order in database
      const updatePromises = result.map((task, index) => 
        window.electronAPI.database.updateTask(task.id, { order: index })
      );
      
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error reordering tasks:', error);
      // Reload tasks if there's an error
      loadTasks();
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
