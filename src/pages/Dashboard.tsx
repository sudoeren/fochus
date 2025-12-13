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
  ArrowRight // Added ArrowRight
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
  const [focusInput, setFocusInput] = useState(() => localStorage.getItem('dailyFocus') || '');
  const [isFocusSet, setIsFocusSet] = useState(() => !!localStorage.getItem('dailyFocus'));

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleFocusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (focusInput.trim()) {
      setIsFocusSet(true);
      localStorage.setItem('dailyFocus', focusInput);
    }
  };

  const clearFocus = () => {
    setIsFocusSet(false);
    setFocusInput('');
    localStorage.removeItem('dailyFocus');
  };

  const pendingTasks = tasks.filter(t => !t.isCompleted && !t.isDeleted);
  const getGreeting = () => {
    const h = currentTime.getHours();
    if (h < 5) return "İyi Geceler";
    if (h < 12) return "Günaydın";
    if (h < 18) return "Tünaydın";
    return "İyi Akşamlar";
  };

  return (
    <div className="h-full relative overflow-hidden bg-white dark:bg-black transition-colors duration-500">
      {/* Abstract Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] dark:bg-indigo-500/5" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] dark:bg-purple-500/5" />
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 max-w-4xl mx-auto text-center">
        
        {/* Clock Area */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-[6rem] md:text-[8rem] font-bold text-zinc-900 dark:text-white leading-none tracking-tighter tabular-nums select-none">
            {currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
          </h1>
          <h2 className="text-xl md:text-2xl text-zinc-500 dark:text-zinc-400 mt-2 font-medium">
            {getGreeting()}, Metehan.
          </h2>
        </div>

        {/* Main Focus Area */}
        <div className="w-full max-w-lg mb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
          {!isFocusSet ? (
            <form onSubmit={handleFocusSubmit} className="space-y-4">
              <label className="text-lg md:text-xl text-zinc-600 dark:text-zinc-300 font-medium">
                Bugün ana odağın nedir?
              </label>
              <input
                type="text"
                value={focusInput}
                onChange={(e) => setFocusInput(e.target.value)}
                className="w-full bg-transparent border-b-2 border-zinc-200 dark:border-zinc-800 text-center text-2xl md:text-3xl text-zinc-900 dark:text-white py-2 focus:outline-none focus:border-zinc-900 dark:focus:border-white transition-colors placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                autoFocus
              />
            </form>
          ) : (
            <div className="group">
              <h3 className="text-sm uppercase tracking-widest text-zinc-400 mb-4 font-bold">BUGÜNÜN ODAĞI</h3>
              <div className="flex items-center justify-center gap-4">
                <span className="text-2xl md:text-4xl font-bold text-zinc-900 dark:text-white border-b-2 border-transparent group-hover:border-zinc-200 dark:group-hover:border-zinc-800 transition-all pb-1">
                  {focusInput}
                </span>
                <button 
                  onClick={clearFocus}
                  className="opacity-0 group-hover:opacity-100 p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Widgets (Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
          
          {/* 1. Pomodoro Card */}
          <div className="group relative overflow-hidden bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all text-left">
             <div className="flex items-center justify-between mb-4">
               <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                 <Clock className="w-5 h-5" />
               </div>
               <span className={cn("text-2xl font-mono font-bold text-zinc-900 dark:text-white", isActive && "text-indigo-600 dark:text-indigo-400")}>
                 {formatTime(timeLeft)}
               </span>
             </div>
             <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 h-5">
               {isActive ? 'Odaklanma modu aktif.' : 'Hazırsan başlayalım.'}
             </p>
             <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
               <button 
                 onClick={toggleTimer}
                 className="flex-1 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-bold"
               >
                 {isActive ? <Pause className="w-4 h-4 mx-auto" /> : <Play className="w-4 h-4 mx-auto" />}
               </button>
               <button 
                 onClick={resetTimer}
                 className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700"
               >
                 <RotateCcw className="w-4 h-4" />
               </button>
             </div>
          </div>

          {/* 2. Tasks Summary */}
          <div 
            onClick={() => onNavigate('tasks')}
            className="group cursor-pointer bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all text-left flex flex-col"
          >
             <div className="flex items-center justify-between mb-2">
               <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
                 <CheckSquare className="w-5 h-5" />
               </div>
               <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                 {pendingTasks.length}
               </span>
             </div>
             <h4 className="font-semibold text-zinc-900 dark:text-white mb-1">Görevler</h4>
             <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 flex-1">
               {pendingTasks.length > 0 
                 ? `${pendingTasks[0].title} ve diğerleri...` 
                 : 'Her şey tamamlandı! 🎉'}
             </p>
             <div className="mt-4 flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
               Görüntüle <ArrowRight className="w-4 h-4 ml-1" />
             </div>
          </div>

          {/* 3. Notes Summary */}
          <div 
            onClick={() => onNavigate('notes')}
            className="group cursor-pointer bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all text-left flex flex-col"
          >
             <div className="flex items-center justify-between mb-2">
               <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-lg text-amber-600 dark:text-amber-400">
                 <FileText className="w-5 h-5" />
               </div>
               <span className="text-2xl font-bold text-zinc-900 dark:text-white">
                 {notes.length}
               </span>
             </div>
             <h4 className="font-semibold text-zinc-900 dark:text-white mb-1">Notlar</h4>
             <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 flex-1">
               {notes.length > 0 ? 'Fikirlerin burada güvende.' : 'Yeni bir not al.'}
             </p>
             <div className="mt-4 flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
               Görüntüle <ArrowRight className="w-4 h-4 ml-1" />
             </div>
          </div>

        </div>

      </div>
      
      {/* Bottom Quote / Inspiration Area (Optional) */}
      <div className="absolute bottom-6 left-0 right-0 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
        <p className="text-sm text-zinc-400 italic">
          "En iyi hazırlık, bugünü en iyi şekilde yapmaktır."
        </p>
      </div>

    </div>
  );
};