import React, { useState, useEffect } from 'react';
import { X, Pin, Palette, Save, Maximize2 } from 'lucide-react';
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
    bg: 'bg-white dark:bg-zinc-900',
    border: 'border-zinc-200 dark:border-zinc-800'
  },
  {
    id: 'yellow',
    bg: 'bg-yellow-50 dark:bg-yellow-900/10',
    border: 'border-yellow-200 dark:border-yellow-800/30'
  },
  {
    id: 'green',
    bg: 'bg-green-50 dark:bg-green-900/10',
    border: 'border-green-200 dark:border-green-800/30'
  },
  {
    id: 'blue',
    bg: 'bg-blue-50 dark:bg-blue-900/10',
    border: 'border-blue-200 dark:border-blue-800/30'
  },
  {
    id: 'purple',
    bg: 'bg-purple-50 dark:bg-purple-900/10',
    border: 'border-purple-200 dark:border-purple-800/30'
  },
  { id: 'red', bg: 'bg-red-50 dark:bg-red-900/10', border: 'border-red-200 dark:border-red-800/30' }
];

export const NewNoteWindow: React.FC<NewNoteWindowProps> = ({
  isOpen,
  onClose,
  initialData,
  onExpand
}) => {
  const { t } = useTranslation();
  const { addNote, updateNote } = useNotes();

  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [isPinned, setIsPinned] = useState(initialData?.isPinned || false);
  const [selectedColor, setSelectedColor] = useState(
    NOTE_COLORS.find((c) => c.id === initialData?.color) || NOTE_COLORS[0]
  );
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Removed useEffect syncing state from isOpen/initialData

  const handleExpand = async () => {
    try {
      let noteId = initialData?.id; // Use let since we might assign it from newNote

      if (noteId) {
        // Always update existing note before expanding to ensure consistency
        await updateNote(noteId, {
          title,
          content,
          isPinned,
          color: selectedColor.id
        });
      } else {
        // Create new note (even if empty, as user wants to enter editor)
        const newNote = await addNote({
          title,
          content,
          isPinned,
          tags: [], // Default tags
          plainContent: content, // Approximation for now
          color: selectedColor.id
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
          color: selectedColor.id
        });
      } else {
        await addNote({
          title,
          content,
          isPinned,
          tags: [],
          plainContent: content,
          color: selectedColor.id
        });
      }
      onClose();
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 text-zinc-900 dark:text-zinc-100">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div
        className={clsx(
          'relative w-full max-w-2xl transform rounded-2xl shadow-2xl transition-all flex flex-col overflow-hidden',
          selectedColor.bg,
          'border',
          selectedColor.border
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">
              {initialData?.id ? t('notes.edit_note') : t('notes.new_note')}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            {onExpand && (
              <button
                onClick={handleExpand}
                className="p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                title={t('notes.fullscreen')}
              >
                <Maximize2 size={20} />
              </button>
            )}
            <button
              onClick={() => setIsPinned(!isPinned)}
              className={clsx(
                'p-2 rounded-full transition-colors',
                isPinned
                  ? 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400'
                  : 'text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-zinc-600 dark:hover:text-zinc-300'
              )}
              title={t('notes.pin')}
            >
              <Pin size={20} className={isPinned ? 'fill-current' : ''} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-4 flex-1">
          <input
            type="text"
            placeholder={t('notes.title_placeholder')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-2xl font-bold bg-transparent border-b border-transparent focus:border-black/10 dark:focus:border-white/10 placeholder-zinc-400/70 dark:placeholder-zinc-600 focus:outline-none focus:ring-0 px-0 py-2 transition-colors"
            autoFocus
          />

          <textarea
            placeholder={t('notes.content_placeholder')}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[300px] flex-1 text-lg leading-relaxed resize-none bg-transparent border-none placeholder-zinc-400/50 dark:placeholder-zinc-600 focus:outline-none focus:ring-0 p-0"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
          <div className="flex items-center gap-2 relative">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-2 rounded-full text-zinc-500 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title={t('notes.change_color')}
            >
              <Palette size={20} />
            </button>

            {showColorPicker && (
              <div className="absolute bottom-full left-0 mb-2 p-2 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 flex gap-2 animate-in fade-in slide-in-from-bottom-2">
                {NOTE_COLORS.map((color) => (
                  <button
                    key={color.id}
                    className={clsx(
                      'w-6 h-6 rounded-full border border-black/10 dark:border-white/10 ring-offset-2 ring-offset-white dark:ring-offset-zinc-800 transition-all',
                      color.bg.replace('/10', ''), // Use solid color for picker
                      selectedColor.id === color.id && 'ring-2 ring-zinc-400'
                    )}
                    onClick={() => {
                      setSelectedColor(color);
                      setShowColorPicker(false);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              {content.length} {t('notes.chars')}
            </span>
            <button
              onClick={handleSave}
              disabled={!title.trim() && !content.trim()}
              className="flex items-center gap-2 px-6 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full text-sm font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
            >
              <Save size={18} />
              {t('common.save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
