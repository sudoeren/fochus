import { useState, useEffect } from 'react';
import { TaskList } from '../types';
import { storageService } from '../services/storage';

export const useTaskLists = () => {
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTaskLists = async () => {
    try {
      setLoading(true);
      const lists = await storageService.taskLists.getAll();
      setTaskLists(lists);
    } catch (error) {
      console.error('Error fetching task lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTaskList = async (data: { title: string; description?: string; color?: string }) => {
    try {
      const newList = await storageService.taskLists.create({
        title: data.title,
        description: data.description,
        color: data.color || '#3B82F6'
      });
      
      await fetchTaskLists(); // Auto-refresh after adding
      return newList;
    } catch (error) {
      console.error('Error adding task list:', error);
      throw error;
    }
  };

  const updateTaskList = async (id: string, data: Partial<TaskList>) => {
    try {
      const updatedList = await storageService.taskLists.update(id, data);
      await fetchTaskLists(); // Auto-refresh after updating
      return updatedList;
    } catch (error) {
      console.error('Error updating task list:', error);
      throw error;
    }
  };

  const deleteTaskList = async (id: string) => {
    try {
      await storageService.taskLists.delete(id);
      await fetchTaskLists(); // Auto-refresh after deleting
    } catch (error) {
      console.error('Error deleting task list:', error);
      throw error;
    }
  };

  const reorderTaskLists = async (reorderedLists: TaskList[]) => {
    try {
      // Update order for all lists
      for (let i = 0; i < reorderedLists.length; i++) {
        await storageService.taskLists.update(reorderedLists[i].id, { order: i });
      }
      await fetchTaskLists(); // Auto-refresh after reordering
    } catch (error) {
      console.error('Error reordering task lists:', error);
      throw error;
    }
  };

  const moveTaskToList = async (taskId: string, targetListId: string | null) => {
    try {
      await storageService.tasks.update(taskId, { listId: targetListId });
      // Refresh lists to update task counts
      await fetchTaskLists();
    } catch (error) {
      console.error('Error moving task to list:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchTaskLists();
  }, []);

  return {
    taskLists,
    loading,
    addTaskList,
    updateTaskList,
    deleteTaskList,
    reorderTaskLists,
    moveTaskToList,
    refetch: fetchTaskLists
  };
};
