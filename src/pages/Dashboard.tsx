import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw,
  CheckSquare,
  FileText,
  Clock,
  MoreHorizontal,
  ChevronRight,
  Focus,
  Sun,
  Cloud,
  Moon,
  Zap,
  Target
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
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  onNavigate, 
  onOpenNoteModal, 
  onOpenTaskModal,
  onEditTask 
}) => {
  const { tasks, toggleTask } = useTasks();
  const { notes } = useNotes();
  const { timeLeft, isActive, toggleTimer, resetTimer, formatTime } = usePomodoro();
  
  // Time & Greeting State
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  
  // Focus State (Persisted)
  const [focusInput, setFocusInput] = useState(() => localStorage.getItem('dailyFocus') || '');
  const [isFocusSet, setIsFocusSet] = useState(() => !!localStorage.getItem('dailyFocus'));
  const [focusCompleted, setFocusCompleted] = useState(() => localStorage.getItem('dailyFocusCompleted') === 'true');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      const h = now.getHours();
      if (h < 5) setGreeting("İyi Geceler");
      else if (h < 12) setGreeting("Günaydın");
      else if (h < 18) setGreeting("Tünaydın");
      else setGreeting("İyi Akşamlar");
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleFocusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (focusInput.trim()) {
      setIsFocusSet(true);
      localStorage.setItem('dailyFocus', focusInput);
    }
  };

  const toggleFocusCompletion = () => {
    const newState = !focusCompleted;
    setFocusCompleted(newState);
    localStorage.setItem('dailyFocusCompleted', String(newState));
  };

  const clearFocus = () => {
    setIsFocusSet(false);
    setFocusInput('');
    setFocusCompleted(false);
    localStorage.removeItem('dailyFocus');
    localStorage.removeItem('dailyFocusCompleted');
  };

  const pendingTasks = tasks.filter(t => !t.isCompleted && !t.isDeleted);

  return (
    <div className="h-full relative overflow-hidden bg-white dark:bg-black transition-colors duration-500">
      
      {/* 1. Background Atmosphere (Aurora Effect) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-400/10 rounded-full blur-[150px] dark:bg-indigo-600/10 animate-pulse duration-[10000ms]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-400/10 rounded-full blur-[150px] dark:bg-purple-600/10 animate-pulse duration-[15000ms]" />
        <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-amber-200/5 rounded-full blur-[100px] dark:bg-amber-500/5" />
      </div>

      {/* 2. Main Content - Centered Focus */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 max-w-5xl mx-auto text-center">
        
        {/* Clock & Greeting */}
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="text-[7rem] md:text-[9rem] font-bold text-zinc-900 dark:text-white leading-none tracking-tighter tabular-nums select-none drop-shadow-2xl dark:drop-shadow-none">
            {currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-2xl md:text-3xl text-zinc-500 dark:text-zinc-400 mt-2 font-medium tracking-tight">
            {greeting}, Metehan.
          </div>
        </div>

        {/* The Main Focus Input */}
        <div className="w-full max-w-2xl mb-20 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
          {!isFocusSet ? (
            <div className="group transition-all">
              <label className="block text-xl md:text-2xl text-zinc-400 dark:text-zinc-500 font-medium mb-4">
                Bugün ana odağın nedir?
              </label>
              <form onSubmit={handleFocusSubmit} className="relative">
                <input
                  type="text"
                  value={focusInput}
                  onChange={(e) => setFocusInput(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 text-center text-3xl md:text-4xl text-zinc-900 dark:text-white py-3 focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-all placeholder:text-zinc-200 dark:placeholder:text-zinc-800"
                  autoFocus
                />
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 group">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">GÜNLÜK ODAK</h3>
              <div className="flex items-center gap-4">
                <button 
                  onClick={toggleFocusCompletion}
                  className={cn(
                    "w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all",
                    focusCompleted 
                      ? "bg-emerald-500 border-emerald-500 text-white" 
                      : "border-zinc-300 dark:border-zinc-600 text-transparent hover:border-emerald-500"
                  )}
                >
                  <CheckSquare className="w-5 h-5 fill-current" />
                </button>
                <span className={cn(
                  "text-3xl md:text-5xl font-bold text-zinc-900 dark:text-white transition-all",
                  focusCompleted && "line-through text-zinc-400 dark:text-zinc-600"
                )}>
                  {focusInput}
                </span>
                <button 
                  onClick={clearFocus}
                  className="opacity-0 group-hover:opacity-100 p-2 text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-all transform translate-x-2 group-hover:translate-x-0"
                  title="Odağı Temizle"
                >
                  <MoreHorizontal className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Minimalist Widgets Row */}
        <div className="flex flex-wrap justify-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
          
          {/* Widget 1: Pomodoro */}
          <div className="group relative bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800 rounded-2xl p-5 w-64 text-left transition-all hover:scale-105 hover:bg-white dark:hover:bg-zinc-900 hover:shadow-xl hover:shadow-indigo-500/10">
             <div className="flex items-center gap-3 mb-2 text-zinc-500 dark:text-zinc-400">
               <Clock className="w-5 h-5" />
               <span className="text-xs font-bold uppercase tracking-wider">Pomodoro</span>
             </div>
             <div className="flex items-end justify-between">
               <span className={cn("text-3xl font-mono font-bold text-zinc-900 dark:text-white", isActive && "text-indigo-600 dark:text-indigo-400")}>
                 {formatTime(timeLeft)}
               </span>
               <button 
                 onClick={(e) => { e.stopPropagation(); toggleTimer(); }}
                 className="w-10 h-10 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center hover:opacity-90 transition-opacity shadow-lg"
               >
                 {isActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
               </button>
             </div>
          </div>

          {/* Widget 2: Tasks Status */}
          <div 
            onClick={() => onNavigate('tasks')}
            className="group cursor-pointer bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800 rounded-2xl p-5 w-64 text-left transition-all hover:scale-105 hover:bg-white dark:hover:bg-zinc-900 hover:shadow-xl hover:shadow-emerald-500/10"
          >
             <div className="flex items-center gap-3 mb-2 text-zinc-500 dark:text-zinc-400">
               <Target className="w-5 h-5" />
               <span className="text-xs font-bold uppercase tracking-wider">Görevler</span>
             </div>
             <div className="flex items-end justify-between">
               <span className="text-3xl font-bold text-zinc-900 dark:text-white">
                 {pendingTasks.length}
               </span>
               <span className="text-xs text-zinc-400 group-hover:text-emerald-500 transition-colors flex items-center gap-1">
                 Görüntüle <ChevronRight className="w-3 h-3" />
               </span>
             </div>
          </div>

          {/* Widget 3: Quick Quote (Dynamic feel) */}
          <div className="hidden md:block bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800 rounded-2xl p-5 w-64 text-left transition-all hover:scale-105 hover:bg-white dark:hover:bg-zinc-900 hover:shadow-xl hover:shadow-amber-500/10">
             <div className="flex items-center gap-3 mb-2 text-zinc-500 dark:text-zinc-400">
               <Zap className="w-5 h-5 text-amber-500" />
               <span className="text-xs font-bold uppercase tracking-wider">Motivasyon</span>
             </div>
             <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 italic leading-relaxed">
               "Başlamak için mükemmel olmak zorunda değilsin."
             </p>
          </div>

        </div>

      </div>
    </div>
  );
};