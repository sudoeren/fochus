import React, { useState } from 'react';
import { Plus, Calendar, Clock, CheckCircle, Circle, Trash2, Pin } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';

interface TasksProps {
  onOpenTaskModal: () => void;
}

export const Tasks: React.FC<TasksProps> = ({ onOpenTaskModal }) => {
  const { tasks, loading, deleteTask, toggleTask, pinTask, getTasksByFilter } = useTasks();
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed' | 'today' | 'overdue'>('all');

  const filteredTasks = getTasksByFilter(activeFilter);

  const filterOptions = [
    { key: 'all', label: 'Hepsi', count: tasks.length },
    { key: 'pending', label: 'Bekleyen', count: tasks.filter(t => !t.isCompleted).length },
    { key: 'completed', label: 'Tamamlanan', count: tasks.filter(t => t.isCompleted).length },
    { key: 'today', label: 'Bugün', count: getTasksByFilter('today').length },
    { key: 'overdue', label: 'Gecikmiş', count: getTasksByFilter('overdue').length }
  ];

  const handleDeleteTask = async (id: string) => {
    if (confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
      await deleteTask(id);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    await toggleTask(taskId);
  };

  const handlePinTask = async (taskId: string, isPinned: boolean) => {
    await pinTask(taskId, !isPinned);
  };

  const getStatusColor = (task: any) => {
    if (task.isCompleted) return 'text-green-500';
    if (task.dueDate && new Date(task.dueDate) < new Date()) return 'text-red-500';
    return 'text-gray-400';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
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
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Görevlerim
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Görevlerinizi organize edin ve takip edin
          </p>
        </div>
        <button 
          onClick={onOpenTaskModal}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 
                   text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-200 
                   shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          <span>Yeni Görev Ekle</span>
        </button>
      </div>

      {/* Enhanced Filter Tabs */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-2">
        <div className="flex flex-wrap gap-1">
          {filterOptions.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key as any)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                activeFilter === filter.key
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-200 dark:border-blue-800'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
            >
            <span>{filter.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              activeFilter === filter.key
                ? 'bg-blue-400 text-white'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
            }`}>
              {filter.count}
            </span>
          </button>
        ))}
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <div 
              key={task.id} 
              data-task-id={task.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => handleToggleTask(task.id)}
                  className={`mt-1 transition-colors ${getStatusColor(task)}`}
                >
                  {task.isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`text-lg font-medium flex items-center gap-2 ${
                        task.isCompleted 
                          ? 'line-through text-gray-500 dark:text-gray-400' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {task.isPinned && (
                          <Pin className="w-4 h-4 text-yellow-500" />
                        )}
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className={`text-sm mt-1 ${
                          task.isCompleted 
                            ? 'line-through text-gray-400 dark:text-gray-500' 
                            : 'text-gray-600 dark:text-gray-300'
                        }`}>
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 mt-2">
                        {task.dueDate && (
                          <div className={`flex items-center gap-1 text-xs ${
                            task.isCompleted 
                              ? 'text-gray-400 dark:text-gray-500'
                              : new Date(task.dueDate) < new Date()
                                ? 'text-red-500 dark:text-red-400'
                                : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(new Date(task.dueDate))}</span>
                          </div>
                        )}
                        
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.status === 'COMPLETED' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                            : task.status === 'PENDING'
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}>
                          {task.status === 'COMPLETED' ? 'Tamamlandı' : 
                           task.status === 'PENDING' ? 'Bekliyor' : 'Ertelendi'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handlePinTask(task.id, task.isPinned || false)}
                        className={`p-1 transition-colors ${
                          task.isPinned 
                            ? 'text-yellow-500 hover:text-yellow-600' 
                            : 'text-gray-400 hover:text-yellow-500'
                        }`}
                        title={task.isPinned ? 'Sabitlemeyi kaldır' : 'Sabitle'}
                      >
                        <Pin className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Clock className="w-12 h-12 text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-center">
              {activeFilter === 'all' ? 'Henüz görev eklenmemiş' : 
               activeFilter === 'pending' ? 'Bekleyen görev yok' :
               activeFilter === 'completed' ? 'Tamamlanan görev yok' :
               activeFilter === 'today' ? 'Bugün için görev yok' :
               'Gecikmiş görev yok'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
