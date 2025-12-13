import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw,
  CheckSquare,
  FileText,
  Clock,
  ArrowRight,
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
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  
  // Focus State
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
    <div className="h-full relative overflow-hidden transition-colors duration-500">
      
      {/* BACKGROUND IMAGE - Theme Aware */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/light.png" 
          alt="Background" 
          className="absolute inset-0 w-full h-full object-cover dark:hidden opacity-80"
        />
        <img 
          src="/dark.png" 
          alt="Background" 
          className="absolute inset-0 w-full h-full object-cover hidden dark:block opacity-60"
        />
        {/* Overlay Gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/50 to-white/80 dark:from-black/80 dark:via-black/50 dark:to-black/80" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 max-w-5xl mx-auto text-center">
        
        {/* Clock & Greeting */}
        <div className="mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="text-[7rem] md:text-[10rem] font-bold text-zinc-900 dark:text-white leading-none tracking-tighter tabular-nums select-none drop-shadow-2xl">
            {currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-2xl md:text-4xl text-zinc-600 dark:text-zinc-300 mt-4 font-medium tracking-tight">
            {greeting}, Metehan.
          </div>
        </div>

        {/* Main Focus Input */}
        <div className="w-full max-w-2xl mb-24 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200 min-h-[120px] flex items-center justify-center">
          {!isFocusSet ? (
            <div className="group transition-all w-full">
              <label className="block text-xl text-zinc-500 dark:text-zinc-400 font-medium mb-4">
                Bugün ana odağın nedir?
              </label>
              <form onSubmit={handleFocusSubmit}>
                <input
                  type="text"
                  value={focusInput}
                  onChange={(e) => setFocusInput(e.target.value)}
                  className="w-full bg-transparent border-b-2 border-zinc-300 dark:border-zinc-700 text-center text-3xl md:text-4xl text-zinc-900 dark:text-white py-3 focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-all placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                  autoFocus
                />
              </form>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 group">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">GÜNLÜK ODAK</h3>
              <div className="flex items-center gap-6">
                <button 
                  onClick={toggleFocusCompletion}
                  className={cn(
                    "w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all hover:scale-110",
                    focusCompleted 
                      ? "bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white text-white dark:text-black" 
                      : "border-zinc-400 dark:border-zinc-600 text-transparent hover:border-zinc-900 dark:hover:border-white"
                  )}
                >
                  <CheckSquare className="w-5 h-5 fill-current" />
                </button>
                <span className={cn(
                  "text-3xl md:text-5xl font-bold text-zinc-900 dark:text-white transition-all decoration-4",
                  focusCompleted && "line-through text-zinc-400 dark:text-zinc-600 decoration-zinc-400 dark:decoration-zinc-600"
                )}>
                  {focusInput}
                </span>
                <button 
                  onClick={clearFocus}
                  className="opacity-0 group-hover:opacity-100 p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all transform translate-x-2 group-hover:translate-x-0"
                  title="Odağı Temizle"
                >
                  <MoreHorizontal className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Widgets Row */}
        <div className="flex flex-wrap justify-center gap-6 w-full animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
          
          {/* 1. Pomodoro Widget */}
          <div className="group relative bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800 rounded-3xl p-6 w-72 text-left transition-all hover:scale-[1.02] hover:bg-white dark:hover:bg-zinc-900 hover:shadow-2xl hover:shadow-zinc-200/50 dark:hover:shadow-black/50">
             <div className="flex items-center gap-3 mb-4 text-zinc-500 dark:text-zinc-400">
               <Clock className="w-5 h-5" />
               <span className="text-xs font-bold uppercase tracking-wider">Pomodoro</span>
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
            className="group cursor-pointer bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800 rounded-3xl p-6 w-72 text-left transition-all hover:scale-[1.02] hover:bg-white dark:hover:bg-zinc-900 hover:shadow-2xl hover:shadow-zinc-200/50 dark:hover:shadow-black/50"
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
            className="group cursor-pointer bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800 rounded-3xl p-6 w-72 text-left transition-all hover:scale-[1.02] hover:bg-white dark:hover:bg-zinc-900 hover:shadow-2xl hover:shadow-zinc-200/50 dark:hover:shadow-black/50"
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