import React, { useState } from 'react';
import { X, CheckSquare, Clock } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTask?: any;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, editingTask }) => {
  const { addTask, updateTask } = useTasks();
  const [taskData, setTaskData] = useState({
    title: editingTask?.title || '',
    description: editingTask?.description || '',
    dueDate: editingTask?.dueDate ? editingTask.dueDate.toISOString().split('T')[0] : ''
  });

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md overflow-hidden">
        {/* Compact Header - Görev için */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingTask ? 'Görevi Düzenle' : 'Hızlı Görev'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Basit ve etkili
              </p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Compact Body - Görev için daha sıkışık */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Görev Başlığı <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={taskData.title}
              onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500
                       placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Ne yapılacak?"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Kısa Açıklama
            </label>
            <textarea
              value={taskData.description}
              onChange={(e) => setTaskData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500
                       placeholder-gray-500 dark:placeholder-gray-400 resize-none"
              placeholder="Ek detaylar (opsiyonel)"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Bitiş Tarihi
            </label>
            <div className="relative">
              <input
                type="date"
                value={taskData.dueDate}
                onChange={(e) => setTaskData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-4 py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-green-500"
              />
              <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>
        </div>
        
        {/* Compact Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
          <button
            onClick={handleClose}
            className="px-5 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 
                     hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors font-medium"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={!taskData.title.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 
                     disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white 
                     rounded-lg transition-all font-medium shadow-md hover:shadow-lg
                     disabled:text-gray-500 dark:disabled:text-gray-400"
          >
            {editingTask ? 'Güncelle' : 'Oluştur'}
          </button>
        </div>
      </div>
    </div>
  );
};
