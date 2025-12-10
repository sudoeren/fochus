import React, { useState } from 'react';
import { 
  Calendar, 
  CheckSquare, 
  Plus, 
  Pin, 
  Award,
  Clock,
  TrendingUp,
  Edit3,
  MoreHorizontal
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
    if (!task.dueDate) return false;
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
        <div className="flex items-center gap-3 text-gray-500 dark:text-zinc-400">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          <span>Yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50 dark:bg-black">
      {/* Modern Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
              {greeting.text}, <span className="text-gray-500 dark:text-zinc-500">Hoşgeldin</span>
            </h1>
            <p className="text-base text-gray-600 dark:text-zinc-400 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{currentDate}</span>
            </p>
          </div>
          
          {/* Quick Action Button */}
          <div className="relative">
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all duration-200 font-medium shadow-sm"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Hızlı Ekle</span>
            </button>
            
            {/* Quick Actions Dropdown */}
            {showQuickActions && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-gray-200 dark:border-zinc-800 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                <div className="p-1.5">
                  <button
                    onClick={() => {
                      onOpenTaskModal();
                      setShowQuickActions(false);
                    }}
                    className="w-full flex items-center gap-3 p-2.5 text-left text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                      <CheckSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Yeni Görev</div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => {
                      onOpenNoteModal();
                      setShowQuickActions(false);
                    }}
                    className="w-full flex items-center gap-3 p-2.5 text-left text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                      <Pin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Yeni Not</div>
                    </div>
                  </button>
                  
                  <div className="my-1 border-t border-gray-100 dark:border-zinc-800" />

                  <button
                    onClick={() => {
                      onNavigate('weekly-planner');
                      setShowQuickActions(false);
                    }}
                    className="w-full flex items-center gap-3 p-2.5 text-left text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <div className="p-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Haftalık Plan</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{stats.total}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-zinc-400 mb-1">Toplam Görev</h3>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full" 
                style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{stats.completed}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-zinc-400 mb-1">Tamamlanan</h3>
          <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Harika gidiyorsun!</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{stats.pending}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-zinc-400 mb-1">Bekleyen</h3>
          <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Devam et!</span>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <Pin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{stats.totalNotes}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-zinc-400 mb-1">Toplam Not</h3>
          <div className="flex items-center gap-1.5 text-xs font-medium text-purple-600 dark:text-purple-400">
            <Pin className="w-3.5 h-3.5" />
            <span>{pinnedNotes.length} sabitlenmiş</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Today's Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Bugünün Görevleri
              </h2>
              <button
                onClick={() => onNavigate('tasks')}
                className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
              >
                Tümünü Gör
              </button>
            </div>
            
            {todayTasks.length > 0 ? (
              <div className="space-y-3">
                {todayTasks.slice(0, 5).map((task) => (
                  <div 
                    key={task.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-black/40 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-zinc-800 transition-all group"
                  >
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className="flex-shrink-0 transition-colors"
                    >
                      {task.isCompleted ? (
                        <div className="w-5 h-5 bg-green-500 rounded-md flex items-center justify-center">
                          <CheckSquare className="w-3.5 h-3.5 text-white" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 border-2 border-gray-300 dark:border-zinc-600 rounded-md hover:border-green-500 transition-colors"></div>
                      )}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium text-gray-900 dark:text-zinc-100 truncate ${
                        task.isCompleted ? 'line-through opacity-50' : ''
                      }`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-sm text-gray-500 dark:text-zinc-500 truncate mt-0.5">
                          {task.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditTask?.(task)}
                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border-2 border-dashed border-gray-100 dark:border-zinc-800 rounded-xl">
                <div className="w-12 h-12 bg-gray-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckSquare className="w-6 h-6 text-gray-400 dark:text-zinc-600" />
                </div>
                <p className="text-gray-500 dark:text-zinc-500 mb-4 font-medium">Bugün için görev yok</p>
                <button
                  onClick={onOpenTaskModal}
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  İlk görevi ekle
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Pinned Notes */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Pin className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                Sabitlenenler
              </h2>
              <button
                onClick={() => onNavigate('notes')}
                className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-zinc-200 transition-colors"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
            
            {pinnedNotes.length > 0 ? (
              <div className="space-y-3">
                {pinnedNotes.map((note) => (
                  <div 
                    key={note.id}
                    onClick={() => onNavigate('notes')}
                    className="p-4 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors cursor-pointer group"
                  >
                    <h3 className="font-medium text-gray-900 dark:text-zinc-100 truncate mb-1">
                      {note.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-sm text-gray-500 dark:text-zinc-500">Henüz sabitlenmiş not yok</p>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/20">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-white/80" />
              Hızlı Erişim
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('weekly-planner')}
                className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm transition-colors border border-white/10"
              >
                <span className="font-medium text-sm">Haftalık Plan</span>
                <Calendar className="w-4 h-4 text-white/80" />
              </button>
              
              <button
                onClick={() => onNavigate('notes')}
                className="w-full flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm transition-colors border border-white/10"
              >
                <span className="font-medium text-sm">Tüm Notlar</span>
                <Pin className="w-4 h-4 text-white/80" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop for quick actions */}
      {showQuickActions && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px] transition-opacity" 
          onClick={() => setShowQuickActions(false)}
        />
      )}
    </div>
  );
};