import React, { useState } from 'react';
import { Calendar, CheckSquare, Clock, Plus, TrendingUp, Pin } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { useNotes } from '../hooks/useNotes';

export const Dashboard: React.FC = () => {
  const { tasks, loading: tasksLoading, toggleTask, addTask, getTaskStats } = useTasks();
  const { notes, loading: notesLoading, pinNote } = useNotes();
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const stats = getTaskStats();
  
  const todayTasks = tasks.filter(task => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return task.dueDate && task.dueDate >= today && task.dueDate < tomorrow;
  });

  const recentNotes = notes.slice(0, 3);

  const currentDate = new Date().toLocaleDateString('tr-TR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      await addTask({ 
        title: newTaskTitle.trim(),
        dueDate: new Date() // Bugün için
      });
      setNewTaskTitle('');
    }
  };

  const handleToggleTask = async (taskId: string) => {
    await toggleTask(taskId);
  };

  const handlePinNote = async (noteId: string, isPinned: boolean) => {
    await pinNote(noteId, !isPinned);
  };

  if (tasksLoading || notesLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Günlük Özet
        </h1>
        <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {currentDate}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Toplam Görevler</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">{stats.total}</p>
            </div>
            <CheckSquare className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 dark:text-green-400 text-sm font-medium">Tamamlanan</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-300">{stats.completed}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 dark:text-orange-400 text-sm font-medium">Bekleyen</p>
              <p className="text-2xl font-bold text-orange-900 dark:text-orange-300">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Başarı Oranı</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-300">{stats.completionRate}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Bugünün Görevleri</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {todayTasks.length} görev
            </span>
          </div>

          {/* Quick Add Task */}
          <form onSubmit={handleAddTask} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Hızlı görev ekle..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm
                         transition-colors duration-200 flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Ekle
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {todayTasks.length > 0 ? (
              todayTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={task.isCompleted}
                    onChange={() => handleToggleTask(task.id)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded 
                             focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 
                             focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <div className="flex-1">
                    <p className={`text-sm flex items-center gap-1 ${task.isCompleted 
                      ? 'line-through text-gray-500 dark:text-gray-400' 
                      : 'text-gray-900 dark:text-white'}`}>
                      {task.isPinned && (
                        <Pin className="w-3 h-3 text-yellow-500" />
                      )}
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Bugün için henüz görev yok
              </p>
            )}
          </div>
        </div>

        {/* Recent Notes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Son Notlar</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {notes.length} not
            </span>
          </div>

          <div className="space-y-3">
            {recentNotes.length > 0 ? (
              recentNotes.map((note) => (
                <div 
                  key={note.id}
                  className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer relative group"
                >
                  {/* Pin Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePinNote(note.id, note.isPinned || false);
                    }}
                    className={`absolute top-2 right-2 p-1.5 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 ${
                      note.isPinned 
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 opacity-100' 
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-500'
                    }`}
                    title={note.isPinned ? 'Sabitlemeyi kaldır' : 'Sabitle'}
                  >
                    <Pin className={`w-3 h-3 ${note.isPinned ? 'fill-current' : ''}`} />
                  </button>

                  <h3 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    {note.isPinned && (
                      <Pin className="w-3 h-3 text-yellow-500 fill-current" />
                    )}
                    {note.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {note.content.substring(0, 100)}...
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {note.createdAt.toLocaleDateString('tr-TR')}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Henüz not yok
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
