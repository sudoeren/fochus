import { useState, useEffect } from 'react';
import { Note } from '../types';

export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);

  // Load notes from database
  const loadNotes = async () => {
    try {
      setLoading(true);
      const dbNotes = await window.electronAPI.database.getNotes();
      
      // Convert database format to app format
      const formattedNotes: Note[] = dbNotes.map((note: any) => ({
        id: note.id,
        title: note.title,
        content: note.content,
        isPinned: note.isPinned || false,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt)
      }));
      
      setNotes(formattedNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  // Add new note
  const addNote = async (noteData: { title: string; content: string }) => {
    try {
      const newNote = await window.electronAPI.database.createNote({
        title: noteData.title,
        content: noteData.content,
        tags: []
      });
      
      const formattedNote: Note = {
        id: newNote.id,
        title: newNote.title,
        content: newNote.content,
        isPinned: newNote.isPinned || false,
        createdAt: new Date(newNote.createdAt),
        updatedAt: new Date(newNote.updatedAt)
      };
      
      setNotes(prev => [formattedNote, ...prev]);
      return formattedNote;
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  };

  // Update note
  const updateNote = async (id: string, noteData: { title: string; content: string }) => {
    try {
      const updatedNote = await window.electronAPI.database.updateNote(id, {
        title: noteData.title,
        content: noteData.content,
        tags: []
      });
      
      const formattedNote: Note = {
        id: updatedNote.id,
        title: updatedNote.title,
        content: updatedNote.content,
        isPinned: updatedNote.isPinned || false,
        createdAt: new Date(updatedNote.createdAt),
        updatedAt: new Date(updatedNote.updatedAt)
      };
      
      setNotes(prev => prev.map(note => 
        note.id === id ? formattedNote : note
      ));
      
      return formattedNote;
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  };

  // Delete note
  const deleteNote = async (id: string) => {
    try {
      await window.electronAPI.database.deleteNote(id);
      setNotes(prev => prev.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  };

  // Pin/unpin note
  const pinNote = async (id: string, isPinned: boolean) => {
    try {
      const updatedNote = await (window.electronAPI.database as any).pinNote(id, isPinned);
      
      const formattedNote: Note = {
        id: updatedNote.id,
        title: updatedNote.title,
        content: updatedNote.content,
        isPinned: updatedNote.isPinned,
        createdAt: new Date(updatedNote.createdAt),
        updatedAt: new Date(updatedNote.updatedAt)
      };
      
      setNotes(prev => prev.map(note => 
        note.id === id ? formattedNote : note
      ));
      
      return formattedNote;
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
