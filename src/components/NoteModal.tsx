import React, { useState, useEffect } from 'react';
import { X, FileText, Bell, BellOff, Tag, Clock } from 'lucide-react';
import { useNotes } from '../hooks/useNotes';
import { RichTextEditor } from './RichTextEditor';
import { notificationService } from '../services/NotificationService';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingNote?: any;
  onEscapeToSpotlight?: () => void;
}

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  editingNote,
  onEscapeToSpotlight
}) => {
  const { addNote, updateNote } = useNotes();
  const [noteData, setNoteData] = useState({
    title: editingNote?.title || '',
    content: editingNote?.content || '',
    plainContent: editingNote?.plainContent || '',
    tags: (editingNote?.tags || []) as string[],
    hasReminder: editingNote?.hasReminder || false,
    reminderAt: editingNote?.reminderAt ? new Date(editingNote.reminderAt) : (undefined as Date | undefined)
  });
  const [newTag, setNewTag] = useState('');

  // Removed useEffect syncing state from isOpen/editingNote

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        if (onEscapeToSpotlight) {
          onEscapeToSpotlight();
        } else {
          onClose();
        }
      }
    };
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onEscapeToSpotlight, onClose]);

  const handleSave = async () => {
    if (!noteData.title.trim()) return;

    try {
      const dataToSave = { ...noteData, tags: noteData.tags.filter((tag) => tag.trim()) };
      if (editingNote) {
        await updateNote(editingNote.id, dataToSave);
      } else {
        await addNote(dataToSave);
      }

      if (noteData.hasReminder && noteData.reminderAt) {
        notificationService.scheduleReminder(noteData.reminderAt, () => {
          notificationService.showNoteReminder(noteData.title);
        });
      }
      onClose();
      resetForm();
    } catch (error) {
      console.error('Not kaydedilirken hata:', error);
    }
  };

  const resetForm = () => {
    setNoteData({
      title: '',
      content: '',
      plainContent: '',
      tags: [],
      hasReminder: false,
      reminderAt: undefined
    });
  };

  const addTag = () => {
    if (newTag.trim() && !noteData.tags.includes(newTag.trim())) {
      setNoteData((prev) => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNoteData((prev) => ({ ...prev, tags: prev.tags.filter((tag) => tag !== tagToRemove) }));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 z-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            {editingNote ? 'Notu Düzenle' : 'Yeni Not'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-zinc-700">
          {/* Title Input */}
          <input
            type="text"
            value={noteData.title}
            onChange={(e) => setNoteData((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="Not başlığı..."
            className="w-full text-3xl font-bold bg-transparent border-none placeholder-gray-300 dark:placeholder-zinc-600 text-gray-900 dark:text-white focus:ring-0 p-0 mb-6"
            autoFocus
          />

          {/* Rich Text Editor */}
          <div className="min-h-[200px] mb-8">
            <RichTextEditor
              value={noteData.content}
              onChange={(content, plainText) =>
                setNoteData((prev) => ({ ...prev, content, plainContent: plainText }))
              }
              placeholder="Düşüncelerinizi buraya yazın..."
            />
          </div>

          {/* Metadata Section */}
          <div className="space-y-6 pt-6 border-t border-gray-100 dark:border-zinc-800">
            {/* Tags */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wide">
                <Tag className="w-3 h-3" /> Etiketler
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {noteData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg text-sm border border-amber-100 dark:border-amber-900/30"
                  >
                    #{tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:text-amber-900 dark:hover:text-amber-200"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Etiket ekle..."
                  className="bg-transparent border-none text-sm text-gray-700 dark:text-zinc-300 placeholder-gray-400 dark:placeholder-zinc-600 focus:ring-0 p-0 min-w-[100px]"
                />
              </div>
            </div>

            {/* Reminder */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wide">
                <Clock className="w-3 h-3" /> Hatırlatıcı
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() =>
                    setNoteData((prev) => ({
                      ...prev,
                      hasReminder: !prev.hasReminder,
                      reminderAt: !prev.hasReminder ? new Date() : undefined
                    }))
                  }
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors border ${
                    noteData.hasReminder
                      ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/30'
                      : 'bg-white dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600'
                  }`}
                >
                  {noteData.hasReminder ? (
                    <Bell className="w-4 h-4" />
                  ) : (
                    <BellOff className="w-4 h-4" />
                  )}
                  {noteData.hasReminder ? 'Açık' : 'Kapalı'}
                </button>

                {noteData.hasReminder && (
                  <input
                    type="datetime-local"
                    value={
                      noteData.reminderAt ? noteData.reminderAt.toISOString().slice(0, 16) : ''
                    }
                    onChange={(e) =>
                      setNoteData((prev) => ({
                        ...prev,
                        reminderAt: e.target.value ? new Date(e.target.value) : undefined
                      }))
                    }
                    className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex justify-between items-center">
          <span className="text-xs text-gray-400 dark:text-zinc-500">
            {noteData.plainContent.length} karakter
          </span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              disabled={!noteData.title.trim()}
              className="px-8 py-2.5 text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingNote ? 'Güncelle' : 'Kaydet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
