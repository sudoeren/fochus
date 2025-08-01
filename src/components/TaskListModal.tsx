import React, { useState, useEffect } from 'react';
import { X, Palette } from 'lucide-react';
import { useTaskLists } from '../hooks/useTaskLists';

interface TaskListModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingList?: any;
}

const colorOptions = [
  { name: 'Gri', value: '#6B7280' },
  { name: 'Mavi', value: '#64748B' },
  { name: 'Yeşil', value: '#059669' },
  { name: 'Mor', value: '#7C3AED' },
  { name: 'Kırmızı', value: '#DC2626' },
  { name: 'Sarı', value: '#D97706' },
  { name: 'Pembe', value: '#DB2777' },
  { name: 'Lacivert', value: '#1E40AF' }
];

export const TaskListModal: React.FC<TaskListModalProps> = ({ isOpen, onClose, editingList }) => {
  const { addTaskList, updateTaskList } = useTaskLists();
  const [listData, setListData] = useState({
    title: '',
    description: '',
    color: '#6B7280'
  });

  useEffect(() => {
    if (isOpen) {
      setListData({
        title: editingList?.title || '',
        description: editingList?.description || '',
        color: editingList?.color || '#6B7280'
      });
    }
  }, [isOpen, editingList]);

  const handleSave = async () => {
    if (!listData.title.trim()) return;

    try {
      if (editingList) {
        await updateTaskList(editingList.id, listData);
      } else {
        await addTaskList(listData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving task list:', error);
    }
  };

  const handleClose = () => {
    setListData({ title: '', description: '', color: '#3B82F6' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {editingList ? 'Liste Düzenle' : 'Yeni Liste Oluştur'}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Liste Adı
            </label>
            <input
              type="text"
              value={listData.title}
              onChange={(e) => setListData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Liste adını girin..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Açıklama (Opsiyonel)
            </label>
            <textarea
              value={listData.description}
              onChange={(e) => setListData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Liste açıklaması..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <Palette className="w-4 h-4 inline mr-2" />
              Renk Seçin
            </label>
            <div className="grid grid-cols-4 gap-3">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setListData(prev => ({ ...prev, color: color.value }))}
                  className={`relative w-12 h-12 rounded-lg border-2 transition-all hover:scale-105 ${
                    listData.color === color.value 
                      ? 'border-gray-900 dark:border-white shadow-lg' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {listData.color === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-gray-900"></div>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={!listData.title.trim()}
            className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {editingList ? 'Güncelle' : 'Oluştur'}
          </button>
        </div>
      </div>
    </div>
  );
};
