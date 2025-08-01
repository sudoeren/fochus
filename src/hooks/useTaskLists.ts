import { useState, useEffect } from 'react';
import prisma from '../lib/prisma';

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
      const lists = await prisma.taskList.findMany({
        where: { isDeleted: false },
        include: {
          tasks: {
            where: { isDeleted: false },
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { order: 'asc' }
      });
      setTaskLists(lists);
    } catch (error) {
      console.error('Error fetching task lists:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTaskList = async (data: { title: string; description?: string; color?: string }) => {
    try {
      const maxOrder = taskLists.length > 0 ? Math.max(...taskLists.map(list => list.order)) : -1;
      const newList = await prisma.taskList.create({
        data: {
          title: data.title,
          description: data.description,
          color: data.color || '#3B82F6',
          order: maxOrder + 1
        },
        include: {
          tasks: {
            where: { isDeleted: false },
            orderBy: { order: 'asc' }
          }
        }
      });
      setTaskLists(prev => [...prev, newList]);
      return newList;
    } catch (error) {
      console.error('Error adding task list:', error);
      throw error;
    }
  };

  const updateTaskList = async (id: string, data: Partial<TaskList>) => {
    try {
      const updatedList = await prisma.taskList.update({
        where: { id },
        data,
        include: {
          tasks: {
            where: { isDeleted: false },
            orderBy: { order: 'asc' }
          }
        }
      });
      setTaskLists(prev => prev.map(list => list.id === id ? updatedList : list));
      return updatedList;
    } catch (error) {
      console.error('Error updating task list:', error);
      throw error;
    }
  };

  const deleteTaskList = async (id: string) => {
    try {
      await prisma.taskList.update({
        where: { id },
        data: { isDeleted: true }
      });
      setTaskLists(prev => prev.filter(list => list.id !== id));
    } catch (error) {
      console.error('Error deleting task list:', error);
      throw error;
    }
  };

  const reorderTaskLists = async (reorderedLists: TaskList[]) => {
    try {
      const updates = reorderedLists.map((list, index) => 
        prisma.taskList.update({
          where: { id: list.id },
          data: { order: index }
        })
      );
      await Promise.all(updates);
      setTaskLists(reorderedLists);
    } catch (error) {
      console.error('Error reordering task lists:', error);
      throw error;
    }
  };

  const moveTaskToList = async (taskId: string, targetListId: string | null) => {
    try {
      await prisma.task.update({
        where: { id: taskId },
        data: { listId: targetListId }
      });
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
