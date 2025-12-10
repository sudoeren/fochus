import { useState, useEffect } from 'react';
import { Note } from '../types';
import { refreshAllNotes, triggerInstantRefresh } from '../utils/refreshUtils';
import { storageService } from '../services/storage';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);

  // Load notes from storage
  const loadNotes = async () => {
    try {
      setLoading(true);
      const dbNotes = await storageService.notes.getAll();
      setNotes(dbNotes);
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
  const addNote = async (noteData: { title: string; content: string }) => {
    try {
      const newNote = await storageService.notes.create({
        title: noteData.title,
        content: noteData.content,
      });
      
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
  const updateNote = async (id: string, noteData: { title: string; content: string }) => {
    try {
      const updatedNote = await storageService.notes.update(id, {
        title: noteData.title,
        content: noteData.content,
      });
      
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
      await storageService.notes.delete(id);
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
      const updatedNote = await storageService.notes.pin(id, isPinned);
      
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
