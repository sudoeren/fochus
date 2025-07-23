import React, { useState } from 'react';
import { X, FileText, Calendar } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl max-h-[85vh] overflow-hidden">
        {/* Geniş Header - Not için */}
        <div className="flex items-center justify-between p-8 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {editingNote ? 'Notu Düzenle' : 'Yeni Not Oluştur'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Detaylı notlarınızı buraya yazabilirsiniz
              </p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Spacious Body - Not için daha geniş alan */}
        <div className="p-8 space-y-6">
          <div>
            <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Not Başlığı
            </label>
            <input
              type="text"
              value={noteData.title}
              onChange={(e) => setNoteData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-5 py-4 text-lg border border-gray-300 dark:border-gray-600 rounded-xl
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-3 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:border-blue-500
                       placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Notunuza açıklayıcı bir başlık verin..."
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Not İçeriği
            </label>
            <textarea
              value={noteData.content}
              onChange={(e) => setNoteData(prev => ({ ...prev, content: e.target.value }))}
              rows={12}
              className="w-full px-5 py-4 text-base border border-gray-300 dark:border-gray-600 rounded-xl
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-3 focus:ring-blue-500/50 dark:focus:ring-blue-400/50 focus:border-blue-500
                       placeholder-gray-500 dark:placeholder-gray-400 resize-none leading-relaxed"
              placeholder="Notunuzun detaylarını buraya yazın... Markdown desteklenir."
            />
          </div>
        </div>
        
        {/* Enhanced Footer */}
        <div className="flex items-center justify-between p-8 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="w-4 h-4 mr-2" />
            {editingNote ? 'Son düzenleme' : 'Bugün oluşturulacak'}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleClose}
              className="px-8 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 
                       hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors font-medium"
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              disabled={!noteData.title.trim()}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 
                       disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white 
                       rounded-xl transition-all font-medium shadow-lg hover:shadow-xl
                       disabled:text-gray-500 dark:disabled:text-gray-400"
            >
              {editingNote ? 'Notu Güncelle' : 'Notu Kaydet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
