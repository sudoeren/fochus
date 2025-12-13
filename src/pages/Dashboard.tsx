import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  CheckSquare,
  FileText,
  Clock,
  ArrowRight,
  Search as SearchIcon,
  Zap,
  Calendar,
  MoreHorizontal
} from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { useNotes } from '../hooks/useNotes';
import { usePomodoro } from '../hooks/usePomodoro';
import { cn } from '../lib/utils';

interface DashboardProps {
  onNavigate: (view: string) => void;
  onOpenNoteModal: () => void;
  onOpenTaskModal: () => void;
  onEditTask: (task: any) => void;
  onOpenSpotlight: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  onNavigate, 
  onOpenNoteModal, 
  onOpenTaskModal,
  onEditTask,
  onOpenSpotlight 
}) => {
  const { tasks } = useTasks();
  const { notes } = useNotes();
  const { timeLeft, isActive, toggleTimer, formatTime } = usePomodoro();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const getGreeting = () => {
    const h = currentTime.getHours();
    if (h < 6) return "Gece Mesaisi";
    if (h < 12) return "Günaydın";
    if (h < 18) return "İyi Çalışmalar";
    return "İyi Akşamlar";
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const pendingTasks = tasks.filter(t => !t.isCompleted && !t.isDeleted);

  return (
    <div className="h-full w-full relative">
      {/* BACKGROUND IMAGE - Only visible on Dashboard, covers entire screen including sidebar area */}
      <div className="fixed inset-0 z-[-1]">
        <img 
          src="/light.png" 
          alt="Background" 
          className="absolute inset-0 w-full h-full object-cover dark:hidden transition-opacity duration-500" 
        />
        <img 
          src="/dark.png" 
          alt="Background" 
          className="absolute inset-0 w-full h-full object-cover hidden dark:block transition-opacity duration-500" 
        />
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-white/30 dark:bg-black/40 backdrop-blur-[2px]" />
      </div>

      <div className="p-8 lg:p-12 pb-24 overflow-y-auto custom-scrollbar h-full">
        <div className="max-w-[1600px] mx-auto flex flex-col gap-12">
        
        {/* Header Section - Clock & Greeting */}
        <div className="flex flex-col items-start gap-2 animate-in slide-in-from-left duration-700">
          <h1 className="text-7xl lg:text-8xl font-bold tracking-tighter text-zinc-900 dark:text-white drop-shadow-sm font-mono">
            {currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
          </h1>
          <div className="flex items-center gap-3">
            <div className="h-px w-12 bg-zinc-900/50 dark:bg-white/50" />
            <span className="text-2xl font-light text-zinc-700 dark:text-zinc-200 uppercase tracking-widest">
              {getGreeting()}
            </span>
          </div>
        </div>

        {/* Main Unified Glass Frame (Bento Grid Container) */}
        <div className="w-full bg-white/30 dark:bg-black/30 backdrop-blur-2xl border border-white/20 dark:border-white/5 rounded-[40px] p-8 lg:p-10 shadow-2xl animate-in slide-in-from-bottom duration-700 delay-200">
           
           <div className="flex flex-col gap-8">
              
              {/* 1. Search Section - Integrated into the top */}
              <div className="w-full">
                <button 
                  onClick={onOpenSpotlight}
                  className="w-full flex items-center justify-between p-6 bg-white/40 dark:bg-zinc-900/40 hover:bg-white/60 dark:hover:bg-zinc-900/60 border border-white/30 dark:border-white/5 rounded-3xl transition-all duration-300 group cursor-text text-left shadow-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-zinc-900 dark:bg-white rounded-2xl text-white dark:text-zinc-900 shadow-lg group-hover:scale-110 transition-transform">
                       <SearchIcon className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xl font-semibold text-zinc-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        Ne arıyorsunuz?
                      </span>
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        Komutlar, görevler, notlar...
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pr-4">
                    <kbd className="hidden md:flex h-8 items-center gap-1 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2 font-mono text-xs font-medium text-zinc-500">
                      <span className="text-xs">⌘</span>K
                    </kbd>
                  </div>
                </button>
              </div>

              {/* 2. Widgets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Pomodoro Card */}
                <div className="group relative overflow-hidden bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/5 dark:to-purple-500/5 border border-white/20 dark:border-white/5 rounded-3xl p-6 transition-all hover:scale-[1.01] hover:shadow-xl">
                   <div className="absolute top-0 right-0 p-6 opacity-50">
                      <Clock className="w-24 h-24 text-indigo-500/20 -mr-6 -mt-6" />
                   </div>
                   
                   <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                           <Zap className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-zinc-700 dark:text-zinc-200">Odak Zamanı</span>
                      </div>

                      <div className="flex flex-col">
                         <span className={cn("text-5xl font-mono font-bold tracking-tighter", isActive ? "text-indigo-600 dark:text-indigo-400 animate-pulse" : "text-zinc-900 dark:text-white")}>
                           {formatTime(timeLeft)}
                         </span>
                         <span className="text-sm text-zinc-500 mt-1">
                           {isActive ? "Süre işliyor..." : "Hazır mısın?"}
                         </span>
                      </div>

                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleTimer(); }}
                        className="w-full py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                      >
                        {isActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                        {isActive ? "Duraklat" : "Başlat"}
                      </button>
                   </div>
                </div>

                {/* Tasks Card */}
                <div 
                  onClick={() => onNavigate('tasks')}
                  className="group relative overflow-hidden bg-white/40 dark:bg-zinc-900/40 border border-white/20 dark:border-white/5 rounded-3xl p-6 cursor-pointer transition-all hover:bg-white/60 dark:hover:bg-zinc-900/60 hover:scale-[1.01] hover:shadow-xl"
                >
                   <div className="flex flex-col h-full justify-between gap-6">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                               <CheckSquare className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-zinc-700 dark:text-zinc-200">Görevler</span>
                         </div>
                         <ArrowRight className="w-5 h-5 text-zinc-400 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                      </div>

                      <div>
                         <div className="flex items-baseline gap-2">
                           <span className="text-4xl font-bold text-zinc-900 dark:text-white">{pendingTasks.length}</span>
                           <span className="text-lg text-zinc-500">bekleyen</span>
                         </div>
                         <div className="mt-4 space-y-2">
                            {pendingTasks.slice(0, 2).map(task => (
                              <div key={task.id} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 truncate">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                <span className="truncate">{task.title}</span>
                              </div>
                            ))}
                            {pendingTasks.length === 0 && <span className="text-sm text-zinc-400 italic">Tüm görevler tamamlandı!</span>}
                         </div>
                      </div>
                   </div>
                </div>

                {/* Notes Card */}
                <div 
                  onClick={() => onNavigate('notes')}
                  className="group relative overflow-hidden bg-white/40 dark:bg-zinc-900/40 border border-white/20 dark:border-white/5 rounded-3xl p-6 cursor-pointer transition-all hover:bg-white/60 dark:hover:bg-zinc-900/60 hover:scale-[1.01] hover:shadow-xl"
                >
                   <div className="flex flex-col h-full justify-between gap-6">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400">
                               <FileText className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-zinc-700 dark:text-zinc-200">Notlar</span>
                         </div>
                         <ArrowRight className="w-5 h-5 text-zinc-400 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all" />
                      </div>

                      <div>
                         <div className="flex items-baseline gap-2">
                           <span className="text-4xl font-bold text-zinc-900 dark:text-white">{notes.length}</span>
                           <span className="text-lg text-zinc-500">kayıt</span>
                         </div>
                         <div className="mt-4 space-y-2">
                            {notes.slice(0, 2).map(note => (
                              <div key={note.id} className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 truncate">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                <span className="truncate">{note.title || "Adsız Not"}</span>
                              </div>
                            ))}
                             {notes.length === 0 && <span className="text-sm text-zinc-400 italic">Henüz not eklenmedi.</span>}
                         </div>
                      </div>
                   </div>
                </div>

              </div>
           </div>
        </div>
      </div>
    </div>
    </div>
  );
};