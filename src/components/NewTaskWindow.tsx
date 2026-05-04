import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Calendar, Flag, CheckCircle2, ListTodo, Clock } from 'lucide-react';
import { Task } from '../types/index';
import { useTasks } from '../hooks/useTasks';
import { useTaskLists } from '../hooks/useTaskLists';
import { triggerInstantRefresh } from '../utils/refreshUtils';
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

  // Focus title on open
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
      triggerInstantRefresh();
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  }, [title, description, dueDate, isPinned, listId, initialData, updateTask, addTask, onClose]);

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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-lg transform rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl transition-all flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <h2
            id="task-modal-title"
            className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-blue-500" aria-hidden="true" />
            {initialData?.id ? t('tasks.edit_task') : t('tasks.new_task')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={t('common.close')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Title Input */}
          <div className="space-y-2">
            <label htmlFor="task-title" className="sr-only">
              {t('tasks.title_placeholder')}
            </label>
            <input
              ref={titleInputRef}
              id="task-title"
              type="text"
              placeholder={t('tasks.title_placeholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-2xl font-semibold bg-transparent border-none placeholder-zinc-400 dark:placeholder-zinc-600 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-0 px-0 py-1"
            />
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <label htmlFor="task-desc" className="sr-only">
              {t('tasks.desc_placeholder')}
            </label>
            <textarea
              id="task-desc"
              placeholder={t('tasks.desc_placeholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[100px] text-base resize-none bg-transparent border-none placeholder-zinc-400 dark:placeholder-zinc-600 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-0 px-0 py-1"
            />
          </div>

          {/* Metadata Toolbar */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            {/* Date Picker */}
            <div className="relative">
              <button
                onClick={() => dateInputRef.current?.showPicker()}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500',
                  dueDate
                    ? 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
                    : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                )}
                aria-label={t('tasks.date')}
              >
                <Calendar size={16} aria-hidden="true" />
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
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500',
                isPinned
                  ? 'bg-yellow-50 text-yellow-600 border border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800'
                  : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
              )}
              aria-pressed={isPinned}
              aria-label={t('tasks.priority')}
            >
              <Flag size={16} className={isPinned ? 'fill-current' : ''} aria-hidden="true" />
              {isPinned ? t('tasks.prioritized') : t('tasks.priority')}
            </button>

            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700 mx-1" aria-hidden="true" />

            {/* List Selector */}
            <div className="relative flex-1 sm:flex-none">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ListTodo size={16} className="text-zinc-400" />
              </div>
              <select
                value={listId || ''}
                onChange={(e) => setListId(e.target.value || null)}
                className="w-full pl-9 pr-8 py-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
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
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800">
          <div className="text-xs text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
            <Clock size={12} />
            <span>Ctrl + Enter to save</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500 rounded-lg"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim()}
              className="flex items-center gap-2 px-5 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-900 shadow-lg shadow-zinc-500/20 dark:shadow-none"
            >
              <CheckCircle2 size={16} aria-hidden="true" />
              {initialData?.id ? t('common.save_changes') : t('common.save_task')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
