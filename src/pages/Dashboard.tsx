import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw,
  CheckSquare,
  FileText,
  Clock,
  ArrowRight,
  Search as SearchIcon, // Renamed to avoid conflict with `Search` component
  Target
} from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { useNotes } from '../hooks/useNotes';
import { usePomodoro } from '../hooks/usePomodoro';
import { useTheme } from '../components/ThemeProvider'; // Assuming useTheme is in hooks/useTheme now
import { cn } from '../lib/utils';

interface DashboardProps {
  onNavigate: (view: string) => void;
  onOpenNoteModal: () => void;
  onOpenTaskModal: () => void;
  onEditTask: (task: any) => void;
  onOpenSpotlight: () => void; // Added for search bar
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  onNavigate, 
  onOpenNoteModal, 
  onOpenTaskModal,
  onEditTask,
  onOpenSpotlight 
}) => {
  const { tasks, toggleTask } = useTasks();
  const { notes } = useNotes();
  const { timeLeft, isActive, toggleTimer, resetTimer, formatTime } = usePomodoro();
  const { theme } = useTheme(); // To determine which background to show
  
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
    <div className="h-full relative overflow-hidden transition-colors duration-500">
      
      {/* BACKGROUND IMAGE - Theme Aware, covers entire screen */}
      <div className="absolute inset-0 z-0">
        <img 
          src={theme === 'dark' ? '/dark.png' : '/light.png'} 
          alt="Background" 
          className="w-full h-full object-cover" // object-cover ensures it covers, no cropping issues
        />
        {/* Overlay Gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/40 to-white/80 dark:from-black/80 dark:via-black/40 dark:to-black/80" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 max-w-5xl mx-auto text-center">
        
        {/* Clock & Greeting */}
        <div className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="text-[7rem] md:text-[10rem] font-bold text-zinc-900 dark:text-white leading-none tracking-tighter tabular-nums select-none drop-shadow-sm">
            {currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-xl md:text-3xl text-zinc-600 dark:text-zinc-300 mt-4 font-medium tracking-wide uppercase opacity-80">
            {getGreeting()}
          </div>
        </div>

        {/* Spotlight Search Bar (Replaces "What's your focus") */}
        <div className="w-full max-w-2xl mb-24 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200 min-h-[120px] flex items-center justify-center">
          <button 
            onClick={onOpenSpotlight}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white/50 dark:bg-black/50 backdrop-blur-md rounded-full border border-zinc-200 dark:border-zinc-800 shadow-lg text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group"
          >
            <SearchIcon className="w-6 h-6 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
            <span className="text-xl font-medium">Hızlı Ara veya Komut Çalıştır...</span>
            <kbd className="ml-auto text-lg font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">/</kbd>
          </button>
        </div>

        {/* Minimalist Widgets Row */}
        <div className="flex flex-wrap justify-center gap-6 w-full animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
          
          {/* 1. Pomodoro Widget */}
          <div className="group relative bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800 rounded-3xl p-5 w-72 text-left transition-all hover:scale-[1.02] hover:bg-white dark:hover:bg-zinc-900 hover:shadow-2xl hover:shadow-indigo-500/10">
             <div className="flex items-center gap-3 mb-2 text-zinc-500 dark:text-zinc-400">
               <Clock className="w-5 h-5" />
               <span className="text-xs font-bold uppercase tracking-wider">Odak Süresi</span>
             </div>
             <div className="flex items-end justify-between">
               <span className={cn("text-4xl font-mono font-bold text-zinc-900 dark:text-white tracking-tight", isActive && "text-indigo-600 dark:text-indigo-400")}>
                 {formatTime(timeLeft)}
               </span>
               <button 
                 onClick={(e) => { e.stopPropagation(); toggleTimer(); }}
                 className="w-12 h-12 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
               >
                 {isActive ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
               </button>
             </div>
          </div>

          {/* 2. Tasks Widget */}
          <div 
            onClick={() => onNavigate('tasks')}
            className="group cursor-pointer bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800 rounded-3xl p-6 w-72 text-left transition-all hover:scale-[1.02] hover:bg-white dark:hover:bg-zinc-900 hover:shadow-2xl hover:shadow-emerald-500/10"
          >
             <div className="flex items-center gap-3 mb-4 text-zinc-500 dark:text-zinc-400">
               <CheckSquare className="w-5 h-5" />
               <span className="text-xs font-bold uppercase tracking-wider">Görevler</span>
             </div>
             <div className="flex items-end justify-between">
               <div>
                 <span className="text-4xl font-bold text-zinc-900 dark:text-white">
                   {pendingTasks.length}
                 </span>
                 <span className="text-sm text-zinc-500 dark:text-zinc-400 ml-2">bekleyen</span>
               </div>
               <span className="w-12 h-12 rounded-full border-2 border-zinc-200 dark:border-zinc-800 flex items-center justify-center group-hover:border-zinc-900 dark:group-hover:border-white transition-colors">
                 <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
               </span>
             </div>
          </div>

          {/* 3. Notes Widget */}
          <div 
            onClick={() => onNavigate('notes')}
            className="group cursor-pointer bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800 rounded-3xl p-6 w-72 text-left transition-all hover:scale-[1.02] hover:bg-white dark:hover:bg-zinc-900 hover:shadow-2xl hover:shadow-amber-500/10"
          >
             <div className="flex items-center gap-3 mb-4 text-zinc-500 dark:text-zinc-400">
               <FileText className="w-5 h-5" />
               <span className="text-xs font-bold uppercase tracking-wider">Notlar</span>
             </div>
             <div className="flex items-end justify-between">
               <div>
                 <span className="text-4xl font-bold text-zinc-900 dark:text-white">
                   {notes.length}
                 </span>
                 <span className="text-sm text-zinc-500 dark:text-zinc-400 ml-2">kayıtlı</span>
               </div>
               <span className="w-12 h-12 rounded-full border-2 border-zinc-200 dark:border-zinc-800 flex items-center justify-center group-hover:border-zinc-900 dark:group-hover:border-white transition-colors">
                 <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
               </span>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
};