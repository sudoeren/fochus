import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Calendar, Flag, ListTodo } from 'lucide-react';
import { Task } from '../types/index';
import { useTasks } from '../hooks/useTasks';
import { useTaskLists } from '../hooks/useTaskLists';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

interface NewTaskWindowProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<Task>;
}

export const NewTaskWindow: React.FC<NewTaskWindowProps> = ({ isOpen, onClose, initialData }) => {
  const { t, i18n } = useTranslation();
  const { addTask, updateTask } = useTasks();
  const { taskLists } = useTaskLists();
  const titleInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [dueDate, setDueDate] = useState<string>(
    initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : ''
  );
  const [isPinned, setIsPinned] = useState(initialData?.isPinned || false);
  const [listId, setListId] = useState<string | null>(initialData?.listId || null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const handleSave = useCallback(async () => {
    if (!title.trim()) return;

    try {
      if (initialData && initialData.id) {
        await updateTask(initialData.id, {
          title,
          description,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          isPinned,
          listId: listId || undefined
        });
      } else {
        await addTask({
          title,
          description,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          listId: listId || undefined
        });
      }
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  }, [title, description, dueDate, isPinned, listId, initialData, updateTask, addTask, onClose]);

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
      aria-labelledby="task-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg transform rounded-2xl bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl shadow-xl shadow-black/5 dark:shadow-black/20 transition-all flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <h2
            id="task-modal-title"
            className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" aria-hidden="true" />
            {initialData?.id ? t('tasks.edit_task') : t('tasks.new_task')}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label={t('common.close')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pt-4 pb-2 space-y-5">
          {/* Title Input */}
          <div>
            <input
              ref={titleInputRef}
              id="task-title"
              type="text"
              placeholder={t('tasks.title_placeholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-[28px] font-semibold bg-transparent border-none placeholder-zinc-300 dark:placeholder-zinc-600 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-0 px-0 py-1 tracking-tight"
            />
          </div>

          {/* Description Input */}
          <div>
            <textarea
              id="task-desc"
              placeholder={t('tasks.desc_placeholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[80px] text-sm resize-none bg-transparent border-none placeholder-zinc-300 dark:placeholder-zinc-600 text-zinc-500 dark:text-zinc-400 focus:outline-none focus:ring-0 px-0 py-1 leading-relaxed"
            />
          </div>

          {/* Metadata Toolbar */}
          <div className="flex flex-wrap items-center gap-2 pt-3">
            {/* Date Picker */}
            <div className="relative">
              <button
                onClick={() => dateInputRef.current?.showPicker()}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                  dueDate
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 ring-1 ring-blue-200 dark:ring-blue-800/50'
                    : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                )}
                aria-label={t('tasks.date')}
              >
                <Calendar size={14} />
                {dueDate
                  ? new Date(dueDate).toLocaleDateString(
                      i18n.language === 'tr' ? 'tr-TR' : 'en-US',
                      {
                        day: 'numeric',
                        month: 'short'
                      }
                    )
                  : t('tasks.date')}
              </button>
              <input
                ref={dateInputRef}
                type="date"
                className="sr-only"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                tabIndex={-1}
              />
            </div>

            {/* Priority Toggle */}
            <button
              onClick={() => setIsPinned(!isPinned)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                isPinned
                  ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/40 ring-1 ring-yellow-200 dark:ring-yellow-800/50'
                  : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              )}
              aria-pressed={isPinned}
              aria-label={t('tasks.priority')}
            >
              <Flag size={14} className={isPinned ? 'fill-current' : ''} />
              {isPinned ? t('tasks.prioritized') : t('tasks.priority')}
            </button>

            {/* List Selector */}
            <div className="relative ml-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ListTodo size={14} className="text-zinc-400" />
              </div>
              <select
                value={listId || ''}
                onChange={(e) => setListId(e.target.value || null)}
                className="pl-8 pr-7 py-1.5 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 rounded-full text-xs font-medium ring-1 ring-transparent hover:ring-zinc-200 dark:hover:ring-zinc-700 focus:ring-1 focus:ring-zinc-300 dark:focus:ring-zinc-600 outline-none appearance-none cursor-pointer transition-all"
                aria-label={t('tasks.select_list')}
              >
                <option value="">{t('tasks.select_list')}</option>
                {taskLists.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="flex items-center gap-2 px-4 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full text-xs font-semibold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-zinc-900/10 dark:shadow-none"
          >
            {initialData?.id ? t('common.save_changes') : t('common.save_task')}
          </button>
        </div>
      </div>
    </div>
  );
};
