import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Note } from '../types/index';
import { notesAPI } from '../services/api';
import { deserializeApiDates } from '../utils/apiTransforms';

export const useNotes = () => {
  const queryClient = useQueryClient();

  const normalizeNote = (raw: Record<string, unknown>): Note => {
    const note = deserializeApiDates(raw) as Record<string, unknown>;
    return {
      ...note,
      title: (note.title ?? '').toString(),
      content: (note.content ?? '').toString(),
      isPinned: Boolean(note.isPinned),
      isDeleted: Boolean(note.isDeleted),
      hasReminder: Boolean(note.hasReminder ?? false),
      reminderAt: note.reminderAt ?? undefined,
      plainContent: note.plainContent ?? note.content ?? '',
      color: note.color as string | undefined
    } as Note;
  };

  const { data: notes = [], isLoading: loading } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const apiNotes = await notesAPI.getAll();
      return apiNotes.map(normalizeNote);
    }
  });

  const addNoteMutation = useMutation({
    mutationFn: async (noteData: Partial<Note>) => {
      const title = noteData.title?.trim() ? noteData.title.trim() : 'Adsız Not';
      const created = await notesAPI.create({
        title,
        content: noteData.content ?? '',
        isPinned: noteData.isPinned ?? false
      });
      return normalizeNote(created);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    }
  });

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Note> }) => {
      const payload: Record<string, unknown> = {};
      if (data.title !== undefined) {
        payload.title = data.title?.trim() ? data.title.trim() : 'Adsız Not';
      }
      if (data.content !== undefined) {
        payload.content = data.content ?? '';
      }
      if (data.isPinned !== undefined) {
        payload.isPinned = data.isPinned;
      }
      const updated = await notesAPI.update(id, payload);
      return normalizeNote(updated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    }
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      await notesAPI.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    }
  });

  const searchNotes = (searchTerm: string) => {
    let filtered = notes;
    if (searchTerm) {
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  };

  return {
    notes,
    loading,
    addNote: (data: Partial<Note>) => addNoteMutation.mutateAsync(data),
    updateNote: (id: string, data: Partial<Note>) => updateNoteMutation.mutateAsync({ id, data }),
    deleteNote: (id: string) => deleteNoteMutation.mutateAsync(id),
    pinNote: (id: string, isPinned: boolean) =>
      updateNoteMutation.mutateAsync({ id, data: { isPinned } }),
    searchNotes,
    loadNotes: () => queryClient.invalidateQueries({ queryKey: ['notes'] })
  };
};
