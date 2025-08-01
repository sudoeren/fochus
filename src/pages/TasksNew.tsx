import React, { useState, useMemo } from 'react';
import { Plus, Search, Calendar, Clock, Flag, CheckCircle2, Circle, Trash2, Edit3, Pin, PinOff, Target } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { useTaskLists } from '../hooks/useTaskLists';
import { TaskListModal } from '../components/TaskListModal';

interface TasksProps {
  onOpenTaskModal: () => void;
  onEditTask: (task: any) => void;
}

export const TasksWithLists: React.FC<TasksProps> = ({ onOpenTaskModal, onEditTask }) => {
  const { tasks, loading, deleteTask, toggleTask, pinTask } = useTasks();
  const { taskLists, loading: listsLoading } = useTaskLists();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [showListModal, setShowListModal] = useState(false);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (task.isDeleted) return false;
      
      // Search filter
      if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Status filter
      if (filterStatus === 'pending' && task.isCompleted) return false;
      if (filterStatus === 'completed' && !task.isCompleted) return false;
      
      // List filter
      if (selectedList !== null) {
        if (selectedList === 'uncategorized') {
          return !task.listId;
        }
        return task.listId === selectedList;
      }
      
      return true;
    });
  }, [tasks, searchTerm, filterStatus, selectedList]);

  const stats = useMemo(() => {
    const total = tasks.filter(t => !t.isDeleted).length;
    const completed = tasks.filter(t => !t.isDeleted && t.isCompleted).length;
    const pending = total - completed;
    const overdue = tasks.filter(t => 
      !t.isDeleted && 
      !t.isCompleted && 
      t.dueDate && 
      new Date(t.dueDate) < new Date()
    ).length;
    
    return { total, completed, pending, overdue };
  }, [tasks]);

  const handleToggleTask = async (id: string) => {
    await toggleTask(id);
  };

  const handlePinTask = async (id: string, currentPinned: boolean) => {
    await pinTask(id, !currentPinned);
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
      await deleteTask(id);
    }
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const taskDate = new Date(date);
    const diffTime = taskDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Bugün';
    if (diffDays === 1) return 'Yarın';
    if (diffDays === -1) return 'Dün';
    if (diffDays < -1) return `${Math.abs(diffDays)} gün önce`;
    if (diffDays > 1) return `${diffDays} gün sonra`;
    
    return taskDate.toLocaleDateString('tr-TR');
  };

  const getPriorityColor = (task: any) => {
    if (task.isPinned) return 'text-yellow-500';
    if (task.dueDate && new Date(task.dueDate) < new Date() && !task.isCompleted) return 'text-red-500';
    return 'text-gray-400';
  };

  if (loading || listsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Görevlerim</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Günlük görevlerinizi organize edin ve takip edin
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowListModal(true)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-2 inline" />
              Yeni Liste
            </button>
            <button
              onClick={onOpenTaskModal}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/25 text-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-2 inline" />
              Yeni Görev
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Toplam</p>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{stats.total}</p>
              </div>
              <Target className="w-10 h-10 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">Tamamlanan</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">{stats.completed}</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">Bekleyen</p>
                <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">{stats.pending}</p>
              </div>
              <Clock className="w-10 h-10 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Geciken</p>
                <p className="text-3xl font-bold text-red-700 dark:text-red-300">{stats.overdue}</p>
              </div>
              <Flag className="w-10 h-10 text-red-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Görevlerde ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white text-sm min-w-[140px]"
          >
            <option value="all">Tüm Görevler</option>
            <option value="pending">Bekleyen</option>
            <option value="completed">Tamamlanan</option>
          </select>
          
          <select
            value={selectedList || 'all'}
            onChange={(e) => setSelectedList(e.target.value === 'all' ? null : e.target.value)}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          >
            <option value="all">Tüm Listeler</option>
            <option value="uncategorized">Kategorisiz</option>
            {taskLists.map(list => (
              <option key={list.id} value={list.id}>{list.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm || filterStatus !== 'all' || selectedList ? 'Görev bulunamadı' : 'Henüz görev yok'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {searchTerm || filterStatus !== 'all' || selectedList 
                  ? 'Farklı filtreler deneyebilir veya yeni görev ekleyebilirsiniz.'
                  : 'İlk görevinizi oluşturmaya hazır mısınız?'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && !selectedList && (
                <button
                  onClick={onOpenTaskModal}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  İlk Görevi Oluştur
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`bg-white dark:bg-gray-800 rounded-xl border ${
                    task.isCompleted 
                      ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10' 
                      : 'border-gray-200 dark:border-gray-700'
                  } p-6 hover:shadow-lg transition-all group`}
                >
                  <div className="flex items-center gap-4">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className="flex-shrink-0"
                    >
                      {task.isCompleted ? (
                        <CheckCircle2 className="w-7 h-7 text-green-500" />
                      ) : (
                        <Circle className={`w-7 h-7 ${getPriorityColor(task)} hover:text-blue-500 transition-colors`} />
                      )}
                    </button>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`text-lg font-medium ${
                          task.isCompleted 
                            ? 'text-gray-500 dark:text-gray-400 line-through' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {task.title}
                        </h3>
                        
                        {task.isPinned && (
                          <Pin className="w-5 h-5 text-yellow-500" />
                        )}
                        
                        {task.listId && (
                          <span 
                            className="px-3 py-1 text-sm rounded-full text-white font-medium"
                            style={{ backgroundColor: taskLists.find(l => l.id === task.listId)?.color || '#6B7280' }}
                          >
                            {taskLists.find(l => l.id === task.listId)?.title}
                          </span>
                        )}
                      </div>
                      
                      {task.description && (
                        <p className="text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                        {task.dueDate && (
                          <div className={`flex items-center gap-2 ${
                            new Date(task.dueDate) < new Date() && !task.isCompleted ? 'text-red-500' : ''
                          }`}>
                            <Calendar className="w-4 h-4" />
                            {formatDate(new Date(task.dueDate))}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {new Date(task.createdAt).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handlePinTask(task.id, task.isPinned || false)}
                        className="p-3 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-all"
                        title={task.isPinned ? 'Pin\'i kaldır' : 'Pin\'le'}
                      >
                        {task.isPinned ? <PinOff className="w-5 h-5" /> : <Pin className="w-5 h-5" />}
                      </button>
                      
                      <button
                        onClick={() => onEditTask(task)}
                        className="p-3 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                        title="Düzenle"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                        title="Sil"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task List Modal */}
      <TaskListModal
        isOpen={showListModal}
        onClose={() => setShowListModal(false)}
      />
    </div>
  );
};
