import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Clock, Repeat, Plus, ChevronDown, Flag, List, Calendar } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { useTaskLists } from '../hooks/useTaskLists';
import { notificationService } from '../services/NotificationService';

type RecurringType = 'DAILY' | 'WEEKLY' | 'MONTHLY';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTask?: any;
  onEscapeToSpotlight?: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, editingTask, onEscapeToSpotlight }) => {
  const { addTask, updateTask } = useTasks();
  const { taskLists, loading: listsLoading } = useTaskLists();
  const [activeTab, setActiveTab] = useState('basic');
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
    listId: null as string | null,
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
        listId: editingTask?.listId || null,
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onEscapeToSpotlight ? onEscapeToSpotlight() : onClose();
      }
    };
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onEscapeToSpotlight, onClose]);

  const handleSave = async () => {
    if (!taskData.title.trim()) return;

    try {
      const dataToSend = {
        title: taskData.title,
        description: taskData.description,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
        priority: taskData.priority,
        listId: taskData.listId,
        hasReminder: taskData.hasReminder,
        reminderAt: taskData.reminderAt,
        isRecurring: taskData.isRecurring,
        recurringType: taskData.isRecurring ? taskData.recurringType : undefined,
        recurringInterval: taskData.isRecurring ? taskData.recurringInterval : undefined,
        recurringDays: taskData.isRecurring && taskData.recurringType === 'WEEKLY' ? taskData.recurringDays : undefined,
        recurringEndDate: taskData.isRecurring ? taskData.recurringEndDate : undefined,
        subtasks: taskData.subtasks
      };

      editingTask ? await updateTask(editingTask.id, dataToSend) : await addTask(dataToSend);

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
    setTaskData(prev => ({
      ...prev,
      subtasks: [...prev.subtasks, { id: Date.now().toString(), title: '', isCompleted: false }]
    }));
  };

  const updateSubtask = (id: string, updates: Partial<{ title: string; isCompleted: boolean }>) => {
    setTaskData(prev => ({
      ...prev,
      subtasks: prev.subtasks.map(s => s.id === id ? { ...s, ...updates } : s)
    }));
  };

  const removeSubtask = (id: string) => {
    setTaskData(prev => ({ ...prev, subtasks: prev.subtasks.filter(s => s.id !== id) }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 z-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            {editingTask ? 'Görevi Düzenle' : 'Yeni Görev'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-2 bg-gray-50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800">
          {[
            { id: 'basic', label: 'Genel', icon: CheckSquare },
            { id: 'subtasks', label: 'Alt Görevler', icon: List },
            { id: 'recurring', label: 'Tekrar', icon: Repeat },
            { id: 'reminder', label: 'Hatırlatıcı', icon: Clock }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all
                  ${isActive 
                    ? 'bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10' 
                    : 'text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800/50'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-zinc-700">
          
          {activeTab === 'basic' && (
            <div className="space-y-5">
              <input
                type="text"
                value={taskData.title}
                onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ne yapılması gerekiyor?"
                className="w-full text-xl font-medium bg-transparent border-none placeholder-gray-400 dark:placeholder-zinc-600 text-gray-900 dark:text-white focus:ring-0 p-0"
                autoFocus
              />
              
              <textarea
                value={taskData.description}
                onChange={(e) => setTaskData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detaylar, notlar veya linkler..."
                rows={4}
                className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-transparent focus:bg-white dark:focus:bg-zinc-800 focus:border-blue-500 dark:focus:border-blue-500 rounded-xl p-4 text-sm text-gray-700 dark:text-zinc-300 placeholder-gray-400 dark:placeholder-zinc-600 resize-none transition-all outline-none"
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wide">Bitiş Tarihi</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={taskData.dueDate}
                      onChange={(e) => setTaskData(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-transparent rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-zinc-500 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wide">Öncelik</label>
                  <div className="relative">
                    <select
                      value={taskData.priority}
                      onChange={(e) => setTaskData(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-transparent rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                    >
                      <option value="LOW">Düşük</option>
                      <option value="MEDIUM">Orta</option>
                      <option value="HIGH">Yüksek</option>
                    </select>
                    <Flag className={`absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 ${
                      taskData.priority === 'HIGH' ? 'text-red-500' : 
                      taskData.priority === 'MEDIUM' ? 'text-yellow-500' : 'text-blue-500'
                    }`} />
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wide">Liste</label>
                <div className="relative">
                  <select
                    value={taskData.listId || ''}
                    onChange={(e) => setTaskData(prev => ({ ...prev, listId: e.target.value || null }))}
                    className="w-full bg-gray-50 dark:bg-zinc-800/50 border border-transparent rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                    disabled={listsLoading}
                  >
                    <option value="">Genel Görevler</option>
                    {taskLists.map((list) => (
                      <option key={list.id} value={list.id}>{list.title}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'subtasks' && (
            <div className="space-y-4">
              <button
                onClick={addSubtask}
                className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-zinc-700 rounded-xl text-gray-500 dark:text-zinc-400 hover:border-blue-500 hover:text-blue-500 dark:hover:border-blue-400 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Plus className="w-4 h-4" />
                Yeni Alt Görev
              </button>

              <div className="space-y-2">
                {taskData.subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center gap-3 p-2 group">
                    <input
                      type="checkbox"
                      checked={subtask.isCompleted}
                      onChange={(e) => updateSubtask(subtask.id, { isCompleted: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-800"
                    />
                    <input
                      type="text"
                      value={subtask.title}
                      onChange={(e) => updateSubtask(subtask.id, { title: e.target.value })}
                      placeholder="Alt görev başlığı..."
                      className="flex-1 bg-transparent border-b border-transparent focus:border-gray-200 dark:focus:border-zinc-700 py-1 text-sm text-gray-900 dark:text-white focus:outline-none"
                    />
                    <button
                      onClick={() => removeSubtask(subtask.id)}
                      className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'recurring' && (
            <div className="space-y-6 p-4 bg-gray-50 dark:bg-zinc-800/30 rounded-xl border border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" id="isRecurring" className="sr-only peer" checked={taskData.isRecurring} onChange={(e) => setTaskData(prev => ({ ...prev, isRecurring: e.target.checked }))} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </div>
                <label htmlFor="isRecurring" className="font-medium text-gray-900 dark:text-white">Tekrarlanan Görev</label>
              </div>

              {taskData.isRecurring && (
                <div className="space-y-4 animate-in slide-in-from-top-2">
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={taskData.recurringType}
                      onChange={(e) => setTaskData(prev => ({ ...prev, recurringType: e.target.value as RecurringType }))}
                      className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="DAILY">Günlük</option>
                      <option value="WEEKLY">Haftalık</option>
                      <option value="MONTHLY">Aylık</option>
                    </select>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={taskData.recurringInterval}
                        onChange={(e) => setTaskData(prev => ({ ...prev, recurringInterval: parseInt(e.target.value) || 1 }))}
                        className="w-20 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                      <span className="text-sm text-gray-500 dark:text-zinc-400">arayla</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reminder' && (
            <div className="space-y-6 p-4 bg-gray-50 dark:bg-zinc-800/30 rounded-xl border border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" id="hasReminder" className="sr-only peer" checked={taskData.hasReminder} onChange={(e) => setTaskData(prev => ({ ...prev, hasReminder: e.target.checked }))} />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </div>
                <label htmlFor="hasReminder" className="font-medium text-gray-900 dark:text-white">Hatırlatıcı</label>
              </div>

              {taskData.hasReminder && (
                <div className="animate-in slide-in-from-top-2">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wide mb-2">Zaman</label>
                  <input
                    type="datetime-local"
                    value={taskData.reminderAt ? taskData.reminderAt.toISOString().slice(0, 16) : ''}
                    onChange={(e) => setTaskData(prev => ({ ...prev, reminderAt: e.target.value ? new Date(e.target.value) : undefined }))}
                    className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg px-4 py-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-medium text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={!taskData.title.trim()}
            className="px-8 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingTask ? 'Değişiklikleri Kaydet' : 'Görevi Oluştur'}
          </button>
        </div>
      </div>
    </div>
  );
};