import React from 'react';
import { Plus, Search, Pin, Calendar, FileText, Trash2, ArrowUpRight } from 'lucide-react';
import { useNotes } from '../hooks/useNotes';
import { EmptyState } from '../components/EmptyState';
import { cn } from '../lib/utils';

interface NotesProps {
  onOpenNoteModal: () => void;
}

export const Notes: React.FC<NotesProps> = ({ onOpenNoteModal }) => {
  const { notes, loading, deleteNote, pinNote } = useNotes();
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    note.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const otherNotes = filteredNotes.filter(n => !n.isPinned);
  const sortedOtherNotes = [...otherNotes].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const NoteCard = ({ note }: { note: any }) => (
    <div 
      className={cn(
        "group relative flex flex-col p-6 h-[280px]",
        "bg-white dark:bg-zinc-900",
        "rounded-[2rem]",
        "border border-zinc-100 dark:border-zinc-800",
        "hover:border-indigo-200 dark:hover:border-zinc-700",
        "transition-all duration-300 ease-out",
        "hover:shadow-xl hover:shadow-indigo-500/5 dark:hover:shadow-zinc-900/50",
        "hover:-translate-y-1"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 line-clamp-1 pr-8">
          {note.title}
        </h3>
        
        {/* Actions */}
        <div className="absolute top-5 right-5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              pinNote(note.id, !note.isPinned);
            }}
            className={cn(
              "p-2 rounded-xl transition-colors",
              note.isPinned 
                ? "text-amber-500 bg-amber-50 dark:bg-amber-900/20" 
                : "text-zinc-400 hover:text-amber-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            )}
          >
            <Pin className={cn("w-4 h-4", note.isPinned && "fill-current")} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if(window.confirm('Notu silmek istediğinize emin misiniz?')) deleteNote(note.id);
            }}
            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {note.isPinned && (
          <div className="absolute top-6 right-6 text-amber-500 group-hover:opacity-0 transition-opacity">
            <Pin className="w-4 h-4 fill-current" />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden relative">
        <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap break-words font-medium">
          {note.content || 'İçerik yok...'}
        </p>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-zinc-900 to-transparent pointer-events-none" />
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          {new Date(note.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
        </span>
        <button className="p-2 rounded-full bg-zinc-50 dark:bg-zinc-800 text-zinc-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-500 text-sm animate-pulse">Notlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-zinc-50/50 dark:bg-black p-6 lg:p-10">
      <div className="max-w-[1600px] mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-white tracking-tight mb-2">Notlarım</h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              Toplam <span className="text-zinc-900 dark:text-white font-semibold">{notes.length}</span> notunuz var.
            </p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Notlarda ara..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <button
              onClick={onOpenNoteModal}
              className="flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all shadow-lg shadow-zinc-900/10 active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Yeni Not
            </button>
          </div>
        </div>

        {/* Empty State */}
        {filteredNotes.length === 0 && (
          <div className="py-20">
            <EmptyState
              type="notes"
              title={searchQuery ? "Sonuç bulunamadı" : "Henüz notunuz yok"}
              description={searchQuery ? "Farklı bir arama terimi deneyin." : "Düşüncelerinizi kaydetmeye hemen başlayın."}
              actionText={searchQuery ? undefined : "İlk Notu Oluştur"}
              onAction={searchQuery ? undefined : onOpenNoteModal}
            />
          </div>
        )}

        {/* Pinned Notes Section */}
        {pinnedNotes.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider pl-1">
              <Pin className="w-4 h-4" />
              Sabitlenenler
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pinnedNotes.map(note => <NoteCard key={note.id} note={note} />)}
            </div>
          </div>
        )}

        {/* Recent Notes Section */}
        {sortedOtherNotes.length > 0 && (
          <div className="space-y-4">
            {pinnedNotes.length > 0 && (
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider pl-1 pt-4 border-t border-zinc-200/50 dark:border-zinc-800/50">
                <FileText className="w-4 h-4" />
                Diğer Notlar
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedOtherNotes.map(note => <NoteCard key={note.id} note={note} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
