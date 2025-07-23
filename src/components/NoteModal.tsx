import React, { useState } from 'react';
import { X, BookOpen, Type, AlignLeft, Save } from 'lucide-react';
import { useNotes } from '../hooks/useNotes';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingNote?: any;
}

export const NoteModal: React.FC<NoteModalProps> = ({ isOpen, onClose, editingNote }) => {
  const { addNote, updateNote } = useNotes();
  const [noteData, setNoteData] = useState({
    title: editingNote?.title || '',
    content: editingNote?.content || ''
  });

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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 dark:from-gray-900 dark:via-gray-800/50 dark:to-blue-900/10 
                      rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 w-full max-w-5xl max-h-[90vh] 
                      backdrop-blur-xl overflow-hidden relative">
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-400/10 to-blue-400/10 rounded-full blur-xl"></div>
        
        {/* Header - Writer Style */}
        <div className="relative p-8 border-b border-gray-200/50 dark:border-gray-700/50">
          <button 
            onClick={handleClose}
            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 
                     hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-full transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl">
              <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                {editingNote ? 'Notunuzu Düzenleyin' : 'Yeni Hikayenizi Yazın'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Düşüncelerinize şekil verin, fikirlerinizi kaydedin
              </p>
            </div>
          </div>
        </div>
        
        {/* Content Area - Writing Focus */}
        <div className="p-8 space-y-8">
          {/* Title Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <Type className="w-5 h-5" />
              <label className="text-lg font-semibold">Başlık</label>
            </div>
            <input
              type="text"
              value={noteData.title}
              onChange={(e) => setNoteData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-6 py-4 text-2xl font-bold border-2 border-gray-200/50 dark:border-gray-700/50 rounded-2xl
                       bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white backdrop-blur-sm
                       focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400/50 
                       placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
              placeholder="Notunuzun başlığını yazın..."
              autoFocus
            />
          </div>
          
          {/* Content Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <AlignLeft className="w-5 h-5" />
              <label className="text-lg font-semibold">İçerik</label>
            </div>
            <div className="relative">
              <textarea
                value={noteData.content}
                onChange={(e) => setNoteData(prev => ({ ...prev, content: e.target.value }))}
                rows={16}
                className="w-full px-6 py-6 text-lg leading-relaxed border-2 border-gray-200/50 dark:border-gray-700/50 rounded-2xl
                         bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white backdrop-blur-sm
                         focus:outline-none focus:ring-4 focus:ring-blue-500/30 focus:border-blue-400/50 
                         placeholder-gray-400 dark:placeholder-gray-500 resize-none transition-all duration-200"
                placeholder="Hikayenizi burada anlatın... 
                
• Fikirlerinizi özgürce yazın
• Markdown formatını kullanabilirsiniz  
• İstediğiniz kadar detaya girebilirsiniz"
              />
              <div className="absolute bottom-4 right-4 text-sm text-gray-400 dark:text-gray-500">
                {noteData.content.length} karakter
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer - Action Buttons */}
        <div className="px-8 py-6 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/30 dark:bg-gray-800/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Otomatik kayıt aktif
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleClose}
                className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 
                         font-medium transition-all duration-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-xl"
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                disabled={!noteData.title.trim()}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 
                         disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-600 dark:disabled:to-gray-700
                         disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200
                         shadow-lg hover:shadow-xl disabled:shadow-none flex items-center gap-2
                         disabled:text-gray-500 dark:disabled:text-gray-400"
              >
                <Save className="w-4 h-4" />
                {editingNote ? 'Güncelle' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
