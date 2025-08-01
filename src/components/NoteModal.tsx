import React, { useState, useEffect } from 'react';
import { X, FileText, Bell, BellOff } from 'lucide-react';
import { useNotes } from '../hooks/useNotes';
import { RichTextEditor } from './RichTextEditor';
import { notificationService } from '../services/NotificationService';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingNote?: any;
  onEscapeToSpotlight?: () => void; // ESC ile Spotlight'a dönme
}

export const NoteModal: React.FC<NoteModalProps> = ({ isOpen, onClose, editingNote, onEscapeToSpotlight }) => {
  const { addNote, updateNote } = useNotes();
  const [noteData, setNoteData] = useState({
    title: '',
    content: '',
    plainContent: '',
    tags: [] as string[],
    hasReminder: false,
    reminderAt: undefined as Date | undefined
  });
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNoteData({
        title: editingNote?.title || '',
        content: editingNote?.content || '',
        plainContent: editingNote?.plainContent || '',
        tags: editingNote?.tags || [],
        hasReminder: editingNote?.hasReminder || false,
        reminderAt: editingNote?.reminderAt ? new Date(editingNote.reminderAt) : undefined
      });
    }
  }, [isOpen, editingNote]);

  // ESC tuş handler'ı
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        if (onEscapeToSpotlight) {
          onEscapeToSpotlight(); // Spotlight'a dön
        } else {
          handleClose(); // Normal kapanma
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onEscapeToSpotlight]);

  const handleSave = async () => {
    if (!noteData.title.trim()) return;

    try {
      const dataToSave = {
        ...noteData,
        tags: noteData.tags.filter(tag => tag.trim()) // Empty tags'leri temizle
      };

      if (editingNote) {
        await updateNote(editingNote.id, dataToSave);
      } else {
        await addNote(dataToSave);
      }

      // Schedule reminder if set
      if (noteData.hasReminder && noteData.reminderAt) {
        notificationService.scheduleReminder(noteData.reminderAt, () => {
          notificationService.showNoteReminder(noteData.title);
        });
      }

      onClose();
      setNoteData({ 
        title: '', 
        content: '', 
        plainContent: '', 
        tags: [], 
        hasReminder: false, 
        reminderAt: undefined 
      });
    } catch (error) {
      console.error('Not kaydedilirken hata:', error);
    }
  };

  const handleClose = () => {
    onClose();
    setNoteData({ 
      title: '', 
      content: '', 
      plainContent: '', 
      tags: [], 
      hasReminder: false, 
      reminderAt: undefined 
    });
  };

  const handleContentChange = (content: string, plainText: string) => {
    setNoteData(prev => ({ 
      ...prev, 
      content, 
      plainContent: plainText 
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !noteData.tags.includes(newTag.trim())) {
      setNoteData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNoteData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const toggleReminder = () => {
    setNoteData(prev => ({
      ...prev,
      hasReminder: !prev.hasReminder,
      reminderAt: !prev.hasReminder ? new Date() : undefined
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingNote ? 'Notu Düzenle' : 'Yeni Not'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Düşüncelerinizi zengin metin formatında kaydedin
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Başlık
            </label>
            <input
              type="text"
              value={noteData.title}
              onChange={(e) => setNoteData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Not başlığı..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              autoFocus
            />
          </div>

          {/* Content with Rich Text Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              İçerik
            </label>
            <RichTextEditor
              value={noteData.content}
              onChange={handleContentChange}
              placeholder="Notunuzu buraya yazın... Zengin metin özelliklerini kullanarak biçimlendirebilirsiniz."
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {noteData.plainContent.length} karakter
              </span>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Etiketler
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {noteData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                >
                  #{tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Yeni etiket ekle..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
              <button
                onClick={addTag}
                disabled={!newTag.trim() || noteData.tags.includes(newTag.trim())}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg disabled:cursor-not-allowed transition-colors"
              >
                Ekle
              </button>
            </div>
          </div>

          {/* Reminder */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${noteData.hasReminder ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
                  {noteData.hasReminder ? (
                    <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  ) : (
                    <BellOff className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                    Hatırlatıcı
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Not için bildirin ayarla
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={noteData.hasReminder}
                  onChange={toggleReminder}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {noteData.hasReminder && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hatırlatıcı Tarihi ve Saati
                </label>
                <input
                  type="datetime-local"
                  value={noteData.reminderAt ? noteData.reminderAt.toISOString().slice(0, 16) : ''}
                  onChange={(e) => setNoteData(prev => ({
                    ...prev,
                    reminderAt: e.target.value ? new Date(e.target.value) : undefined
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={!noteData.title.trim()}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg disabled:cursor-not-allowed transition-colors"
          >
            {editingNote ? 'Güncelle' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
};
