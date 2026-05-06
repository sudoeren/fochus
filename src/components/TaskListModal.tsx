import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTaskLists } from '../hooks/useTaskLists';
import { useTranslation } from 'react-i18next';
import type { TaskList } from '../types/index';

interface TaskListModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingList?: Partial<TaskList>;
}

export const TaskListModal: React.FC<TaskListModalProps> = ({ isOpen, onClose, editingList }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState(editingList?.title || '');
  const colorIdToHex = (id: string) => colorPalette.find((c) => c.id === id)?.hex ?? '#3B82F6';
  const hexToColorId = (hex: string) =>
    colorPalette.find((c) => c.hex === hex || c.id === hex)?.id ?? 'blue';
  const [colorId, setColorId] = useState(hexToColorId(editingList?.color ?? '#3B82F6'));
  const { addTaskList, updateTaskList } = useTaskLists();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const colorHex = colorIdToHex(colorId);
    try {
      if (editingList) {
        if (editingList.id) await updateTaskList(editingList.id, { title, color: colorHex });
      } else {
        await addTaskList({
          title,
          color: colorHex
        });
      }
      onClose();
      setTitle('');
    } catch (error) {
      console.error('Failed to save list:', error);
    }
  };

  const colorPalette = [
    { id: 'blue', hex: '#3B82F6', class: 'bg-blue-500' },
    { id: 'red', hex: '#EF4444', class: 'bg-red-500' },
    { id: 'green', hex: '#22C55E', class: 'bg-green-500' },
    { id: 'yellow', hex: '#EAB308', class: 'bg-yellow-500' },
    { id: 'purple', hex: '#A855F7', class: 'bg-purple-500' },
    { id: 'pink', hex: '#EC4899', class: 'bg-pink-500' },
    { id: 'indigo', hex: '#6366F1', class: 'bg-indigo-500' },
    { id: 'orange', hex: '#F97316', class: 'bg-orange-500' }
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl transform transition-all overflow-hidden border border-zinc-200 dark:border-zinc-800">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/50">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            {editingList ? t('lists.edit_list') : t('lists.new_list')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Title Input */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t('lists.list_name')}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('lists.name_placeholder')}
              className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              autoFocus
              required
            />
          </div>

          {/* Color Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t('lists.color_theme')}
            </label>
            <div className="flex flex-wrap gap-3">
              {colorPalette.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColorId(c.id)}
                  className={cn(
                    'w-10 h-10 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-zinc-900',
                    c.class,
                    colorId === c.id
                      ? 'ring-2 ring-offset-2 ring-zinc-400 dark:ring-offset-zinc-900 scale-110'
                      : ''
                  )}
                />
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-zinc-900/10"
            >
              <Plus size={20} />
              {editingList ? t('common.save_changes') : t('lists.create_list')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
