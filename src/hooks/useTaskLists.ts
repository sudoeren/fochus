import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TaskList } from '../types/index';
import { taskListsAPI, tasksAPI } from '../services/api';
import { deserializeApiDates } from '../utils/apiTransforms';

export const useTaskLists = () => {
  const queryClient = useQueryClient();

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

  const { data: taskLists = [], isLoading: loading } = useQuery({
    queryKey: ['taskLists'],
    queryFn: async () => {
      const lists = await taskListsAPI.getAll();
      return lists.map(normalizeList);
    }
  });

  const addTaskListMutation = useMutation({
    mutationFn: async (data: { title: string; description?: string; color?: string }) => {
      const newListRaw = await taskListsAPI.create({
        title: data.title,
        description: data.description,
        color: data.color || '#3B82F6'
      });
      return normalizeList(newListRaw);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskLists'] });
    }
  });

  const updateTaskListMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TaskList> }) => {
      const updatedRaw = await taskListsAPI.update(id, {
        title: data.title ?? undefined,
        description: data.description ?? undefined,
        color: data.color ?? undefined,
        order: data.order ?? undefined
      });
      return normalizeList(updatedRaw);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskLists'] });
    }
  });

  const deleteTaskListMutation = useMutation({
    mutationFn: async (id: string) => {
      await taskListsAPI.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskLists'] });
    }
  });

  const reorderTaskListsMutation = useMutation({
    mutationFn: async (reorderedLists: TaskList[]) => {
      await taskListsAPI.reorder(reorderedLists.map((l) => l.id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskLists'] });
    }
  });

  const moveTaskToListMutation = useMutation({
    mutationFn: async ({
      taskId,
      targetListId
    }: {
      taskId: string;
      targetListId: string | null;
    }) => {
      await tasksAPI.update(taskId, { listId: targetListId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskLists'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  return {
    taskLists,
    loading,
    addTaskList: (data: { title: string; description?: string; color?: string }) =>
      addTaskListMutation.mutateAsync(data),
    updateTaskList: (id: string, data: Partial<TaskList>) =>
      updateTaskListMutation.mutateAsync({ id, data }),
    deleteTaskList: (id: string) => deleteTaskListMutation.mutateAsync(id),
    reorderTaskLists: (reorderedLists: TaskList[]) =>
      reorderTaskListsMutation.mutateAsync(reorderedLists),
    moveTaskToList: (taskId: string, targetListId: string | null) =>
      moveTaskToListMutation.mutateAsync({ taskId, targetListId }),
    refetch: () => queryClient.invalidateQueries({ queryKey: ['taskLists'] })
  };
};
