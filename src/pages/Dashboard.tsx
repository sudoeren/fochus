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
  CheckCircle2,
  Circle,
  Plus
} from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { useNotes } from '../hooks/useNotes';
import { usePomodoro } from '../hooks/usePomodoro';
import { authAPI, pomodoroAPI } from '../services/api';
import { deserializeApiDates } from '../utils/apiTransforms';
import { useTranslation } from 'react-i18next';

interface DashboardProps {
  onNavigate: (view: string) => void;
  onOpenNoteModal: () => void;
  onOpenTaskModal: () => void;
  onEditTask?: (task: any) => void;
  onOpenSpotlight?: () => void;
  onOpenPomodoro?: () => void;
  bgImage: string;
  onBgChange: (newBg: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  onNavigate, 
  onOpenNoteModal, 
  onOpenTaskModal,
  onEditTask,
  onOpenSpotlight,
  onOpenPomodoro,
  bgImage,
  onBgChange
}) => {
  const { t } = useTranslation();
  const { tasks, toggleTask } = useTasks();
  const { notes } = useNotes();
  const { timeLeft, isActive, toggleTimer, formatTime } = usePomodoro();

  const [displayName, setDisplayName] = useState<string>('');

  const [weeklyFocusSeconds, setWeeklyFocusSeconds] = useState<number>(0);
  
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const getGreeting = () => {
    const h = currentTime.getHours();
    if (h < 6) return t('dashboard.night_shift');
    if (h < 12) return t('dashboard.good_morning');
    if (h < 18) return t('dashboard.good_afternoon');
    return t('dashboard.good_evening');
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadMe = async () => {
      try {
        const meRaw = await authAPI.me();
        const me = deserializeApiDates(meRaw) as any;
        const resolved = ((me?.name ?? '').toString().trim() || (me?.username ?? '').toString().trim());
        if (!cancelled) setDisplayName(resolved);
      } catch {
        if (!cancelled) setDisplayName('');
      }
    };

    loadMe();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadStats = async () => {
      try {
        const stats = await pomodoroAPI.getStats('week');
        const seconds = Number(stats?.work?.duration ?? 0);
        if (!cancelled) setWeeklyFocusSeconds(Number.isFinite(seconds) ? seconds : 0);
      } catch {
        if (!cancelled) setWeeklyFocusSeconds(0);
      }
    };

    loadStats();
    return () => {
      cancelled = true;
    };
  }, []);

  const formatFocusDuration = (seconds: number) => {
    const totalMinutes = Math.floor(seconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours <= 0) return `${minutes}d`;
    if (minutes <= 0) return `${hours}s`;
    return `${hours}s ${minutes}d`;
  };

  const pendingTasks = tasks.filter(t => !t.isCompleted && !t.isDeleted).slice(0, 5);
  const recentNotes = notes.filter(n => !n.isDeleted).slice(0, 5);
  
  const isCustomBg = bgImage.startsWith('data:') || bgImage.startsWith('http') || bgImage.startsWith('blob:');

  return (
    <div className="h-full w-full relative">
      {/* BACKGROUND IMAGE - Controlled by bgImage prop */}
      <div className="fixed inset-0 z-[-1]">
        {isCustomBg ? (
          <img 
            src={bgImage} 
            alt="Custom Background" 
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 opacity-100" 
          />
        ) : (
          <>
            <img 
              src="/light.png" 
              alt="Background" 
              className={cn("absolute inset-0 w-full h-full object-cover transition-opacity duration-500", bgImage === 'light' ? 'opacity-100' : 'opacity-0')} 
            />
            <img 
              src="/dark.png" 
              alt="Background" 
              className={cn("absolute inset-0 w-full h-full object-cover transition-opacity duration-500", bgImage === 'dark' ? 'opacity-100' : 'opacity-0')} 
            />
          </>
        )}
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-white/30 dark:bg-black/40 backdrop-blur-[2px]" />
      </div>

      <div className="p-8 lg:p-12 pb-24 overflow-y-auto custom-scrollbar h-full flex flex-col justify-center"> {/* Centered vertically */}
        <div className="max-w-[1000px] mx-auto flex flex-col gap-16 w-full"> {/* Reduced max-width */}
        
        {/* Header Section - Clock & Greeting */}
        <div className="flex flex-col items-start gap-4 animate-in slide-in-from-left duration-700 mt-10"> {/* Added margin-top */}
            <h1 className="text-9xl lg:text-[10rem] font-bold tracking-tighter text-zinc-900 dark:text-white drop-shadow-sm font-mono leading-none">
              {currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
            </h1>
            <div className="flex items-center ml-2">
              <span className="text-3xl font-light text-zinc-800 dark:text-zinc-100 uppercase tracking-[0.2em]">
                {displayName ? `${getGreeting()}, ${displayName}` : getGreeting()}
              </span>
            </div>
        </div>

        {/* Main Unified Glass Frame (Bento Grid Container) */}
        <div className="w-full bg-white/40 dark:bg-black/40 backdrop-blur-3xl border border-white/30 dark:border-white/10 rounded-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-700 delay-200">
           
           <div className="flex flex-col gap-8">
              
              {/* 1. Search Section - Integrated into the top */}
              <div className="w-full">
                <button 
                  onClick={onOpenSpotlight}
                  className="w-full flex items-center justify-between p-5 bg-white/50 dark:bg-zinc-900/50 hover:bg-white/70 dark:hover:bg-zinc-900/70 border border-white/40 dark:border-white/10 rounded-3xl transition-all duration-300 group cursor-text text-left shadow-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-zinc-900 dark:bg-white rounded-2xl text-white dark:text-zinc-900 shadow-lg group-hover:scale-110 transition-transform">
                       <SearchIcon className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xl font-semibold text-zinc-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {t('dashboard.search_placeholder')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pr-4">
                    <kbd className="hidden md:flex h-8 items-center gap-1 rounded border border-zinc-300 dark:border-zinc-700 bg-white/50 dark:bg-zinc-800 px-2 font-mono text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      /
                    </kbd>
                  </div>
                </button>
              </div>

              {/* 2. Widgets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Pomodoro Card */}
                <div 
                  onClick={onOpenPomodoro}
                  className="group relative overflow-hidden bg-gradient-to-br from-indigo-500/20 to-purple-500/20 dark:from-indigo-500/10 dark:to-purple-500/10 border border-white/30 dark:border-white/10 rounded-3xl p-6 transition-all hover:scale-[1.02] hover:shadow-xl flex flex-col justify-between cursor-pointer"
                >
                   <div className="absolute top-0 right-0 p-6 opacity-30">
                      <Clock className="w-24 h-24 text-indigo-600 dark:text-indigo-400 -mr-6 -mt-6" />
                   </div>
                   
                   <div className="relative z-10 flex flex-col gap-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl text-indigo-700 dark:text-indigo-300">
                           <Zap className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-zinc-800 dark:text-zinc-100">{t('dashboard.focus_time')}</span>
                      </div>

                      <div className="flex flex-col">
                         <span className={cn("text-6xl font-mono font-bold tracking-tighter tabular-nums", isActive ? "text-indigo-700 dark:text-indigo-300 animate-pulse" : "text-zinc-900 dark:text-white")}>
                           {formatTime(timeLeft)}
                         </span>
                         <span className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 font-medium">
                           {isActive
                             ? t('dashboard.time_running')
                             : weeklyFocusSeconds > 0
                               ? `${t('dashboard.this_week')}: ${formatFocusDuration(weeklyFocusSeconds)}`
                               : t('dashboard.ready')}
                         </span>
                      </div>
                   </div>

                   <button 
                        onClick={(e) => { e.stopPropagation(); toggleTimer(); }}
                        className="w-full mt-6 py-3.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg"
                      >
                        {isActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                        {isActive ? t('sidebar.pause') : t('sidebar.start')}
                   </button>
                </div>

                {/* Tasks Card (Functional) */}
                <div className="group relative overflow-hidden bg-white/50 dark:bg-zinc-900/50 border border-white/30 dark:border-white/10 rounded-3xl p-6 transition-all hover:bg-white/70 dark:hover:bg-zinc-900/70 hover:scale-[1.02] hover:shadow-xl flex flex-col">
                   <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                         <div className="p-2.5 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl text-emerald-700 dark:text-emerald-300">
                            <CheckSquare className="w-5 h-5" />
                         </div>
                         <span className="font-bold text-zinc-800 dark:text-zinc-100">{t('dashboard.tasks')}</span>
                      </div>
                      <button onClick={onOpenTaskModal} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
                        <Plus className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                      </button>
                   </div>

                   <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                      {pendingTasks.length > 0 ? (
                        <ul className="space-y-3">
                          {pendingTasks.map(task => (
                            <li key={task.id} className="flex items-start gap-3 group/item">
                              <button 
                                onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }}
                                className="mt-0.5 text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                              >
                                <Circle className="w-5 h-5" />
                              </button>
                              <span 
                                className="text-sm font-medium text-zinc-700 dark:text-zinc-300 line-clamp-2 leading-relaxed cursor-pointer hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                                onClick={() => onEditTask && onEditTask(task)}
                              >
                                {task.title}
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-400 gap-2 opacity-70">
                          <CheckCircle2 className="w-8 h-8" />
                          <span className="text-sm">{t('dashboard.no_tasks')}</span>
                        </div>
                      )}
                   </div>
                   
                   <div className="mt-4 pt-4 border-t border-zinc-200/50 dark:border-white/5 flex justify-between items-center text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      <span>{tasks.filter(t => !t.isCompleted && !t.isDeleted).length} {t('dashboard.pending')}</span>
                      <button onClick={() => onNavigate('tasks')} className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-white transition-colors">
                        {t('dashboard.all')} <ArrowRight className="w-3 h-3" />
                      </button>
                   </div>
                </div>

                {/* Notes Card (Functional) */}
                <div className="group relative overflow-hidden bg-white/50 dark:bg-zinc-900/50 border border-white/30 dark:border-white/10 rounded-3xl p-6 transition-all hover:bg-white/70 dark:hover:bg-zinc-900/70 hover:scale-[1.02] hover:shadow-xl flex flex-col">
                   <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                         <div className="p-2.5 bg-amber-100 dark:bg-amber-500/20 rounded-xl text-amber-700 dark:text-amber-300">
                            <FileText className="w-5 h-5" />
                         </div>
                         <span className="font-bold text-zinc-800 dark:text-zinc-100">{t('dashboard.notes')}</span>
                      </div>
                      <button onClick={onOpenNoteModal} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
                        <Plus className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                      </button>
                   </div>

                   <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
                      {recentNotes.length > 0 ? (
                        <ul className="space-y-3">
                          {recentNotes.map(note => (
                            <li 
                              key={note.id} 
                              className="group/item p-3 bg-white/50 dark:bg-black/20 rounded-xl border border-white/50 dark:border-white/5 hover:border-amber-200 dark:hover:border-amber-500/30 transition-all cursor-pointer"
                              onClick={() => onNavigate('notes')} // Ideally open specific note
                            >
                              <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate mb-1 group-hover/item:text-amber-700 dark:group-hover/item:text-amber-400 transition-colors">
                                {note.title || t('dashboard.untitled_note')}
                              </h4>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                                {note.content.replace(/<[^>]*>?/gm, '') || t('dashboard.no_content')}
                              </p>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-400 gap-2 opacity-70">
                          <FileText className="w-8 h-8" />
                          <span className="text-sm">{t('dashboard.no_notes')}</span>
                        </div>
                      )}
                   </div>

                   <div className="mt-4 pt-4 border-t border-zinc-200/50 dark:border-white/5 flex justify-between items-center text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      <span>{notes.length} {t('dashboard.records')}</span>
                      <button onClick={() => onNavigate('notes')} className="flex items-center gap-1 hover:text-zinc-900 dark:hover:text-white transition-colors">
                        {t('dashboard.all')} <ArrowRight className="w-3 h-3" />
                      </button>
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
