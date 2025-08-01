import React from 'react';
import { Calendar, CheckSquare, Clock, Plus, TrendingUp, Pin, Award, Coffee } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { useNotes } from '../hooks/useNotes';

interface DashboardProps {
  onOpenNoteModal: () => void;
  onOpenTaskModal: () => void;
}

// Helper to get a friendly time of day message
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Günaydın';
  if (hour < 18) return 'İyi Günler';
  return 'İyi Akşamlar';
};

export const Dashboard: React.FC<DashboardProps> = ({ onOpenNoteModal, onOpenTaskModal }) => {
  const { tasks, loading: tasksLoading, toggleTask, getTaskStats } = useTasks();
  const { notes, loading: notesLoading, pinNote } = useNotes();

  const stats = getTaskStats();
  
  const todayTasks = tasks.filter(task => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return task.dueDate && task.dueDate >= today && task.dueDate < tomorrow;
  });

  const pinnedNotes = notes.filter(note => note.isPinned);

  const currentDate = new Date().toLocaleDateString('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleToggleTask = async (taskId: string) => {
    await toggleTask(taskId);
  };

  const handlePinNote = async (noteId: string, isPinned: boolean) => {
    await pinNote(noteId, !isPinned);
  };

  if (tasksLoading || notesLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-500 dark:text-gray-400">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white">
          {getGreeting()}, <span className="text-blue-500">Eren</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          {currentDate}
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
        
        {/* Left Column (Tasks and Notes) */}
        <div className="lg:col-span-2 xl:col-span-3 space-y-6 lg:space-y-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-6">
            <StatCard icon={<CheckSquare />} title="Toplam Görevler" value={stats.total} color="blue" />
            <StatCard icon={<Award />} title="Tamamlanan" value={stats.completed} color="green" />
            <StatCard icon={<Clock />} title="Bekleyen" value={stats.pending} color="orange" />
            <StatCard icon={<TrendingUp />} title="Başarı Oranı" value={`${stats.completionRate}%`} color="purple" />
          </div>

          {/* Today's Tasks */}
          <div className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white mb-2 sm:mb-0">Bugünün Görevleri</h2>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                {todayTasks.length} görev
              </span>
            </div>
            <div className="space-y-4">
              {todayTasks.length > 0 ? (
                todayTasks.map((task) => (
                  <TaskItem key={task.id} task={task} onToggle={handleToggleTask} />
                ))
              ) : (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <Coffee className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="font-semibold">Bugün için planlanmış bir görev yok.</p>
                  <p className="text-sm">Yeni bir görev ekleyerek başlayın!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Pinned Notes and Quick Actions) */}
        <div className="lg:col-span-1 xl:col-span-1 space-y-6 lg:space-y-8">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white mb-4">Hızlı Eylemler</h2>
            <div className="flex flex-col space-y-3">
              <button
                onClick={onOpenTaskModal}
                className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Yeni Görev Ekle
              </button>
              <button
                onClick={onOpenNoteModal}
                className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Yeni Not Ekle
              </button>
            </div>
          </div>

          {/* Pinned Notes */}
          <div className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">Sabitlenmiş Notlar</h2>
              <Pin className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="space-y-4">
              {pinnedNotes.length > 0 ? (
                pinnedNotes.map((note) => (
                  <NoteItem key={note.id} note={note} onPin={handlePinNote} />
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  Sabitlenmiş not bulunmuyor.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Reusable Components ---

const StatCard = ({ icon, title, value, color }) => (
  <div className={`bg-white dark:bg-gray-800/50 p-4 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 flex items-center gap-4 transition-transform hover:scale-105`}>
    <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/30 text-${color}-500 dark:text-${color}-400`}>
      {React.cloneElement(icon, { className: "w-6 h-6" })}
    </div>
    <div>
      <p className={`text-sm font-medium text-gray-500 dark:text-gray-400`}>{title}</p>
      <p className={`text-xl sm:text-2xl font-bold text-gray-800 dark:text-white`}>{value}</p>
    </div>
  </div>
);

const TaskItem = ({ task, onToggle }) => (
  <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer">
    <input
      type="checkbox"
      checked={task.isCompleted}
      onChange={() => onToggle(task.id)}
      className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded-full focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-600 dark:border-gray-500 flex-shrink-0"
    />
    <div className="flex-1 min-w-0">
      <p className={`font-medium flex items-center gap-2 truncate ${task.isCompleted ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-white'}`}>
        {task.isPinned && <Pin className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
        <span className="truncate">{task.title}</span>
      </p>
      {task.description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
          {task.description}
        </p>
      )}
    </div>
  </div>
);

const NoteItem = ({ note, onPin }) => (
  <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 relative group">
     <button
      onClick={(e) => {
        e.stopPropagation();
        onPin(note.id, note.isPinned);
      }}
      className={`absolute top-2 right-2 p-1.5 rounded-full transition-all duration-200 ${
        note.isPinned 
          ? 'bg-yellow-200 dark:bg-yellow-800/50 text-yellow-600 dark:text-yellow-400' 
          : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100'
      }`}
      title={note.isPinned ? 'Sabitlemeyi kaldır' : 'Sabitle'}
    >
      <Pin className="w-4 h-4" />
    </button>
    <h3 className="font-semibold text-gray-800 dark:text-white mb-2 pr-8 truncate">
      {note.title}
    </h3>
    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
      {note.content}
    </p>
  </div>
);

