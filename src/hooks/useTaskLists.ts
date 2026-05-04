import { useState, useEffect } from 'react';
import { TaskList } from '../types';
import { taskListsAPI, tasksAPI } from '../services/api';
import { triggerInstantRefresh } from '../utils/refreshUtils';
import { deserializeApiDates } from '../utils/apiTransforms';

export const useTaskLists = () => {
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [loading, setLoading] = useState(true);

  const normalizeList = (raw: Record<string, unknown>): TaskList => {
    const list = deserializeApiDates(raw) as Record<string, unknown>;
    return {
      ...list,
      title: (list.title ?? '').toString(),
      description: list.description ?? undefined,
      color: (list.color as string) ?? '#3B82F6',
      order: Number(list.order ?? 0),
      isDeleted: Boolean(list.isDeleted ?? false),
      createdAt: list.createdAt,
      updatedAt: list.updatedAt
    } as TaskList;
  };

  const fetchTaskLists = async (silent: boolean = false) => {
    try {
      if (!silent) setLoading(true);
      const lists = await taskListsAPI.getAll();
      setTaskLists(lists.map(normalizeList));
    } catch (error) {
      console.error('Error fetching task lists:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const addTaskList = async (data: { title: string; description?: string; color?: string }) => {
    try {
      const newListRaw = await taskListsAPI.create({
        title: data.title,
        description: data.description,
        color: data.color || '#3B82F6'
      });
      const newList = normalizeList(newListRaw);

      await fetchTaskLists(true); // Silent refresh
      return newList;
    } catch (error) {
      console.error('Error adding task list:', error);
      throw error;
    }
  };

  const updateTaskList = async (id: string, data: Partial<TaskList>) => {
    try {
      const updatedRaw = await taskListsAPI.update(id, {
        title: data.title ?? undefined,
        description: data.description ?? undefined,
        color: data.color ?? undefined,
        order: data.order ?? undefined
      });
      const updatedList = normalizeList(updatedRaw);
      await fetchTaskLists(true); // Silent refresh
      return updatedList;
    } catch (error) {
      console.error('Error updating task list:', error);
      throw error;
    }
  };

  const deleteTaskList = async (id: string) => {
    try {
      await taskListsAPI.delete(id);
      await fetchTaskLists(true); // Silent refresh
    } catch (error) {
      console.error('Error deleting task list:', error);
      throw error;
    }
  };

  const reorderTaskLists = async (reorderedLists: TaskList[]) => {
    try {
      await taskListsAPI.reorder(reorderedLists.map((l) => l.id));
      await fetchTaskLists(true); // Silent refresh
    } catch (error) {
      console.error('Error reordering task lists:', error);
      throw error;
    }
  };

  const moveTaskToList = async (
    taskId: string,
    targetListId: string | null,
    options?: { skipRefresh?: boolean }
  ) => {
    try {
      await tasksAPI.update(taskId, { listId: targetListId });

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
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const lists = await taskListsAPI.getAll();
        if (!cancelled) setTaskLists(lists.map(normalizeList));
      } catch (error) {
        console.error('Error fetching task lists:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
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
