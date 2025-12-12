import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Play, 
  Pause, 
  RotateCcw, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  StickyNote,
  ArrowRight,
  TrendingUp,
  MoreHorizontal,
  Layout,
  Coffee,
  ListTodo,
  Timer 
} from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { useNotes } from '../hooks/useNotes';
import { usePomodoro } from '../hooks/usePomodoro';

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
  const { tasks, toggleTask, getTaskStats } = useTasks();
  const { notes } = useNotes();
  const pomodoro = usePomodoro();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 6) setGreeting('İyi Geceler');
    else if (hour < 12) setGreeting('Günaydın');
    else if (hour < 18) setGreeting('İyi Günler');
    else setGreeting('İyi Akşamlar');
  }, []);

  const today = new Date();
  const stats = getTaskStats();
  
  // Get today's tasks specifically
  const todayTasks = tasks.filter(t => 
    !t.isDeleted && t.dueDate && 
    new Date(t.dueDate).toDateString() === today.toDateString()
  ).sort((a, b) => {
    // Completed tasks at bottom
    if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
    // Then by time
    return new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime();
  });

  const recentNotes = notes.slice(0, 4);

  return (
    <div className="h-full bg-zinc-50 dark:bg-black p-4 md:p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {greeting}, Fokus.
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {today.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
             <button 
              onClick={() => onNavigate('settings')}
              className="p-2.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:scale-105 transition-transform shadow-sm"
            >
              <Layout className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 auto-rows-[minmax(180px,auto)]">
          
          {/* 1. Pomodoro Timer (Large Block) */}
          <div className="col-span-1 md:col-span-12 lg:col-span-4 row-span-2 relative overflow-hidden group">
            {/* Helper variables for conditional classes */}
            {(() => {
              const isWorkModeActive = pomodoro.isActive && pomodoro.mode === 'work';
              const isShortBreakModeActive = pomodoro.isActive && pomodoro.mode === 'shortBreak';
              const isLongBreakModeActive = pomodoro.isActive && pomodoro.mode === 'longBreak';
              const isBreakModeActive = isShortBreakModeActive || isLongBreakModeActive;

              const activeBgClasses = isWorkModeActive
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-800'
                : isBreakModeActive
                  ? 'bg-gradient-to-br from-sky-400 to-cyan-500 dark:from-sky-500 dark:to-cyan-700'
                  : 'bg-white dark:bg-zinc-900';

              const activeTextClasses = isWorkModeActive || isBreakModeActive ? 'text-white' : 'text-zinc-900 dark:text-white';
              const activeSubTextClasses = isWorkModeActive
                ? 'text-indigo-100'
                : isBreakModeActive
                  ? 'text-emerald-100'
                  : 'text-zinc-400';

              const activeLabelBgClasses = isWorkModeActive || isBreakModeActive ? 'bg-white/20 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500';
              const activeIconClasses = isWorkModeActive || isBreakModeActive ? 'text-white/80' : 'text-zinc-300';
              const activePlayButtonClasses = isWorkModeActive
                ? 'bg-white text-indigo-600'
                : isBreakModeActive
                  ? 'bg-white text-emerald-600'
                  : 'bg-zinc-900 dark:bg-white text-white dark:text-black';
              const activeResetButtonClasses = isWorkModeActive || isBreakModeActive
                ? 'bg-white/10 hover:bg-white/20 text-white'
                : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400';

              let modeLabelText;
              if (pomodoro.mode === 'work') {
                modeLabelText = 'Odaklanma';
              } else if (pomodoro.mode === 'shortBreak') {
                modeLabelText = 'Kısa Mola';
              } else if (pomodoro.mode === 'longBreak') {
                modeLabelText = 'Uzun Mola';
              }

              const timerStatusText = pomodoro.isActive ? 'Sayaç çalışıyor...' : 'Hazır mısın?';

              return (
                <>
                  <div className={`absolute inset-0 transition-colors duration-500 ${activeBgClasses}`}></div>
                  
                  <div className={`relative h-full p-6 flex flex-col justify-between border rounded-3xl transition-all duration-300 ${
                    pomodoro.isActive 
                      ? 'border-transparent ' + activeTextClasses 
                      : 'border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl ' + activeTextClasses
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${activeLabelBgClasses}`}>
                        {modeLabelText}
                      </span>
                      {pomodoro.mode === 'work' ? (
                        <Timer className={`w-5 h-5 ${activeIconClasses}`} />
                      ) : (
                        <Coffee className={`w-5 h-5 ${activeIconClasses}`} />
                      )}
                    </div>

                    <div className="flex flex-col items-center justify-center py-8">
                      <div className={`text-7xl font-bold font-mono tracking-tighter mb-2 ${activeTextClasses}`}>
                        {pomodoro.formatTime(pomodoro.timeLeft)}
                      </div>
                      <p className={`text-sm ${activeSubTextClasses}`}>
                        {timerStatusText}
                      </p>
                    </div>

                    {/* Mode Selection Buttons */}
                    <div className="flex justify-center gap-2 mb-4">
                      {['work', 'shortBreak', 'longBreak'].map((modeItem) => {
                        let modeText = '';
                        if (modeItem === 'work') modeText = 'Odaklanma';
                        else if (modeItem === 'shortBreak') modeText = 'Kısa Mola';
                        else if (modeItem === 'longBreak') modeText = 'Uzun Mola';

                        return (
                          <button
                            key={modeItem}
                            onClick={() => pomodoro.setMode(modeItem as any)} // Cast needed for TimerMode
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                              pomodoro.mode === modeItem
                                ? isWorkModeActive || (pomodoro.mode === 'work' && pomodoro.isActive)
                                  ? 'bg-white/30 text-white'
                                  : isBreakModeActive || ((pomodoro.mode === 'shortBreak' || pomodoro.mode === 'longBreak') && pomodoro.isActive)
                                    ? 'bg-white/30 text-white'
                                    : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200'
                                : isWorkModeActive || isBreakModeActive
                                  ? 'text-white/70 hover:text-white hover:bg-white/10'
                                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                            }`}
                          >
                            {modeText}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-center gap-4">
                      <button 
                        onClick={pomodoro.toggleTimer}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg ${activePlayButtonClasses}`}
                      >
                        {pomodoro.isActive ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current pl-1" />}
                      </button>
                      <button 
                        onClick={pomodoro.resetTimer}
                        className={`p-4 rounded-full transition-colors ${activeResetButtonClasses}`}
                      >
                        <RotateCcw className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          {/* 2. Stats Cards (Small Blocks) */}
          <div className="col-span-1 md:col-span-6 lg:col-span-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 rounded-3xl p-6 flex flex-col justify-between group hover:border-orange-200 dark:hover:border-orange-900/40 transition-colors">
            <div className="flex items-start justify-between">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl text-orange-600 dark:text-orange-400">
                <ListTodo className="w-6 h-6" />
              </div>
              <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{stats.today}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-200">Bugünkü Görevler</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{stats.completed} tamamlandı</p>
            </div>
          </div>

          <div className="col-span-1 md:col-span-6 lg:col-span-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-3xl p-6 flex flex-col justify-between group hover:border-emerald-200 dark:hover:border-emerald-900/40 transition-colors">
            <div className="flex items-start justify-between">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">%{stats.completionRate}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-200">Verimlilik</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Haftalık ortalama</p>
            </div>
          </div>

          {/* 3. Today's Tasks List (Tall Block) */}
          <div className="col-span-1 md:col-span-12 lg:col-span-8 row-span-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 flex flex-col shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                Bugünün Planı
              </h2>
              <button 
                onClick={onOpenTaskModal}
                className="flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
              >
                <Plus className="w-4 h-4" />
                Yeni Görev
              </button>
            </div>

            <div className="flex-1 overflow-y-auto -mx-2 px-2 space-y-2 custom-scrollbar">
              {todayTasks.length > 0 ? (
                todayTasks.map(task => (
                  <div 
                    key={task.id}
                    className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800"
                  >
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        task.isCompleted 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'border-zinc-300 dark:border-zinc-600 hover:border-indigo-500 dark:hover:border-indigo-400'
                      }`}
                    >
                      {task.isCompleted && <CheckCircle2 className="w-4 h-4" />}
                    </button>
                    
                    <div className="flex-1 min-w-0" onClick={() => onEditTask?.(task)}>
                      <p className={`font-medium truncate transition-colors ${
                        task.isCompleted ? 'text-zinc-400 line-through' : 'text-zinc-900 dark:text-zinc-200'
                      }`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {task.dueDate ? new Date(task.dueDate).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : 'Tüm gün'}
                      </div>
                    </div>

                    <button 
                      onClick={() => onEditTask?.(task)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-60">
                  <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                    <ListTodo className="w-8 h-8 text-zinc-400" />
                  </div>
                  <p className="text-zinc-500 font-medium">Bugün için planın boş</p>
                  <p className="text-sm text-zinc-400">Yeni bir görev ekleyerek başla</p>
                </div>
              )}
            </div>
            
            <div className="pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800">
              <button 
                onClick={() => onNavigate('tasks')}
                className="w-full py-2 flex items-center justify-center gap-2 text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
              >
                Tüm Görevleri Gör <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 4. Quick Notes (Medium Block) */}
          <div className="col-span-1 md:col-span-12 lg:col-span-4 row-span-2 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/20 rounded-3xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
                Hızlı Notlar
              </h2>
              <button onClick={onOpenNoteModal} className="p-1.5 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg transition-colors text-yellow-700 dark:text-yellow-400">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              {recentNotes.length > 0 ? (
                recentNotes.map(note => (
                  <div 
                    key={note.id}
                    onClick={() => onNavigate('notes')}
                    className="p-3 bg-white dark:bg-zinc-900/60 rounded-xl border border-yellow-100 dark:border-yellow-900/20 cursor-pointer hover:scale-[1.02] transition-transform shadow-sm"
                  >
                    <h4 className="font-medium text-sm text-zinc-900 dark:text-zinc-200 truncate">{note.title}</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                      {note.content.replace(/<[^>]*>/g, '') || 'İçerik yok'}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-zinc-400 text-sm">
                  Henüz not yok
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};