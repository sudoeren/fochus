import React, { useState } from 'react';
import { 
  Calendar, 
  CheckSquare, 
  Plus, 
  Pin, 
  Clock, 
  CheckCircle, 
  Circle,
  ArrowRight,
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

  // Greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi günler';
    return 'İyi akşamlar';
  };

  // Filter tasks for today
  const todayTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    const taskDate = new Date(task.dueDate).toDateString();
    const today = new Date().toDateString();
    return taskDate === today && !task.isCompleted;
  }).sort((a, b) => (a.order || 0) - (b.order || 0));

  // Next up task (First incomplete task today or overdue)
  const nextTask = todayTasks[0] || tasks.find(t => !t.isCompleted && t.dueDate && new Date(t.dueDate) < new Date());

  // Recent/Pinned notes
  const pinnedNotes = notes.filter(n => n.isPinned).slice(0, 3);

  // Week days for mini calendar
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const isToday = (d: Date) => d.toDateString() === new Date().toDateString();

  if (tasksLoading || notesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500 dark:text-zinc-500">
        Yükleniyor...
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 min-h-screen bg-gray-50 dark:bg-black">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Main Agenda */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {getGreeting()},
            </h1>
            <p className="text-gray-500 dark:text-zinc-400 mt-1">
              Bugün tamamlaman gereken <span className="font-semibold text-gray-900 dark:text-white">{todayTasks.length} görev</span> var.
            </p>
          </div>

          {/* Today's Tasks List */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                Günün Ajandası
              </h2>
              <button 
                onClick={onOpenTaskModal}
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                + Görev Ekle
              </button>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-zinc-800">
              {todayTasks.length > 0 ? (
                todayTasks.map(task => (
                  <div key={task.id} className="group p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <button 
                      onClick={() => toggleTask(task.id)}
                      className="flex-shrink-0 text-gray-400 hover:text-blue-600 dark:text-zinc-500 dark:hover:text-blue-400 transition-colors"
                    >
                      <Circle className="w-5 h-5" />
                    </button>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onEditTask?.(task)}>
                      <h3 className="text-gray-900 dark:text-zinc-100 font-medium truncate">{task.title}</h3>
                      {task.description && (
                        <p className="text-xs text-gray-500 dark:text-zinc-500 truncate mt-0.5">{task.description}</p>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-zinc-600 font-mono">
                      {task.dueDate ? new Date(task.dueDate).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'}) : ''}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-500" />
                  </div>
                  <p className="text-gray-900 dark:text-white font-medium">Her şey tamam!</p>
                  <p className="text-sm text-gray-500 dark:text-zinc-500">Bugün için planlanan tüm görevleri bitirdin.</p>
                </div>
              )}
            </div>
            
            <div className="p-3 bg-gray-50 dark:bg-zinc-900/50 border-t border-gray-100 dark:border-zinc-800">
              <button 
                onClick={() => onNavigate('tasks')}
                className="w-full py-2 text-sm text-center text-gray-500 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Tüm görevleri görüntüle
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Widgets */}
        <div className="space-y-6">

          {/* Focus Card */}
          {nextTask && (
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20">
              <div className="flex items-center gap-2 mb-4 opacity-80">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Sıradaki Odak</span>
              </div>
              <h3 className="text-xl font-bold mb-2 leading-tight">{nextTask.title}</h3>
              <p className="text-blue-100 text-sm mb-6 line-clamp-2">{nextTask.description || 'Detay yok.'}</p>
              <button 
                onClick={() => toggleTask(nextTask.id)}
                className="w-full py-2.5 bg-white text-blue-600 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors"
              >
                Tamamla
              </button>
            </div>
          )}

          {/* Mini Calendar */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              Bu Hafta
            </h3>
            <div className="grid grid-cols-7 gap-1 text-center">
              {weekDays.map((day) => {
                const isCurrent = isToday(day);
                return (
                  <div key={day.toISOString()} className="flex flex-col items-center gap-1">
                    <span className="text-[10px] text-gray-400 dark:text-zinc-600 uppercase">
                      {day.toLocaleDateString('tr-TR', { weekday: 'narrow' })}
                    </span>
                    <div className={`
                      w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-all
                      ${isCurrent 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' 
                        : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
                      }
                    `}>
                      {day.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
            <button 
              onClick={() => onNavigate('weekly')}
              className="mt-4 w-full py-2 text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center justify-center gap-1"
            >
              Planlayıcıyı Aç <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Pinned Notes Widget */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Pin className="w-4 h-4 text-amber-500" />
                Sabitlenenler
              </h3>
              <button onClick={() => onOpenNoteModal()} className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded">
                <Plus className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-3">
              {pinnedNotes.length > 0 ? (
                pinnedNotes.map(note => (
                  <div 
                    key={note.id} 
                    onClick={() => onNavigate('notes')}
                    className="p-3 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-xl cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                  >
                    <h4 className="font-medium text-sm text-gray-900 dark:text-zinc-100 truncate">{note.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 line-clamp-2">{note.content}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 dark:text-zinc-600 text-center py-4">Henüz not yok.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
