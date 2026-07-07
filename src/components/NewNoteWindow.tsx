import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Pin, Save, Maximize2 } from 'lucide-react';
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

  const handleSave = useCallback(async () => {
    if (!title.trim() && !content.trim()) return;

    try {
      if (initialData && initialData.id) {
        await updateNote(initialData.id, {
          title,
          content,
          isPinned,
          plainContent: content
        });
      } else {
        await addNote({
          title,
          content,
          isPinned,
          plainContent: content
        });
      }
      onClose();
    } catch (error) {
      console.error('Error saving note:', error);
    }
  }, [title, content, isPinned, initialData, updateNote, addNote, onClose]);

  const handleExpand = async () => {
    try {
      let noteId = initialData?.id;

      if (noteId) {
        await updateNote(noteId, {
          title,
          content,
          isPinned
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

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

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
  }, [isOpen, onClose, handleSave]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="note-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden rounded-2xl bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl shadow-xl shadow-black/5 dark:shadow-black/20 transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-6 pb-1">
          <h2
            id="note-modal-title"
            className="text-base font-semibold text-zinc-900 dark:text-zinc-100"
          >
            {initialData?.id ? t('notes.edit_note') : t('notes.new_note')}
          </h2>
          <div className="flex items-center gap-0.5">
            {onExpand && (
              <button
                onClick={handleExpand}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title={t('notes.fullscreen')}
                aria-label={t('notes.fullscreen')}
              >
                <Maximize2 size={16} />
              </button>
            )}
            <button
              onClick={() => setIsPinned(!isPinned)}
              className={clsx(
                'p-1.5 rounded-lg transition-colors',
                isPinned
                  ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/40'
                  : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              )}
              title={t('notes.pin')}
              aria-label={t('notes.pin')}
              aria-pressed={isPinned}
            >
              <Pin size={16} className={isPinned ? 'fill-current' : ''} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label={t('common.close')}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 pt-5 pb-2 flex flex-col gap-5 flex-1 overflow-y-auto">
          <div>
            <input
              ref={titleInputRef}
              id="note-title"
              type="text"
              placeholder={t('notes.title_placeholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-[28px] font-semibold bg-transparent border-none placeholder-zinc-300 dark:placeholder-zinc-600 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-0 px-0 py-1 tracking-tight"
            />
          </div>

          <div className="flex-1">
            <textarea
              id="note-content"
              placeholder={t('notes.content_placeholder')}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full min-h-[250px] text-base leading-relaxed resize-none bg-transparent border-none placeholder-zinc-300 dark:placeholder-zinc-600 text-zinc-600 dark:text-zinc-400 focus:outline-none focus:ring-0 p-0"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 py-4">
          <span className="text-[11px] text-zinc-300 dark:text-zinc-600">{content.length}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim() && !content.trim()}
              className="flex items-center gap-2 px-4 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full text-xs font-semibold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-zinc-900/10 dark:shadow-none"
            >
              <Save size={14} />
              {t('common.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
