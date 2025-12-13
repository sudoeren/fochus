import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  Home, 
  FileText, 
  CheckSquare, 
  Calendar, 
  Settings, 
  Trash2, 
  Search,
  Sun,
  Moon,
  Monitor,
  Timer,
  BarChart,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Zap,
  MoreHorizontal
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { usePomodoro } from '../hooks/usePomodoro';
import { cn } from '../lib/utils';

// --- Context ---
interface SidebarContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}
const SidebarContext = createContext<SidebarContextType | null>(null);

// --- Props ---
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
  { id: 'weekly', label: 'Takvim', icon: Calendar },
  { id: 'stats', label: 'İstatistik', icon: BarChart },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onViewChange,
  onOpenSpotlight,
  onOpenNoteModal,
  onOpenTaskModal,
  onOpenPomodoro
}) => {
  const [open, setOpen] = useState(true);
  const { theme, setTheme } = useTheme();
  const { isActive, timeLeft, formatTime, toggleTimer, resetTimer } = usePomodoro();
  const [mobileOpen, setMobileOpen] = useState(false);

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const getThemeIcon = () => {
    if (theme === 'light') return <Sun className="w-4 h-4" />;
    if (theme === 'dark') return <Moon className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

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

      {/* Sidebar Container - Floating Style */}
      <aside 
        className={cn(
          "fixed top-4 bottom-4 left-4 z-40 transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] flex flex-col",
          // Width & Mobile Transform
          open ? "w-[280px]" : "w-[80px]",
          mobileOpen ? "translate-x-0 w-[280px]" : "-translate-x-[calc(100%+16px)] lg:translate-x-0"
        )}
      >
        <div className={cn(
          "h-full flex flex-col bg-white dark:bg-zinc-950 rounded-[24px] border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-zinc-200/50 dark:shadow-black/50 overflow-hidden relative",
        )}>
          
          {/* 1. Header */}
          <div className={cn(
            "h-20 flex items-center shrink-0 transition-all duration-300",
            open ? "px-6 justify-between" : "justify-center px-0"
          )}>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 bg-zinc-900 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-zinc-900 font-bold text-xl shadow-lg shrink-0">
                F
              </div>
              {open && (
                <span className="font-bold text-lg text-zinc-900 dark:text-white tracking-tight animate-in fade-in duration-300">
                  FOCHUS
                </span>
              )}
            </div>
            
            {/* Collapse Toggle (Desktop only) */}
            <button 
              onClick={() => setOpen(!open)}
              className="hidden lg:flex p-1.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              {open ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
            </button>
          </div>

          {/* 2. Quick Actions */}
          <div className={cn("px-4 mb-2 space-y-2 transition-all duration-300", !open && "px-2")}>
             <button
               onClick={onOpenSpotlight}
               className={cn(
                 "w-full flex items-center gap-3 px-3 py-2.5 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group text-zinc-500 dark:text-zinc-400",
                 !open && "justify-center px-0 aspect-square"
               )}
               title="Ara ( / )"
             >
                <Search className="w-4 h-4 shrink-0 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                {open && (
                  <>
                    <span className="text-sm font-medium">Ara...</span>
                    <kbd className="ml-auto text-[10px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5 opacity-50">/</kbd>
                  </>
                )}
             </button>

             {open ? (
               <div className="grid grid-cols-2 gap-2">
                 <button onClick={onOpenTaskModal} className="flex items-center justify-center gap-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20 active:scale-95">
                   <Plus className="w-3.5 h-3.5" /> Görev
                 </button>
                 <button onClick={onOpenNoteModal} className="flex items-center justify-center gap-2 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl text-xs font-bold transition-all active:scale-95">
                   <Plus className="w-3.5 h-3.5" /> Not
                 </button>
               </div>
             ) : (
               <div className="flex flex-col gap-2">
                 <button onClick={onOpenTaskModal} className="w-full aspect-square flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition-all" title="Yeni Görev">
                   <Plus className="w-5 h-5" />
                 </button>
               </div>
             )}
          </div>

          {/* 3. Navigation Menu */}
          <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
            {mainNav.map(item => (
              <button
                key={item.id}
                onClick={() => { onViewChange(item.id); setMobileOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden",
                  activeView === item.id
                    ? "text-zinc-900 dark:text-white font-semibold bg-zinc-100 dark:bg-zinc-800/50"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900",
                  !open && "justify-center px-0"
                )}
                title={!open ? item.label : undefined}
              >
                <item.icon className={cn("w-5 h-5 shrink-0 transition-colors", activeView === item.id ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400 group-hover:text-zinc-600")} />
                {open && <span className="text-sm truncate">{item.label}</span>}
                {activeView === item.id && open && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-600 rounded-r-full" />
                )}
              </button>
            ))}

            <div className="my-4 border-t border-zinc-100 dark:border-zinc-800" />

            {/* Bottom Items (Settings etc.) */}
            <button
              onClick={() => onViewChange('settings')}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                activeView === 'settings'
                  ? "text-zinc-900 dark:text-white font-semibold bg-zinc-100 dark:bg-zinc-800/50"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900",
                !open && "justify-center px-0"
              )}
              title={!open ? 'Ayarlar' : undefined}
            >
              <Settings className="w-5 h-5 shrink-0 text-zinc-400 group-hover:text-zinc-600" />
              {open && <span className="text-sm truncate">Ayarlar</span>}
            </button>
          </nav>

          {/* 4. Footer & Widget */}
          <div className="p-4 mt-auto border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30">
            
            {/* Pomodoro Widget */}
            <div className={cn(
              "relative overflow-hidden transition-all duration-300",
              open 
                ? "bg-zinc-900 dark:bg-black rounded-2xl p-4 text-white shadow-lg" 
                : "bg-transparent p-0 flex justify-center"
            )}>
              {open ? (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className={cn("w-3 h-3", isActive && "text-yellow-400 fill-yellow-400")} />
                      Focus
                    </span>
                    <div className="text-2xl font-mono font-bold tracking-tight">
                      {formatTime(timeLeft)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={toggleTimer}
                      className="flex-1 h-8 bg-white text-zinc-900 rounded-lg flex items-center justify-center font-bold text-xs hover:bg-zinc-200 transition-colors"
                    >
                      {isActive ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      {isActive ? "Dur" : "Başla"}
                    </button>
                    <button onClick={resetTimer} className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center hover:bg-zinc-700 transition-colors text-zinc-400 hover:text-white">
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                <button 
                  onClick={onOpenPomodoro}
                  className="w-10 h-10 bg-zinc-900 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-white hover:scale-105 transition-transform shadow-md"
                  title={isActive ? `Sürüyor: ${formatTime(timeLeft)}` : "Pomodoro"}
                >
                  <Timer className={cn("w-5 h-5", isActive && "animate-pulse text-yellow-400")} />
                </button>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={cycleTheme}
              className={cn(
                "mt-3 flex items-center justify-center rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors",
                open ? "w-full py-2 gap-2 text-xs font-medium" : "w-10 h-10 mx-auto"
              )}
              title="Tema Değiştir"
            >
              {getThemeIcon()}
              {open && <span>Tema</span>}
            </button>

          </div>

        </div>
      </aside>
    </>
  );
};
