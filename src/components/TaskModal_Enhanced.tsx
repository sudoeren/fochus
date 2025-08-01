import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Clock, Repeat, Plus, ChevronDown } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { notificationService } from '../services/NotificationService';

type RecurringType = 'DAILY' | 'WEEKLY' | 'MONTHLY';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTask?: any;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, editingTask }) => {
  const { addTask, updateTask } = useTasks();
  const [activeTab, setActiveTab] = useState('basic');
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
    hasReminder: false,
    reminderAt: undefined as Date | undefined,
    isRecurring: false,
    recurringType: 'DAILY' as RecurringType,
    recurringInterval: 1,
    recurringDays: [] as number[],
    recurringEndDate: undefined as Date | undefined,
    subtasks: [] as Array<{ id: string; title: string; isCompleted: boolean }>
  });

  useEffect(() => {
    if (isOpen) {
      setTaskData({
        title: editingTask?.title || '',
        description: editingTask?.description || '',
        dueDate: editingTask?.dueDate ? editingTask.dueDate.toISOString().split('T')[0] : '',
        priority: editingTask?.priority || 'MEDIUM',
        hasReminder: editingTask?.hasReminder || false,
        reminderAt: editingTask?.reminderAt ? new Date(editingTask.reminderAt) : undefined,
        isRecurring: editingTask?.isRecurring || false,
        recurringType: editingTask?.recurringType || 'DAILY',
        recurringInterval: editingTask?.recurringInterval || 1,
        recurringDays: editingTask?.recurringDays || [],
        recurringEndDate: editingTask?.recurringEndDate ? new Date(editingTask.recurringEndDate) : undefined,
        subtasks: editingTask?.subtasks || []
      });
      setActiveTab('basic');
    }
  }, [isOpen, editingTask]);

  const handleSave = async () => {
    if (!taskData.title.trim()) return;

    try {
      const dataToSend = {
        title: taskData.title,
        description: taskData.description,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
        priority: taskData.priority,
        hasReminder: taskData.hasReminder,
        reminderAt: taskData.reminderAt,
        isRecurring: taskData.isRecurring,
        recurringType: taskData.isRecurring ? taskData.recurringType : undefined,
        recurringInterval: taskData.isRecurring ? taskData.recurringInterval : undefined,
        recurringDays: taskData.isRecurring && taskData.recurringType === 'WEEKLY' ? taskData.recurringDays : undefined,
        recurringEndDate: taskData.isRecurring ? taskData.recurringEndDate : undefined,
        subtasks: taskData.subtasks
      };

      if (editingTask) {
        await updateTask(editingTask.id, dataToSend);
      } else {
        await addTask(dataToSend);
      }

      // Reminder ayarla
      if (taskData.hasReminder && taskData.reminderAt) {
        notificationService.scheduleReminder(taskData.reminderAt, () => {
          notificationService.show({
            title: taskData.title,
            body: taskData.description || 'Görev hatırlatıcısı',
            icon: '/icon.png'
          });
        });
      }

      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const addSubtask = () => {
    const newSubtask = {
      id: Date.now().toString(),
      title: '',
      isCompleted: false
    };
    setTaskData(prev => ({
      ...prev,
      subtasks: [...prev.subtasks, newSubtask]
    }));
  };

  const updateSubtask = (id: string, updates: Partial<{ title: string; isCompleted: boolean }>) => {
    setTaskData(prev => ({
      ...prev,
      subtasks: prev.subtasks.map(subtask =>
        subtask.id === id ? { ...subtask, ...updates } : subtask
      )
    }));
  };

  const removeSubtask = (id: string) => {
    setTaskData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter(subtask => subtask.id !== id)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <CheckSquare className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {editingTask ? 'Görevi Düzenle' : 'Yeni Görev'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'basic', label: 'Temel Bilgiler', icon: CheckSquare },
            { id: 'subtasks', label: 'Alt Görevler', icon: Plus },
            { id: 'recurring', label: 'Tekrarlama', icon: Repeat },
            { id: 'reminder', label: 'Hatırlatıcı', icon: Clock }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          
          {/* Basic Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Görev Başlığı
                </label>
                <input
                  type="text"
                  value={taskData.title}
                  onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Görev başlığını girin..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={taskData.description}
                  onChange={(e) => setTaskData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Görev detaylarını yazın..."
                  rows={3}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Due Date & Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bitiş Tarihi
                  </label>
                  <input
                    type="date"
                    value={taskData.dueDate}
                    onChange={(e) => setTaskData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Öncelik
                  </label>
                  <div className="relative">
                    <select
                      value={taskData.priority}
                      onChange={(e) => setTaskData(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    >
                      <option value="LOW">Düşük</option>
                      <option value="MEDIUM">Orta</option>
                      <option value="HIGH">Yüksek</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subtasks Tab */}
          {activeTab === 'subtasks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Alt Görevler</h3>
                <button
                  onClick={addSubtask}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Alt Görev Ekle
                </button>
              </div>

              <div className="space-y-2">
                {taskData.subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <input
                      type="checkbox"
                      checked={subtask.isCompleted}
                      onChange={(e) => updateSubtask(subtask.id, { isCompleted: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={subtask.title}
                      onChange={(e) => updateSubtask(subtask.id, { title: e.target.value })}
                      placeholder="Alt görev başlığı..."
                      className="flex-1 p-2 border-none bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
                    />
                    <button
                      onClick={() => removeSubtask(subtask.id)}
                      className="p-1 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {taskData.subtasks.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Henüz alt görev eklenmemiş. Yukarıdaki butona tıklayarak ekleyebilirsiniz.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recurring Tab */}
          {activeTab === 'recurring' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={taskData.isRecurring}
                  onChange={(e) => setTaskData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Bu görev tekrarlanacak
                </label>
              </div>

              {taskData.isRecurring && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tekrarlama Türü
                    </label>
                    <select
                      value={taskData.recurringType}
                      onChange={(e) => setTaskData(prev => ({ ...prev, recurringType: e.target.value as RecurringType }))}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="DAILY">Günlük</option>
                      <option value="WEEKLY">Haftalık</option>
                      <option value="MONTHLY">Aylık</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tekrarlama Sıklığı
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="1"
                        value={taskData.recurringInterval}
                        onChange={(e) => setTaskData(prev => ({ ...prev, recurringInterval: parseInt(e.target.value) || 1 }))}
                        className="w-20 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <span className="text-gray-600 dark:text-gray-400">
                        {taskData.recurringType === 'DAILY' ? 'gün' : 
                         taskData.recurringType === 'WEEKLY' ? 'hafta' : 'ay'} arayla
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bitiş Tarihi (Opsiyonel)
                    </label>
                    <input
                      type="date"
                      value={taskData.recurringEndDate ? taskData.recurringEndDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => setTaskData(prev => ({
                        ...prev,
                        recurringEndDate: e.target.value ? new Date(e.target.value) : undefined
                      }))}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reminder Tab */}
          {activeTab === 'reminder' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="hasReminder"
                  checked={taskData.hasReminder}
                  onChange={(e) => setTaskData(prev => ({ ...prev, hasReminder: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="hasReminder" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Hatırlatıcı ayarla
                </label>
              </div>

              {taskData.hasReminder && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hatırlatma Zamanı
                  </label>
                  <input
                    type="datetime-local"
                    value={taskData.reminderAt ? taskData.reminderAt.toISOString().slice(0, 16) : ''}
                    onChange={(e) => setTaskData(prev => ({
                      ...prev,
                      reminderAt: e.target.value ? new Date(e.target.value) : undefined
                    }))}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={!taskData.title.trim()}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {editingTask ? 'Güncelle' : 'Oluştur'}
          </button>
        </div>
      </div>
    </div>
  );
};
