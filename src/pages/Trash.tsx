import React, { useState, useEffect } from 'react';
import { Trash2, RotateCcw, X, AlertTriangle, FileText, CheckSquare, Search } from 'lucide-react';
import { notesAPI, tasksAPI } from '../services/api';
import { EmptyState } from '../components/EmptyState';
import { cn } from '../lib/utils';
import { deserializeApiDates } from '../utils/apiTransforms';
import { useTranslation } from 'react-i18next';

interface DeletedItem {
  id: string;
  title: string;
  content?: string;
  description?: string;
  type: 'note' | 'task';
  deletedAt: Date;
}

export const Trash: React.FC = () => {
  const { t } = useTranslation();
  const [deletedItems, setDeletedItems] = useState<DeletedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDeletedItems();
  }, []);

  const loadDeletedItems = async () => {
    setLoading(true);
    try {
      // Load deleted notes
      const deletedNotesRaw = await notesAPI.getDeleted();
      const deletedNotes = deserializeApiDates(deletedNotesRaw) as any[];
      const formattedNotes: DeletedItem[] = deletedNotes.map((note) => ({
        id: note.id,
        title: note.title,
        content: note.content,
        type: 'note' as const,
        deletedAt: new Date(note.deletedAt!)
      }));

      // Load deleted tasks
      const deletedTasksRaw = await tasksAPI.getDeleted();
      const deletedTasks = deserializeApiDates(deletedTasksRaw) as any[];
      const formattedTasks: DeletedItem[] = deletedTasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        type: 'task' as const,
        deletedAt: new Date(task.deletedAt!)
      }));

      // Combine and sort by deletion date
      const allItems = [...formattedNotes, ...formattedTasks].sort(
        (a, b) => b.deletedAt.getTime() - a.deletedAt.getTime()
      );

      setDeletedItems(allItems);
    } catch (error) {
      console.error('Error loading deleted items:', error);
    } finally {
      setLoading(false);
    }
  };

  const restoreItem = async (item: DeletedItem) => {
    try {
      if (item.type === 'note') {
        await notesAPI.restore(item.id);
      } else {
        await tasksAPI.restore(item.id);
      }

      setDeletedItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (error) {
      console.error('Error restoring item:', error);
    }
  };

  const permanentlyDelete = async (item: DeletedItem) => {
    if (!confirm(t('trash_page.confirm_item_delete'))) {
      return;
    }

    try {
      if (item.type === 'note') {
        await notesAPI.permanentDelete(item.id);
      } else {
        await tasksAPI.permanentDelete(item.id);
      }

      setDeletedItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (error) {
      console.error('Error permanently deleting item:', error);
    }
  };

  const clearAllTrash = async () => {
    if (!confirm(t('trash_page.confirm_clear_all'))) {
      return;
    }

    try {
      await Promise.all(
        deletedItems
          .filter((item) => item.type === 'note')
          .map((item) => notesAPI.permanentDelete(item.id))
      );

      await Promise.all(
        deletedItems
          .filter((item) => item.type === 'task')
          .map((item) => tasksAPI.permanentDelete(item.id))
      );

      setDeletedItems([]);
    } catch (error) {
      console.error('Error clearing trash:', error);
    }
  };

  const filteredItems = deletedItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* Header */}
      <div className="flex-none p-8 lg:p-10 pb-4">
        <div className="flex flex-col gap-6">
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">
                {t('trash_page.title')}
              </h1>
              <p className="text-zinc-500 dark:text-zinc-400 mt-1">{t('trash_page.subtitle')}</p>
            </div>

            {deletedItems.length > 0 && (
              <button
                onClick={clearAllTrash}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl font-medium transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t('trash_page.empty_trash')}</span>
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder={t('trash_page.search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-zinc-100 dark:bg-zinc-900/50 border-none rounded-2xl focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none transition-all font-medium"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 lg:px-10 pb-8 custom-scrollbar">
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="group relative flex flex-col bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 hover:shadow-xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={cn(
                      'p-2 rounded-xl',
                      item.type === 'note'
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                    )}
                  >
                    {item.type === 'note' ? (
                      <FileText className="w-4 h-4" />
                    ) : (
                      <CheckSquare className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-zinc-400">
                    {item.deletedAt.toLocaleDateString('tr-TR')}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 leading-tight">
                  {item.title}
                </h3>

                <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 mb-6 flex-1">
                  {item.type === 'note'
                    ? item.content
                    : item.description || t('trash_page.no_description')}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-zinc-100 dark:border-zinc-800 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  <button
                    onClick={() => restoreItem(item)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs font-bold transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {t('trash_page.restore')}
                  </button>
                  <button
                    onClick={() => permanentlyDelete(item)}
                    className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                    title={t('trash_page.permanent_delete')}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-zinc-400">
            <div className="w-20 h-20 rounded-[2rem] bg-zinc-100 dark:bg-zinc-900/50 flex items-center justify-center mb-6">
              <Trash2 className="w-10 h-10 opacity-30" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
              {searchTerm ? t('trash_page.no_results') : t('trash_page.empty_title')}
            </h3>
            <p className="text-zinc-500 dark:text-zinc-500">
              {searchTerm ? t('trash_page.no_results_desc') : t('trash_page.empty_desc')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
