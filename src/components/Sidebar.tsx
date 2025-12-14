import React, { useState } from 'react';
import { 
  Home, 
  FileText, 
  CheckSquare, 
  Calendar, 
  Settings, 
  Trash2, 
  Search,
  Timer,
  BarChart,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Briefcase,
  ChevronRight,
  CheckCircle2,
  Circle,
  Zap
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { usePomodoro } from '../hooks/usePomodoro';
import { useTasks } from '../hooks/useTasks';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onOpenSpotlight: () => void;
  onOpenNoteModal: () => void;
  onOpenTaskModal: () => void;
  onOpenPomodoro: () => void;
}

const mainNav = [
  { id: 'dashboard', label: 'Genel Bakış', icon: Home },
  { id: 'tasks', label: 'Görevler', icon: CheckSquare },
  { id: 'notes', label: 'Notlar', icon: FileText },
  { id: 'timer', label: 'Fochus Timer', icon: Timer },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onViewChange,
  onOpenSpotlight,
  onOpenNoteModal,
  onOpenTaskModal,
  onOpenPomodoro
}) => {
  const { theme } = useTheme();
  const { isActive, timeLeft, formatTime, toggleTimer, resetTimer, progress } = usePomodoro();
  const { tasks, toggleTask } = useTasks();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Filter pending tasks for the widget (Show top 4)
  const currentTasks = tasks.filter(t => !t.isCompleted && !t.isDeleted).slice(0, 4);

  return (
    <>
      {/* Mobile Toggle Trigger */}
      <button 
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-zinc-900 rounded-xl shadow-md border border-zinc-200 dark:border-zinc-800"
      >
        <div className="w-5 h-0.5 bg-zinc-800 dark:bg-zinc-200 mb-1" />
        <div className="w-5 h-0.5 bg-zinc-800 dark:bg-zinc-200 mb-1" />
        <div className="w-3 h-0.5 bg-zinc-800 dark:bg-zinc-200" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container - Always Open, Floating Style */}
      <aside 
        className={cn(
          "fixed top-4 bottom-4 left-4 z-40 w-[300px] flex flex-col transition-transform duration-300 ease-spring",
          // Mobile behavior: Slide in/out
          "lg:translate-x-0", 
          mobileOpen ? "translate-x-0" : "-translate-x-[calc(100%+16px)] lg:translate-x-0"
        )}
      >
        <div className={cn(
          "h-full flex flex-col bg-white/70 dark:bg-zinc-950/70 backdrop-blur-2xl rounded-[24px] border border-white/20 dark:border-zinc-800/50 shadow-2xl shadow-zinc-200/20 dark:shadow-black/50 overflow-hidden relative",
        )}>
          
          {/* 1. Header (Custom Logo) */}
          <div className="h-24 flex items-center px-6 shrink-0">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.svg" 
                alt="Fokus Logo" 
                className="h-10 w-10 object-contain" 
              />
              <span className="font-bold text-xl text-zinc-900 dark:text-white tracking-tight">FOCHUS</span>
            </div>
          </div>

          {/* 2. Quick Actions */}
          <div className="px-5 mb-1 space-y-4">
            <button
              onClick={onOpenSpotlight}
              className="w-full flex items-center gap-3 px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 transition-all group text-zinc-500 dark:text-zinc-400"
              title="Ara ( / )"
            >
              <Search className="w-4 h-4 shrink-0 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
              <span className="text-sm font-medium">Hızlı Ara...</span>
              <kbd className="ml-auto text-[10px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5 opacity-50">/</kbd>
            </button>

            <div className="grid grid-cols-2 gap-2">
               <button
                  onClick={onOpenTaskModal}
                  className="col-span-1 flex items-center justify-center gap-2 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl hover:opacity-90 transition-all shadow-md shadow-zinc-900/20 active:scale-95 group"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-xs font-bold">Yeni Görev</span>
                </button>
                
                <button
                  onClick={onOpenNoteModal}
                  className="col-span-1 flex items-center justify-center gap-2 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl hover:opacity-90 transition-all shadow-md shadow-zinc-900/20 active:scale-95 group"
                >
                   <FileText className="w-4 h-4" />
                  <span className="text-xs font-bold">Yeni Not</span>
                </button>
            </div>
          </div>

          {/* 3. Navigation Menu */}
          <nav className="flex-1 overflow-y-auto px-5 py-2 space-y-1 custom-scrollbar">
            {mainNav.map(item => {
              const Icon = item.icon;
              const active = activeView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => { 
                    if (item.id === 'timer') {
                      onOpenPomodoro();
                    } else {
                      onViewChange(item.id); 
                    }
                    setMobileOpen(false); 
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                    active 
                      ? "text-zinc-900 dark:text-white font-bold drop-shadow-md"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                  )}
                >
                  <Icon className={cn("w-5 h-5 shrink-0 transition-all", active ? "text-zinc-900 dark:text-white drop-shadow-md" : "text-zinc-400 group-hover:text-zinc-600")} />
                  <span>{item.label}</span>

                </button>
              );
            })}

            <div className="my-4 border-t border-zinc-100 dark:border-zinc-800 mx-2" />

            {/* Settings & Trash */}
            <button
              onClick={() => { onViewChange('settings'); setMobileOpen(false); }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                activeView === 'settings' 
                  ? "text-zinc-900 dark:text-white font-bold drop-shadow-md" 
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
              )}
            >
              <Settings className={cn("w-5 h-5 shrink-0 transition-all", activeView === 'settings' ? "text-zinc-900 dark:text-white drop-shadow-md" : "text-zinc-400 group-hover:text-zinc-600")} />
              <span>Ayarlar</span>

            </button>
            <button
              onClick={() => { onViewChange('trash'); setMobileOpen(false); }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                activeView === 'trash' 
                  ? "text-zinc-900 dark:text-white font-bold drop-shadow-md" 
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
              )}
            >
              <Trash2 className={cn("w-5 h-5 shrink-0 transition-all", activeView === 'trash' ? "text-zinc-900 dark:text-white drop-shadow-md" : "text-zinc-400 group-hover:text-zinc-600")} />
              <span>Çöp Kutusu</span>

            </button>
          </nav>

          {/* 4. Functional Widgets Area */}
          <div className="flex flex-col gap-4 px-4 pb-6 mt-2">
            
            {/* Functional Tasks Widget */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" /> Sırada
                </span>
                <button onClick={() => onViewChange('tasks')} className="p-1 -mr-1 rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {currentTasks.length > 0 ? (
                <ul className="space-y-2">
                  {currentTasks.map(task => (
                    <li key={task.id} className="flex items-start gap-3 group">
                      <button 
                        onClick={() => toggleTask(task.id)}
                        className="mt-0.5 text-zinc-300 hover:text-indigo-500 transition-colors"
                      >
                        <Circle className="w-4 h-4" />
                      </button>
                      <span className={cn(
                        "text-xs font-medium text-zinc-700 dark:text-zinc-300 line-clamp-2 leading-relaxed cursor-pointer transition-all hover:text-indigo-600 dark:hover:text-indigo-400",
                        task.isCompleted && "line-through text-zinc-400"
                      )} onClick={() => toggleTask(task.id)}>
                        {task.title}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 text-zinc-400 gap-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700">
                  <CheckCircle2 className="w-5 h-5 opacity-50" />
                  <span className="text-xs font-medium">Her şey tamam!</span>
                </div>
              )}
            </div>

            {/* BIG Pomodoro Widget */}
            <div className="bg-zinc-900 dark:bg-black rounded-2xl p-5 text-white shadow-xl relative overflow-hidden group">
              {/* Subtle Animated Background */}
              <div className="absolute inset-0 bg-indigo-500/10 blur-2xl opacity-30 pointer-events-none group-hover:opacity-50 transition-opacity duration-700" />
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="flex items-center gap-2 mb-3 opacity-80">
                  <Zap className={cn("w-3.5 h-3.5", isActive && "text-yellow-400 fill-yellow-400 animate-pulse")} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">FOCUS TIMER</span>
                </div>
                
                <div className="text-5xl font-mono font-bold tracking-tighter tabular-nums mb-5 text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-400">
                  {formatTime(timeLeft)}
                </div>
                
                <div className="flex gap-2 w-full">
                  <button 
                    onClick={toggleTimer}
                    className="flex-1 h-10 bg-white text-zinc-900 rounded-xl flex items-center justify-center font-bold text-sm hover:bg-zinc-200 transition-all active:scale-95 shadow-none"
                  >
                    {isActive ? <Pause className="w-4 h-4 fill-current mr-1" /> : <Play className="w-4 h-4 fill-current mr-1" />}
                    {isActive ? "Duraklat" : "Başlat"}
                  </button>
                  <button 
                    onClick={resetTimer}
                    className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center hover:bg-zinc-700 transition-colors text-zinc-400 hover:text-white active:scale-95 shadow-none"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress Bar at bottom */}
                <div className="absolute bottom-0 left-0 h-1 w-full">
                   <div 
                     className="h-full bg-indigo-500 transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                     style={{ width: `${progress * 100}%` }}
                   />
                </div>
              </div>
            </div>

          </div>

        </div>
      </aside>
    </>
  );
};