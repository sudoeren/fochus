import React from 'react';
import { Plus, Trash2, Pin, Calendar, MoreHorizontal } from 'lucide-react';
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

  const handleDeleteNote = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    if (window.confirm('Bu notu silmek istediğinizden emin misiniz?')) {
      try {
        await deleteNote(noteId);
      } catch (error) {
        console.error('Not silinirken hata:', error);
      }
    }
  };

  const handlePinNote = async (e: React.MouseEvent, noteId: string, isPinned: boolean) => {
    e.stopPropagation();
    try {
      await pinNote(noteId, !isPinned);
    } catch (error) {
      console.error('Not sabitlenirken hata:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3 text-gray-500 dark:text-zinc-400">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          <span>Notlar yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50 dark:bg-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="space-y-1 min-w-0 flex-1">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
            Notlarım
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-400">
            <span className="font-medium bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md text-gray-900 dark:text-zinc-200">
              {notes.length}
            </span>
            <span>not bulundu</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNoteModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all duration-200 font-medium shadow-sm hover:shadow-md active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Yeni Not</span>
            <span className="sm:hidden">Ekle</span>
          </button>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {sortedNotes.length > 0 ? (
          sortedNotes.map((note) => (
            <div
              key={note.id}
              data-note-id={note.id}
              className={`
                group relative flex flex-col p-5 h-[280px]
                bg-white dark:bg-zinc-900 
                rounded-2xl border border-gray-200 dark:border-zinc-800
                hover:border-gray-300 dark:hover:border-zinc-700 hover:shadow-lg dark:hover:shadow-zinc-900/50
                transition-all duration-300 cursor-default
                ${note.isPinned ? 'ring-2 ring-amber-500/20 dark:ring-amber-500/10' : ''}
              `}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-1 pr-8">
                  {note.title}
                </h3>
                
                {/* Actions (visible on hover) */}
                <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white dark:bg-zinc-900 pl-2">
                  <button
                    onClick={(e) => handlePinNote(e, note.id, note.isPinned || false)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      note.isPinned 
                        ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/20' 
                        : 'text-gray-400 hover:text-amber-500 hover:bg-gray-100 dark:hover:bg-zinc-800'
                    }`}
                    title={note.isPinned ? 'Sabitlemeyi kaldır' : 'Sabitle'}
                  >
                    <Pin className={`w-4 h-4 ${note.isPinned ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={(e) => handleDeleteNote(e, note.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Always visible pin icon if pinned (when not hovering) */}
                {note.isPinned && (
                  <div className="absolute top-4 right-4 text-amber-500 group-hover:opacity-0 transition-opacity duration-200">
                    <Pin className="w-4 h-4 fill-current" />
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div className="flex-1 overflow-hidden relative">
                <p className="text-gray-600 dark:text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {note.content || 'İçerik yok...'}
                </p>
                {/* Gradient fade at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white dark:from-zinc-900 to-transparent pointer-events-none" />
              </div>
              
              {/* Card Footer */}
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-xs text-gray-400 dark:text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {note.createdAt.toLocaleDateString('tr-TR', { 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </div>
                
                {/* Etiketler gelecekte buraya eklenebilir */}
                {/* <div className="flex gap-1">
                  <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-zinc-800 rounded text-[10px]">#iş</span>
                </div> */}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12">
            <EmptyState
              type="notes"
              title="Henüz notunuz yok"
              description="İlk notunuzu oluşturarak düşüncelerinizi kaydetmeye başlayın."
              actionText="İlk Notumu Oluştur"
              onAction={onOpenNoteModal}
            />
          </div>
        )}
      </div>
    </div>
  );
};