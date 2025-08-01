import { useState, useEffect } from 'react';

export interface TaskList {
  id: string;
  title: string;
  description?: string;
  color: string;
  order: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  tasks?: any[];
}

export const useTaskLists = () => {
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTaskLists = async () => {
    try {
      setLoading(true);
      const lists = await window.electronAPI.database.getTaskLists();
      const formattedLists = lists.map(list => ({
        ...list,
        createdAt: new Date(list.createdAt),
        updatedAt: new Date(list.updatedAt)
      }));
      setTaskLists(formattedLists);
    } catch (error) {
      console.error('Error fetching task lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTaskList = async (data: { title: string; description?: string; color?: string }) => {
    try {
      const newList = await window.electronAPI.database.createTaskList({
        title: data.title,
        description: data.description,
        color: data.color || '#3B82F6'
      });
      
      const formattedList = {
        ...newList,
        createdAt: new Date(newList.createdAt),
        updatedAt: new Date(newList.updatedAt)
      };
      
      await fetchTaskLists(); // Auto-refresh after adding
      return formattedList;
    } catch (error) {
      console.error('Error adding task list:', error);
      throw error;
    }
  };

  const updateTaskList = async (id: string, data: Partial<TaskList>) => {
    try {
      const updatedList = await window.electronAPI.database.updateTaskList(id, data);
      const formattedList = {
        ...updatedList,
        createdAt: new Date(updatedList.createdAt),
        updatedAt: new Date(updatedList.updatedAt)
      };
      await fetchTaskLists(); // Auto-refresh after updating
      return formattedList;
    } catch (error) {
      console.error('Error updating task list:', error);
      throw error;
    }
  };

  const deleteTaskList = async (id: string) => {
    try {
      await window.electronAPI.database.deleteTaskList(id);
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
        await window.electronAPI.database.updateTaskList(reorderedLists[i].id, { order: i });
      }
      await fetchTaskLists(); // Auto-refresh after reordering
    } catch (error) {
      console.error('Error reordering task lists:', error);
      throw error;
    }
  };

  const moveTaskToList = async (taskId: string, targetListId: string | null) => {
    try {
      await window.electronAPI.database.updateTask(taskId, { listId: targetListId });
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
