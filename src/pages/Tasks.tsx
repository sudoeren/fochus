import React, { useState } from 'react';
import { Plus, Calendar, Clock, CheckCircle, Circle, Edit, Trash2, Pin } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';

export const Tasks: React.FC = () => {
  const { tasks, loading, addTask, updateTask, deleteTask, toggleTask, pinTask, getTasksByFilter } = useTasks();
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed' | 'today' | 'overdue'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: ''
  });

  const filteredTasks = getTasksByFilter(activeFilter);

  const filterOptions = [
    { key: 'all', label: 'Hepsi', count: tasks.length },
    { key: 'pending', label: 'Bekleyen', count: tasks.filter(t => !t.isCompleted).length },
    { key: 'completed', label: 'Tamamlanan', count: tasks.filter(t => t.isCompleted).length },
    { key: 'today', label: 'Bugün', count: getTasksByFilter('today').length },
    { key: 'overdue', label: 'Gecikmiş', count: getTasksByFilter('overdue').length }
  ];

  const handleSaveTask = async () => {
    if (!newTask.title.trim()) return;

    const taskData = {
      title: newTask.title.trim(),
      description: newTask.description.trim(),
      dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined
    };

    if (editingTask) {
      await updateTask(editingTask, taskData);
      setEditingTask(null);
    } else {
      await addTask(taskData);
    }

    setNewTask({ title: '', description: '', dueDate: '' });
    setShowAddModal(false);
  };

  const handleEditTask = (task: any) => {
    setNewTask({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
    });
    setEditingTask(task.id);
    setShowAddModal(true);
  };

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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Görevler
        </h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Görev</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeFilter === filter.key
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
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

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <div 
              key={task.id} 
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
                        onClick={() => handleEditTask(task)}
                        className="p-1 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
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

      {/* Add/Edit Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingTask ? 'Görevi Düzenle' : 'Yeni Görev'}
              </h2>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setEditingTask(null);
                  setNewTask({ title: '', description: '', dueDate: '' });
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Görev Başlığı *
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  placeholder="Görev başlığı..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
                  placeholder="Görev açıklaması..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bitiş Tarihi
                </label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingTask(null);
                  setNewTask({ title: '', description: '', dueDate: '' });
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleSaveTask}
                disabled={!newTask.title.trim()}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed
                         text-white rounded-lg transition-colors"
              >
                {editingTask ? 'Güncelle' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
