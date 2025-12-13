import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Pin, 
  Calendar, 
  Trash2, 
  FileText, 
  ArrowUpRight,
  MoreVertical
} from 'lucide-react';
import { useNotes } from '../hooks/useNotes';
import { cn } from '../lib/utils';

interface NotesProps {
  onOpenNoteModal: () => void;
}

export const Notes: React.FC<NotesProps> = ({ onOpenNoteModal }) => {
  const { notes, deleteNote, pinNote, loading } = useNotes();
  const [searchQuery, setSearchQuery] = useState('');

  // Notları Filtreleme ve Sıralama
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    note.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const otherNotes = filteredNotes.filter(n => !n.isPinned);

  // Yükleniyor Göstergesi
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not Kartı Bileşeni
  const NoteCard = ({ note }: { note: any }) => (
    <div 
      className={cn(
        "group relative flex flex-col h-[280px] p-6 transition-all duration-300",
        "bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm",
        "border border-white/20 dark:border-white/5",
        "rounded-[2rem]",
        "hover:-translate-y-1 hover:shadow-xl hover:bg-white/80 dark:hover:bg-zinc-900/80"
      )}
    >
      {/* Kart Başlığı ve Pin Durumu */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 line-clamp-1 pr-8">
          {note.title}
        </h3>
        
        {/* Sabitleme İkonu (Aktifse görünür) */}
        {note.isPinned && (
          <Pin className="absolute top-1 right-0 w-4 h-4 text-amber-500 fill-current" />
        )}
      </div>

      {/* Kart İçeriği */}
      <div className="flex-1 overflow-hidden relative mb-4">
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap font-medium break-words">
          {note.content || "İçerik yok..."}
        </p>
        {/* Metin Taşması İçin Fade Efekti */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/80 via-white/40 to-transparent dark:from-zinc-900/80 dark:via-zinc-900/40 pointer-events-none" />
      </div>

      {/* Alt Bilgi ve Aksiyonlar */}
      <div className="mt-auto flex items-center justify-between pt-4 border-t border-zinc-200/50 dark:border-white/5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 uppercase tracking-wide">
          <Calendar className="w-3.5 h-3.5" />
          {new Date(note.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
        </div>

        {/* Hover Aksiyonları */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <button 
            onClick={(e) => { e.stopPropagation(); pinNote(note.id, !note.isPinned); }}
            className={cn(
              "p-2 rounded-xl transition-colors",
              note.isPinned 
                ? "text-amber-500 bg-amber-50 dark:bg-amber-900/20" 
                : "text-zinc-400 hover:text-amber-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            )}
            title={note.isPinned ? "Sabitlemeyi Kaldır" : "Sabitle"}
          >
            <Pin className={cn("w-4 h-4", note.isPinned && "fill-current")} />
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); if(confirm('Bu notu silmek istiyor musunuz?')) deleteNote(note.id); }}
            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
            title="Sil"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header Alanı */}
      <div className="flex-none p-8 lg:p-10 pb-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-white tracking-tight mb-2">Notlarım</h1>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium">
              Toplam <span className="text-zinc-900 dark:text-white font-bold">{notes.length}</span> notunuz var.
            </p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Notlarda ara..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white/50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm backdrop-blur-sm"
              />
            </div>
            <button
              onClick={onOpenNoteModal}
              className="flex items-center gap-2 px-6 py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Yeni Not
            </button>
          </div>
        </div>
      </div>

      {/* İçerik Alanı (Grid) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-10 pt-0">
        <div className="max-w-[1800px] mx-auto space-y-12 pb-20">
          
          {/* Boş Durum */}
          {filteredNotes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
              <div className="w-20 h-20 rounded-[2rem] bg-zinc-100 dark:bg-zinc-800/50 flex items-center justify-center mb-6">
                <FileText className="w-10 h-10 opacity-50" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
                {searchQuery ? "Sonuç bulunamadı" : "Henüz notunuz yok"}
              </h3>
              <p className="text-zinc-500 dark:text-zinc-500">
                {searchQuery ? "Farklı bir arama yapmayı deneyin." : "Düşüncelerinizi kaydetmeye hemen başlayın."}
              </p>
            </div>
          )}

          {/* Sabitlenen Notlar */}
          {pinnedNotes.length > 0 && (
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider pl-1">
                <Pin className="w-4 h-4" />
                Sabitlenenler
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {pinnedNotes.map(note => <NoteCard key={note.id} note={note} />)}
              </div>
            </section>
          )}

          {/* Diğer Notlar */}
          {otherNotes.length > 0 && (
            <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
              {pinnedNotes.length > 0 && (
                <div className="flex items-center gap-2 text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider pl-1 border-t border-zinc-200/50 dark:border-zinc-800/50 pt-8">
                  <FileText className="w-4 h-4" />
                  Diğer Notlar
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {otherNotes.map(note => <NoteCard key={note.id} note={note} />)}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
