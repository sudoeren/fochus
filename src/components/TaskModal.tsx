import React, { useState } from 'react';
import { X, Zap, Target, Clock, Plus } from 'lucide-react';
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
      <div className="bg-gradient-to-br from-white via-green-50/20 to-emerald-50/10 dark:from-gray-900 dark:via-gray-800/80 dark:to-green-900/10 
                      rounded-2xl shadow-2xl border border-white/30 dark:border-gray-700/50 w-full max-w-md 
                      backdrop-blur-xl overflow-hidden relative">
        
        {/* Quick Action Header */}
        <div className="relative p-6 bg-gradient-to-r from-green-500/10 via-emerald-500/5 to-teal-500/10 border-b border-green-200/30 dark:border-green-700/30">
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 
                     hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-lg transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl">
              <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingTask ? 'Güncelle' : 'Hızlı Görev'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {editingTask ? 'Görevi düzenle' : 'Anında oluştur'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Compact Form */}
        <div className="p-6 space-y-5">
          {/* Quick Title Input */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
              <label className="text-sm font-semibold">Ne yapılacak?</label>
            </div>
            <input
              type="text"
              value={taskData.title}
              onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-3 text-base font-medium border-2 border-gray-200/60 dark:border-gray-700/60 rounded-xl
                       bg-white/70 dark:bg-gray-800/70 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-3 focus:ring-green-500/30 focus:border-green-400/50 
                       placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
              placeholder="Örn: Raporu tamamla, alışveriş yap..."
              autoFocus
            />
          </div>
          
          {/* Optional Description */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Detay (Opsiyonel)
            </label>
            <textarea
              value={taskData.description}
              onChange={(e) => setTaskData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="w-full px-4 py-2.5 text-sm border border-gray-200/60 dark:border-gray-700/60 rounded-lg
                       bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400/40 
                       placeholder-gray-400 dark:placeholder-gray-500 resize-none transition-all duration-200"
              placeholder="Kısa açıklama ekle..."
            />
          </div>
          
          {/* Date Picker */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
              <label className="text-sm font-semibold">Ne zaman?</label>
            </div>
            <input
              type="date"
              value={taskData.dueDate}
              onChange={(e) => setTaskData(prev => ({ ...prev, dueDate: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200/60 dark:border-gray-700/60 rounded-xl
                       bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-white
                       focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-400/40 
                       transition-all duration-200"
            />
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="px-6 py-4 bg-gray-50/30 dark:bg-gray-800/30 border-t border-gray-200/30 dark:border-gray-700/30">
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 
                       text-sm font-medium transition-all duration-200 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 rounded-lg"
            >
              İptal
            </button>
            <button
              onClick={handleSave}
              disabled={!taskData.title.trim()}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 
                       disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-600 dark:disabled:to-gray-700
                       disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-all duration-200
                       shadow-md hover:shadow-lg disabled:shadow-none flex items-center justify-center gap-2
                       disabled:text-gray-500 dark:disabled:text-gray-400"
            >
              <Plus className="w-4 h-4" />
              {editingTask ? 'Güncelle' : 'Oluştur'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
