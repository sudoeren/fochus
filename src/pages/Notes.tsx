import React, { useState } from 'react';
import { Plus, Search, Pin, Trash2, FileText } from 'lucide-react';
import { useNotes } from '../hooks/useNotes';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import type { Note } from '../types';

interface NotesProps {
  onOpenNoteModal: () => void;
  onEditNote: (id: string) => void;
}

export const Notes: React.FC<NotesProps> = ({ onOpenNoteModal, onEditNote }) => {
  const { t } = useTranslation();
  const { notes, deleteNote, pinNote, loading } = useNotes();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const otherNotes = filteredNotes.filter((n) => !n.isPinned);

  const NoteCard = ({ note }: { note: Note }) => (
    <div
      onClick={() => onEditNote(note.id)}
      className="group relative flex flex-col mb-4 break-inside-avoid bg-white/80 dark:bg-zinc-900/80 rounded-2xl p-5 shadow-sm ring-1 ring-zinc-200/50 dark:ring-zinc-800/50 hover:shadow-md hover:ring-zinc-300 dark:hover:ring-zinc-700 transition-all cursor-pointer"
    >
      {note.isPinned && <Pin className="absolute top-4 right-4 w-3.5 h-3.5 text-amber-500" />}

      <h3
        className={cn(
          'font-bold text-zinc-900 dark:text-zinc-100 mb-2 leading-tight',
          note.isPinned ? 'pr-8 text-base' : 'text-[15px]'
        )}
      >
        {note.title}
      </h3>

      <div className="mb-3">
        {note.content ? (
          <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400 whitespace-pre-wrap break-words line-clamp-[6]">
            {note.content}
          </p>
        ) : (
          <p className="text-sm text-zinc-300 dark:text-zinc-600 italic">{t('notes.no_content')}</p>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between">
        <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
          {new Date(note.createdAt).toLocaleDateString(i18n.language, {
            day: 'numeric',
            month: 'long'
          })}
        </span>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              pinNote(note.id, !note.isPinned);
            }}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              note.isPinned
                ? 'text-amber-500'
                : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
            )}
            title={note.isPinned ? t('notes.unpin') : t('notes.pin')}
          >
            <Pin className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(t('notes.confirm_delete'))) deleteNote(note.id);
            }}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 transition-colors"
            title={t('common.delete')}
          >
            <Trash2 className="w-3.5 h-3.5" />
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
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">
              {t('notes.title')}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">{t('notes.subtitle')}</p>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder={t('notes.search_placeholder')}
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
                {searchQuery ? t('notes.no_results') : t('notes.empty_title')}
              </h3>
              <p className="text-zinc-500 dark:text-zinc-500">
                {searchQuery ? t('notes.no_results_desc') : t('notes.empty_desc')}
              </p>
            </div>
          )}

          {pinnedNotes.length > 0 && (
            <section>
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider pl-1 mb-6">
                <Pin className="w-4 h-4" />
                {t('notes.pinned')}
              </div>
              <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                {pinnedNotes.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            </section>
          )}

          {otherNotes.length > 0 && (
            <section>
              {pinnedNotes.length > 0 && (
                <div className="flex items-center gap-2 text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider pl-1 mb-6 border-t border-zinc-200/50 dark:border-zinc-800/50 pt-8">
                  <FileText className="w-4 h-4" />
                  {t('notes.others')}
                </div>
              )}
              <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                {otherNotes.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
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
        {t('notes.new_note')}
      </button>
    </div>
  );
};
