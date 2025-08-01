import React, { useState } from 'react';
import { 
  Calendar, 
  CheckSquare, 
  Plus, 
  Pin, 
  Award,
  Clock,
  TrendingUp,
  Edit3
} from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { useNotes } from '../hooks/useNotes';

interface DashboardProps {
  onNavigate: (page: string) => void;
  onOpenTaskModal: () => void;
  onOpenNoteModal: () => void;
  onEditTask?: (task: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  onNavigate, 
  onOpenTaskModal, 
  onOpenNoteModal, 
  onEditTask 
}) => {
  const { tasks, toggleTask, loading: tasksLoading } = useTasks();
  const { notes, loading: notesLoading } = useNotes();
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Current date
  const currentDate = new Date().toLocaleDateString('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Today's tasks
  const todayTasks = tasks.filter(task => {
    if (!task.dueDate) return false; // dueDate olmayan görevler bugünün görevleri değil
    const taskDate = new Date(task.dueDate).toDateString();
    const today = new Date().toDateString();
    return taskDate === today;
  });

  // Pinned notes
  const pinnedNotes = notes.filter(note => note.isPinned);

  // Statistics
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.isCompleted).length,
    pending: tasks.filter(t => !t.isCompleted).length,
    totalNotes: notes.length
  };

  // Greeting function
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return { text: 'Günaydın', icon: '🌅' };
    } else if (hour < 18) {
      return { text: 'İyi öğleden sonralar', icon: '☀️' };
    } else {
      return { text: 'İyi akşamlar', icon: '🌙' };
    }
  };

  const greeting = getGreeting();

  const handleToggleTask = async (taskId: string) => {
    await toggleTask(taskId);
  };

  if (tasksLoading || notesLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          <span>Yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Modern Header */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {greeting.text} <span className="text-xl sm:text-2xl">{greeting.icon}</span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="truncate">{currentDate}</span>
            </p>
          </div>
          
          {/* Quick Action Button */}
          <div className="relative">
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline font-medium">Hızlı Eylemler</span>
              <span className="sm:hidden font-medium">Ekle</span>
            </button>
            
            {/* Quick Actions Dropdown */}
            {showQuickActions && (
              <div className="absolute right-0 top-full mt-2 w-48 sm:w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                <div className="p-4 space-y-2">
                  <button
                    onClick={() => {
                      onOpenTaskModal();
                      setShowQuickActions(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <CheckSquare className="w-5 h-5 text-blue-500" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Yeni Görev</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Görev ekle ve planlama yap</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      onOpenNoteModal();
                      setShowQuickActions(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Pin className="w-5 h-5 text-amber-500" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Yeni Not</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Fikirlerini kaydet</div>
                    </div>
                  </button>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                    <button
                      onClick={() => {
                        onNavigate('weekly-planner');
                        setShowQuickActions(false);
                      }}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Calendar className="w-5 h-5 text-green-500" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">Haftalık Planlayıcı</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Haftanı planla</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 lg:mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <CheckSquare className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</span>
          </div>
          <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Toplam Görev</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% tamamlandı
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <Award className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.completed}</span>
          </div>
          <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Tamamlanan</h3>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">Harika!</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.pending}</span>
          </div>
          <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Bekleyen</h3>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500" />
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Devam et!</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <Pin className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{stats.totalNotes}</span>
          </div>
          <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Toplam Not</h3>
          <div className="flex items-center gap-2">
            <Pin className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
              {pinnedNotes.length} sabitlenmiş
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Today's Tasks */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Bugünün Görevleri
              </h2>
              <button
                onClick={() => onNavigate('tasks')}
                className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Tümünü Gör
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {todayTasks.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {todayTasks.slice(0, 5).map((task) => (
                  <div 
                    key={task.id}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                  >
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className="flex-shrink-0 transition-colors"
                    >
                      {task.isCompleted ? (
                        <CheckSquare className="w-5 h-5 text-green-500" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded hover:border-green-500 transition-colors"></div>
                      )}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium text-gray-900 dark:text-white truncate ${
                        task.isCompleted ? 'line-through opacity-60' : ''
                      }`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {task.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditTask?.(task)}
                        className="p-1.5 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Bugün için görev yok!</p>
                <button
                  onClick={onOpenTaskModal}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  İlk görevi ekle
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Notes Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Pin className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                Sabitlenmiş Notlar
              </h2>
              <button
                onClick={() => onNavigate('notes')}
                className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Tümü
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {pinnedNotes.length > 0 ? (
              <div className="space-y-3">
                {pinnedNotes.map((note) => (
                  <div 
                    key={note.id}
                    className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate mb-1">
                          {note.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                          {note.content}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {note.createdAt ? new Date(note.createdAt).toLocaleDateString('tr-TR') : ''}
                          </span>
                          {note.isPinned && (
                            <Pin className="w-3 h-3 text-amber-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Pin className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">Henüz not yok</p>
                <button
                  onClick={onOpenNoteModal}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm"
                >
                  İlk notu ekle
                </button>
              </div>
            )}
          </div>

          {/* Navigation Cards */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Hızlı Erişim</h3>
            <div className="space-y-3">
              <button
                onClick={() => onNavigate('weekly-planner')}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Calendar className="w-5 h-5 text-green-500" />
                <span className="font-medium text-gray-900 dark:text-white">Haftalık Planlayıcı</span>
              </button>
              
              <button
                onClick={() => onNavigate('notes')}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Pin className="w-5 h-5 text-amber-500" />
                <span className="font-medium text-gray-900 dark:text-white">Tüm Notlar</span>
              </button>
              
              <button
                onClick={() => onNavigate('settings')}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Clock className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-gray-900 dark:text-white">Ayarlar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop for quick actions */}
      {showQuickActions && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowQuickActions(false)}
        />
      )}
    </div>
  );
};
