import React, { useState, useEffect } from 'react';
import { X, FileText } from 'lucide-react';
import { useNotes } from '../hooks/useNotes';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingNote?: any;
}

export const NoteModal: React.FC<NoteModalProps> = ({ isOpen, onClose, editingNote }) => {
  const { addNote, updateNote } = useNotes();
  const [noteData, setNoteData] = useState({
    title: '',
    content: ''
  });

  useEffect(() => {
    if (isOpen) {
      setNoteData({
        title: editingNote?.title || '',
        content: editingNote?.content || ''
      });
    }
  }, [isOpen, editingNote]);

  const handleSave = async () => {
    if (!noteData.title.trim()) return;

    try {
      if (editingNote) {
        await updateNote(editingNote.id, noteData);
      } else {
        await addNote(noteData);
      }
      onClose();
      setNoteData({ title: '', content: '' });
    } catch (error) {
      console.error('Not kaydedilirken hata:', error);
    }
  };

  const handleClose = () => {
    onClose();
    setNoteData({ title: '', content: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-hidden">
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
                Düşüncelerinizi kaydedin
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
        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
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

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              İçerik
            </label>
            <textarea
              value={noteData.content}
              onChange={(e) => setNoteData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Notunuzu buraya yazın..."
              rows={12}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {noteData.content.length} karakter
              </span>
            </div>
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
