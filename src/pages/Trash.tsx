import React, { useState, useEffect } from 'react';
import { Trash2, RotateCcw, X } from 'lucide-react';
import { storageService } from '../services/storage';
import { EmptyState } from '../components/EmptyState';

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
      const deletedNotes = await storageService.notes.getDeleted();
      const formattedNotes: DeletedItem[] = deletedNotes.map((note) => ({
        id: note.id,
        title: note.title,
        content: note.content,
        type: 'note' as const,
        deletedAt: new Date(note.deletedAt!)
      }));

      // Load deleted tasks
      const deletedTasks = await storageService.tasks.getDeleted();
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
        await storageService.notes.restore(item.id);
      } else {
        await storageService.tasks.restore(item.id);
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
        await storageService.notes.permanentlyDelete(item.id);
      } else {
        await storageService.tasks.permanentlyDelete(item.id);
      }
      
      setDeletedItems(prev => prev.filter(i => i.id !== item.id));
    } catch (error) {
      console.error('Error permanently deleting item:', error);
    }
  };

  const clearAllTrash = async () => {
    if (!confirm('Çöp kutusu tamamen temizlenecek. Tüm öğeler kalıcı olarak silinecek. Bu işlem geri alınamaz. Emin misiniz?')) {
      return;
    }

    try {
      // Delete all notes
      await Promise.all(deletedItems.filter(item => item.type === 'note').map(item => 
        storageService.notes.permanentlyDelete(item.id)
      ));

      // Delete all tasks
      await Promise.all(deletedItems.filter(item => item.type === 'task').map(item => 
        storageService.tasks.permanentlyDelete(item.id)
      ));
      
      setDeletedItems([]);
    } catch (error) {
      console.error('Error clearing trash:', error);
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
    <div className="p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            <Trash2 className="w-8 h-8" />
            Çöp Kutusu
          </h1>
          <p className="text-gray-600 dark:text-zinc-400">
            Silinen notlar ve görevler burada görünür. {deletedItems.length} öğe bulundu.
          </p>
        </div>
        {deletedItems.length > 0 && (
          <button
            onClick={clearAllTrash}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Çöp Kutusunu Temizle
          </button>
        )}
      </div>

      {/* Deleted Items */}
      <div className="space-y-4">
        {deletedItems.length > 0 ? (
          deletedItems.map((item) => (
            <div 
              key={`${item.type}-${item.id}`}
              className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-800 p-6"
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
                    <span className="text-xs text-gray-500 dark:text-zinc-500">
                      {item.deletedAt.toLocaleDateString('tr-TR')} {item.deletedAt.toLocaleTimeString('tr-TR')}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  
                  {item.content && (
                    <p className="text-gray-600 dark:text-zinc-400 line-clamp-3">
                      {item.content.substring(0, 200)}...
                    </p>
                  )}
                  
                  {item.description && (
                    <p className="text-gray-600 dark:text-zinc-400">
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
          <EmptyState
            type="trash"
            title="Çöp kutusu boş"
            description="Silinen notlar ve görevler burada görünür. Şu an için her şey temiz!"
          />
        )}
      </div>
    </div>
  );
};
