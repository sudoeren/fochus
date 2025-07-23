import React, { useState, useEffect } from 'react';
import { X, CheckSquare } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTask?: any;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, editingTask }) => {
  const { addTask, updateTask } = useTasks();
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    dueDate: ''
  });

  useEffect(() => {
    if (isOpen) {
      setTaskData({
        title: editingTask?.title || '',
        description: editingTask?.description || '',
        dueDate: editingTask?.dueDate ? editingTask.dueDate.toISOString().split('T')[0] : ''
      });
    }
  }, [isOpen, editingTask]);

  const handleSave = async () => {
    if (!taskData.title.trim()) return;

    try {
      const dataToSend = {
        title: taskData.title,
        description: taskData.description,
        ...(taskData.dueDate && { dueDate: new Date(taskData.dueDate) })
      };

      if (editingTask) {
        await updateTask(editingTask.id, dataToSend);
      } else {
        await addTask(dataToSend);
      }
      onClose();
      setTaskData({ title: '', description: '', dueDate: '' });
    } catch (error) {
      console.error('Görev kaydedilirken hata:', error);
    }
  };

  const handleClose = () => {
    onClose();
    setTaskData({ title: '', description: '', dueDate: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingTask ? 'Görevi Düzenle' : 'Yeni Görev'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Görevlerinizi organize edin
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Görev Başlığı
            </label>
            <input
              type="text"
              value={taskData.title}
              onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Görev başlığı..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Açıklama (Opsiyonel)
            </label>
            <textarea
              value={taskData.description}
              onChange={(e) => setTaskData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Görev açıklaması..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 resize-none"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bitiş Tarihi (Opsiyonel)
            </label>
            <input
              type="date"
              value={taskData.dueDate}
              onChange={(e) => setTaskData(prev => ({ ...prev, dueDate: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={!taskData.title.trim()}
            className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg disabled:cursor-not-allowed transition-colors"
          >
            {editingTask ? 'Güncelle' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
};
