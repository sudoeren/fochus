import React, { useState, useEffect, useRef } from 'react';
import { X, Pin, Save, Maximize2, Clock } from 'lucide-react';
import { Note } from '../types/index';
import { useNotes } from '../hooks/useNotes';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

interface NewNoteWindowProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<Note>;
  onExpand?: (id: string) => void;
}

const NOTE_COLORS = [
  {
    id: 'default',
    bg: 'bg-white dark:bg-zinc-950',
    border: 'border-zinc-200 dark:border-zinc-800',
    ring: 'ring-zinc-200 dark:ring-zinc-700',
    dot: 'bg-zinc-900 dark:bg-zinc-100'
  },
  {
    id: 'yellow',
    bg: 'bg-yellow-50 dark:bg-yellow-950/30',
    border: 'border-yellow-200 dark:border-yellow-800/30',
    ring: 'ring-yellow-200 dark:ring-yellow-800',
    dot: 'bg-yellow-500'
  },
  {
    id: 'green',
    bg: 'bg-green-50 dark:bg-green-950/30',
    border: 'border-green-200 dark:border-green-800/30',
    ring: 'ring-green-200 dark:ring-green-800',
    dot: 'bg-green-500'
  },
  {
    id: 'blue',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800/30',
    ring: 'ring-blue-200 dark:ring-blue-800',
    dot: 'bg-blue-500'
  },
  {
    id: 'purple',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    border: 'border-purple-200 dark:border-purple-800/30',
    ring: 'ring-purple-200 dark:ring-purple-800',
    dot: 'bg-purple-500'
  },
  { 
    id: 'red', 
    bg: 'bg-red-50 dark:bg-red-950/30', 
    border: 'border-red-200 dark:border-red-800/30',
    ring: 'ring-red-200 dark:ring-red-800',
    dot: 'bg-red-500'
  }
];

export const NewNoteWindow: React.FC<NewNoteWindowProps> = ({
  isOpen,
  onClose,
  initialData,
  onExpand
}) => {
  const { t } = useTranslation();
  const { addNote, updateNote } = useNotes();
  const titleInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [isPinned, setIsPinned] = useState(initialData?.isPinned || false);
  const [selectedColor, setSelectedColor] = useState(
    NOTE_COLORS.find((c) => c.id === initialData?.color) || NOTE_COLORS[0]
  );

  // Focus title on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, title, content, isPinned, selectedColor]);

  const handleExpand = async () => {
    try {
      let noteId = initialData?.id;

      if (noteId) {
        await updateNote(noteId, {
          title,
          content,
          isPinned,
          color: selectedColor.id
        });
      } else {
        const newNote = await addNote({
          title,
          content,
          isPinned,
          plainContent: content
        });
        noteId = newNote.id;
      }

      if (onExpand && noteId) {
        onExpand(noteId);
      }
    } catch (error) {
      console.error('Error expanding note:', error);
    }
  };

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) return;

    try {
      if (initialData && initialData.id) {
        await updateNote(initialData.id, {
          title,
          content,
          isPinned,
          color: selectedColor.id,
          plainContent: content
        });
      } else {
        await addNote({
          title,
          content,
          isPinned,
          color: selectedColor.id,
          plainContent: content
        });
      }
      onClose();
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="note-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={clsx(
          'relative z-10 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden rounded-2xl shadow-2xl border transition-all duration-300',
          selectedColor.bg,
          selectedColor.border
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <h2 id="note-modal-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {initialData?.id ? t('notes.edit_note') : t('notes.new_note')}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            {onExpand && (
              <button
                onClick={handleExpand}
                className="p-2 rounded-full text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                title={t('notes.fullscreen')}
                aria-label={t('notes.fullscreen')}
              >
                <Maximize2 size={20} aria-hidden="true" />
              </button>
            )}
            <button
              onClick={() => setIsPinned(!isPinned)}
              className={clsx(
                'p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500',
                isPinned
                  ? 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400'
                  : 'text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
              )}
              title={t('notes.pin')}
              aria-label={t('notes.pin')}
              aria-pressed={isPinned}
            >
              <Pin size={20} className={isPinned ? 'fill-current' : ''} aria-hidden="true" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={t('common.close')}
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 flex flex-col gap-6 flex-1 overflow-y-auto">
          <div className="space-y-2">
            <label htmlFor="note-title" className="sr-only">{t('notes.title_placeholder')}</label>
            <input
              ref={titleInputRef}
              id="note-title"
              type="text"
              placeholder={t('notes.title_placeholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-3xl font-bold bg-transparent border-none placeholder-zinc-400/60 dark:placeholder-zinc-500/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-0 px-0 py-2"
            />
          </div>

          <div className="flex-1">
            <label htmlFor="note-content" className="sr-only">{t('notes.content_placeholder')}</label>
            <textarea
              id="note-content"
              placeholder={t('notes.content_placeholder')}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full min-h-[300px] text-lg leading-relaxed resize-none bg-transparent border-none placeholder-zinc-400/50 dark:placeholder-zinc-500/50 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-0 p-0"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
          <div className="flex items-center gap-6">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:inline">
              {content.length} {t('notes.chars')}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-xs text-zinc-400 dark:text-zinc-500 flex items-center gap-1 hidden sm:flex">
              <Clock size={12} />
              <span>Ctrl + Enter to save</span>
            </div>
            <button
              onClick={handleSave}
              disabled={!title.trim() && !content.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-zinc-200 dark:bg-zinc-100 text-zinc-900 rounded-full text-sm font-semibold hover:bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900"
            >
              <Save size={18} aria-hidden="true" />
              {t('common.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
