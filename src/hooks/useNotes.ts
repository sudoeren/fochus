import { useState, useEffect } from 'react';
import { Note } from '../types/index';
import { triggerInstantRefresh } from '../utils/refreshUtils';
import { notesAPI } from '../services/api';
import { deserializeApiDates } from '../utils/apiTransforms';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);

  const normalizeNote = (raw: any): Note => {
    const note = deserializeApiDates(raw) as any;
    return {
      ...note,
      title: (note.title ?? '').toString(),
      content: (note.content ?? '').toString(),
      isPinned: Boolean(note.isPinned),
      isDeleted: Boolean(note.isDeleted),
      hasReminder: Boolean(note.hasReminder ?? false),
      reminderAt: note.reminderAt ?? undefined,
      plainContent: note.plainContent ?? note.content ?? '',
      tags: note.tags ?? [],
      color: note.color
    } as Note;
  };

  // Load notes from storage
  const loadNotes = async () => {
    try {
      setLoading(true);
      const apiNotes = await notesAPI.getAll();
      setNotes(apiNotes.map(normalizeNote));
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // İlk yüklemede notes'ları al
    loadNotes();

    // INSTANT refresh event listener
    const handleInstantRefresh = () => {
      console.log('⚡ INSTANT refresh - Notes yeniden yükleniyor...');
      loadNotes();
    };

    // Custom event for instant refresh
    window.addEventListener('refresh-notes', handleInstantRefresh);

    // Cleanup
    return () => {
      window.removeEventListener('refresh-notes', handleInstantRefresh);
    };
  }, []);

  // Add new note
  const addNote = async (noteData: Partial<Note>) => {
    try {
      const title = noteData.title?.trim() ? noteData.title.trim() : 'Adsız Not';
      const created = await notesAPI.create({
        title,
        content: noteData.content ?? '',
        isPinned: noteData.isPinned ?? false
      });
      const newNote = normalizeNote(created);

      // ULTRA FAST refresh - hemen tetikle!
      triggerInstantRefresh(); // Hemen global refresh
      await loadNotes(); // Local refresh
      triggerInstantRefresh(); // Bir kez daha global refresh
      return newNote;
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  };

  // Update note
  const updateNote = async (id: string, noteData: Partial<Note>) => {
    try {
      const payload: any = {};
      if (noteData.title !== undefined) {
        payload.title = noteData.title?.trim() ? noteData.title.trim() : 'Adsız Not';
      }
      if (noteData.content !== undefined) {
        payload.content = noteData.content ?? '';
      }
      if (noteData.isPinned !== undefined) {
        payload.isPinned = noteData.isPinned;
      }

      const updated = await notesAPI.update(id, payload);
      const updatedNote = normalizeNote(updated);

      // ULTRA FAST refresh - hemen tetikle!
      triggerInstantRefresh(); // Hemen global refresh
      await loadNotes(); // Local refresh
      triggerInstantRefresh(); // Bir kez daha global refresh
      return updatedNote;
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  };

  // Delete note
  const deleteNote = async (id: string) => {
    try {
      // ULTRA FAST refresh - hemen tetikle!
      triggerInstantRefresh(); // Hemen global refresh
      await notesAPI.delete(id);
      await loadNotes(); // Local refresh
      triggerInstantRefresh(); // Bir kez daha global refresh
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  };

  // Pin/unpin note
  const pinNote = async (id: string, isPinned: boolean) => {
    try {
      const updated = await notesAPI.update(id, { isPinned });
      const updatedNote = normalizeNote(updated);

      setNotes(prev => prev.map(note =>
        note.id === id ? updatedNote : note
      ));

      return updatedNote;
    } catch (error) {
      console.error('Error pinning note:', error);
      throw error;
    }
  };

  // Search notes
  const searchNotes = (searchTerm: string) => {
    let filtered = notes;

    if (searchTerm) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  return {
    notes,
    loading,
    addNote,
    updateNote,
    deleteNote,
    pinNote,
    searchNotes,
    loadNotes
  };
};
