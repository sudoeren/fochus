import { useState, useEffect } from 'react';
import { TaskList } from '../types';
import { storageService } from '../services/storage';
import { triggerInstantRefresh } from '../utils/refreshUtils';

export const useTaskLists = () => {
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTaskLists = async (silent: boolean = false) => {
    try {
      if (!silent) setLoading(true);
      const lists = await storageService.taskLists.getAll();
      setTaskLists(lists);
    } catch (error) {
      console.error('Error fetching task lists:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const addTaskList = async (data: { title: string; description?: string; color?: string }) => {
    try {
      const newList = await storageService.taskLists.create({
        title: data.title,
        description: data.description,
        color: data.color || '#3B82F6'
      });

      await fetchTaskLists(true); // Silent refresh
      return newList;
    } catch (error) {
      console.error('Error adding task list:', error);
      throw error;
    }
  };

  const updateTaskList = async (id: string, data: Partial<TaskList>) => {
    try {
      const updatedList = await storageService.taskLists.update(id, data);
      await fetchTaskLists(true); // Silent refresh
      return updatedList;
    } catch (error) {
      console.error('Error updating task list:', error);
      throw error;
    }
  };

  const deleteTaskList = async (id: string) => {
    try {
      await storageService.taskLists.delete(id);
      await fetchTaskLists(true); // Silent refresh
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
      await fetchTaskLists(true); // Silent refresh
    } catch (error) {
      console.error('Error reordering task lists:', error);
      throw error;
    }
  };

  const moveTaskToList = async (taskId: string, targetListId: string | null, options?: { skipRefresh?: boolean }) => {
    try {
      await storageService.tasks.update(taskId, { listId: targetListId });

      if (!options?.skipRefresh) {
        // Refresh lists to update task counts
        await fetchTaskLists(true); // Silent refresh
        triggerInstantRefresh();
      }
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
