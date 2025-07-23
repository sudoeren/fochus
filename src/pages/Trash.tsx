import React, { useState, useEffect } from 'react';
import { Trash2, RotateCcw, X } from 'lucide-react';

interface DeletedItem {
  id: string;
  title: string;
  content?: string;
  description?: string;
  type: 'note' | 'task';
  deletedAt: Date;
}

export const Trash: React.FC = () => {
  const [deletedItems, setDeletedItems] = useState<DeletedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeletedItems();
  }, []);

  const loadDeletedItems = async () => {
    setLoading(true);
    try {
      // Load deleted notes
      const deletedNotes = await (window.electronAPI.database as any).getDeletedNotes();
      const formattedNotes: DeletedItem[] = deletedNotes.map((note: any) => ({
        id: note.id,
        title: note.title,
        content: note.content,
        type: 'note' as const,
        deletedAt: new Date(note.deletedAt)
      }));

      // Load deleted tasks
      const deletedTasks = await (window.electronAPI.database as any).getDeletedTasks();
      const formattedTasks: DeletedItem[] = deletedTasks.map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        type: 'task' as const,
        deletedAt: new Date(task.deletedAt)
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
        await (window.electronAPI.database as any).restoreNote(item.id);
      } else {
        await (window.electronAPI.database as any).restoreTask(item.id);
      }
      
      setDeletedItems(prev => prev.filter(i => i.id !== item.id));
    } catch (error) {
      console.error('Error restoring item:', error);
    }
  };

  const permanentlyDelete = async (item: DeletedItem) => {
    if (!confirm('Bu öğe kalıcı olarak silinecek. Bu işlem geri alınamaz. Emin misiniz?')) {
      return;
    }

    try {
      if (item.type === 'note') {
        await (window.electronAPI.database as any).permanentlyDeleteNote(item.id);
      } else {
        await (window.electronAPI.database as any).permanentlyDeleteTask(item.id);
      }
      
      setDeletedItems(prev => prev.filter(i => i.id !== item.id));
    } catch (error) {
      console.error('Error permanently deleting item:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <Trash2 className="w-8 h-8" />
          Çöp Kutusu
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Silinen notlar ve görevler burada görünür. Geri yükleyebilir veya kalıcı olarak silebilirsiniz.
        </p>
      </div>

      {/* Deleted Items */}
      <div className="space-y-4">
        {deletedItems.length > 0 ? (
          deletedItems.map((item) => (
            <div 
              key={`${item.type}-${item.id}`}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      item.type === 'note' 
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    }`}>
                      {item.type === 'note' ? 'Not' : 'Görev'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {item.deletedAt.toLocaleDateString('tr-TR')} {item.deletedAt.toLocaleTimeString('tr-TR')}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  
                  {item.content && (
                    <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
                      {item.content.substring(0, 200)}...
                    </p>
                  )}
                  
                  {item.description && (
                    <p className="text-gray-600 dark:text-gray-300">
                      {item.description}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => restoreItem(item)}
                    className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                    title="Geri yükle"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => permanentlyDelete(item)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Kalıcı olarak sil"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Trash2 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Çöp kutusu boş
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Silinen öğeler burada görünecek
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
