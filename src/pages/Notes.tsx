import React, { useEffect } from 'react';
import { Plus, Trash2, Pin, Calendar } from 'lucide-react';
import { useNotes } from '../hooks/useNotes';
import { EmptyState } from '../components/EmptyState';

interface NotesProps {
  onOpenNoteModal: () => void;
}

export const Notes: React.FC<NotesProps> = ({ onOpenNoteModal }) => {
  const { notes, loading, deleteNote, pinNote } = useNotes();

  // Sort notes: pinned first, then by creation date (newest first)
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  useEffect(() => {
    // Notes sayfalandığında otomatik olarak notları yükle
  }, []);

  const handleDeleteNote = async (noteId: string) => {
    if (window.confirm('Bu notu silmek istediğinizden emin misiniz?')) {
      try {
        await deleteNote(noteId);
      } catch (error) {
        console.error('Not silinirken hata:', error);
      }
    }
  };

  const handlePinNote = async (noteId: string, isPinned: boolean) => {
    try {
      await pinNote(noteId, !isPinned);
    } catch (error) {
      console.error('Not sabitlenirken hata:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Notlar yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Notlarım
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span>{notes.length} not</span>
            <span className="hidden sm:inline">•</span>
            <span className="text-xs sm:text-sm">Ctrl+K ile arama yapabilirsiniz</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNoteModal}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 
                     text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg flex items-center gap-2 transition-all duration-200 
                     shadow-md hover:shadow-lg transform hover:scale-105 text-sm sm:text-base flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Yeni Not Ekle</span>
            <span className="sm:hidden">Yeni Not</span>
          </button>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {sortedNotes.length > 0 ? (
          sortedNotes.map((note) => (
            <div
              key={note.id}
              data-note-id={note.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow relative group"
            >
              {/* Pin Button */}
              <button
                onClick={() => handlePinNote(note.id, note.isPinned || false)}
                className={`absolute top-3 right-3 p-1.5 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                  note.isPinned 
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 opacity-100' 
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-500'
                }`}
                title={note.isPinned ? 'Sabitlemeyi kaldır' : 'Sabitle'}
              >
                <Pin className={`w-3 h-3 ${note.isPinned ? 'fill-current' : ''}`} />
              </button>

              {/* Note Content */}
              <div className="pr-8">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 flex items-center gap-2">
                  {note.isPinned && (
                    <Pin className="w-3 h-3 text-yellow-500 fill-current flex-shrink-0" />
                  )}
                  {note.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-4">
                  {note.content || 'İçerik yok...'}
                </p>
                
                {/* Date */}
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3">
                  <Calendar className="w-3 h-3 mr-1" />
                  {note.createdAt.toLocaleDateString('tr-TR')}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Sil"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full">
            <EmptyState
              type="notes"
              title="Henüz notunuz yok"
              description="İlk notunuzu oluşturarak düşüncelerinizi kaydetmeye başlayın. Notlarınızı etiketleyebilir ve sabitleyebilirsiniz."
              actionText="İlk Notumu Oluştur"
              onAction={onOpenNoteModal}
            />
          </div>
        )}
      </div>
    </div>
  );
};
