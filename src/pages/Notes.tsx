import React, { useState } from 'react';
import {
  Plus,
  Search,
  Pin,
  Calendar,
  Trash2,
  FileText
} from 'lucide-react';
import { useNotes } from '../hooks/useNotes';
import { cn } from '../lib/utils';

interface NotesProps {
  onOpenNoteModal: () => void;
  onEditNote: (id: string) => void;
}

export const Notes: React.FC<NotesProps> = ({ onOpenNoteModal, onEditNote }) => {
  const { notes, deleteNote, pinNote, loading } = useNotes();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const otherNotes = filteredNotes.filter(n => !n.isPinned);

  // Masonry Card Component
  const NoteCard = ({ note }: { note: any }) => (
    <div
      onClick={() => onEditNote(note.id)}
      className="group relative flex flex-col mb-6 break-inside-avoid bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
    >

      {/* Pin Badge */}
      {note.isPinned && (
        <div className="absolute top-4 right-4 text-amber-500 bg-amber-50 dark:bg-amber-900/20 p-1.5 rounded-full">
          <Pin className="w-3.5 h-3.5 fill-current" />
        </div>
      )}

      {/* Title */}
      <h3 className={cn("font-bold text-lg text-zinc-900 dark:text-zinc-100 mb-3 leading-tight", note.isPinned && "pr-8")}>
        {note.title}
      </h3>

      {/* Content Preview */}
      <div className="mb-4 relative">
        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap break-words font-medium line-clamp-[8]">
          {note.content}
        </p>
        {!note.content && <p className="text-sm text-zinc-400 italic">İçerik yok...</p>}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
          <Calendar className="w-3 h-3" />
          {new Date(note.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
        </div>

        {/* Actions - Visible on Hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <button
            onClick={(e) => { e.stopPropagation(); pinNote(note.id, !note.isPinned); }}
            className={cn(
              "p-2 rounded-xl transition-colors",
              note.isPinned ? "text-amber-500 bg-amber-50 dark:bg-amber-900/20" : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            )}
            title={note.isPinned ? "Sabitlemeyi Kaldır" : "Sabitle"}
          >
            <Pin className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); if (confirm('Not silinsin mi?')) deleteNote(note.id); }}
            className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
            title="Sil"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* Header */}
      <div className="flex-none p-8 lg:p-10 pb-4">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">Notlar</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">Düşüncelerini ve fikirlerini kaydet.</p>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Notlarda ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-zinc-100 dark:bg-zinc-900/50 border-none rounded-2xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none transition-all font-medium"
            />
          </div>
        </div>
      </div>

      {/* Masonry Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-10 pt-2 pb-24">
        <div className="max-w-[1800px] mx-auto space-y-10">

          {filteredNotes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
              <div className="w-20 h-20 rounded-[2rem] bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-6">
                <FileText className="w-10 h-10 opacity-30" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
                {searchQuery ? "Sonuç bulunamadı" : "Not defterin boş"}
              </h3>
              <p className="text-zinc-500 dark:text-zinc-500">
                {searchQuery ? "Farklı bir arama yapmayı dene." : "Harika fikirlerini kaydetmeye başla."}
              </p>
            </div>
          )}

          {pinnedNotes.length > 0 && (
            <section>
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider pl-1 mb-6">
                <Pin className="w-4 h-4" />
                Sabitlenenler
              </div>
              <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                {pinnedNotes.map(note => <NoteCard key={note.id} note={note} />)}
              </div>
            </section>
          )}

          {otherNotes.length > 0 && (
            <section>
              {pinnedNotes.length > 0 && (
                <div className="flex items-center gap-2 text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider pl-1 mb-6 border-t border-zinc-200/50 dark:border-zinc-800/50 pt-8">
                  <FileText className="w-4 h-4" />
                  Diğerleri
                </div>
              )}
              <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                {otherNotes.map(note => <NoteCard key={note.id} note={note} />)}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Floating Add Button */}
      <button
        onClick={onOpenNoteModal}
        className="fixed bottom-8 right-8 z-50 flex items-center gap-3 pl-4 pr-6 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 group"
      >
        <div className="bg-white/20 dark:bg-black/10 p-1 rounded-full">
          <Plus className="w-5 h-5" />
        </div>
        Yeni Not
      </button>
    </div>
  );
};