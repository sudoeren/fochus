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
  ChevronRight
} from 'lucide-react';
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
  { id: 'weekly', label: 'Takvim', icon: Calendar },
  { id: 'stats', label: 'İstatistik', icon: BarChart },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onViewChange,
  onOpenSpotlight,
  onOpenNoteModal,
  onOpenTaskModal
}) => {
  const { isActive, timeLeft, formatTime, toggleTimer, resetTimer } = usePomodoro();
  const { tasks } = useTasks();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentTasks = tasks.filter(t => !t.isCompleted && !t.isDeleted).slice(0, 3);

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

      {/* Sidebar Container */}
      <aside 
        className={cn(
          "fixed top-4 bottom-4 left-4 z-40 w-[280px] flex flex-col transition-transform duration-300 ease-spring",
          "lg:translate-x-0", 
          mobileOpen ? "translate-x-0" : "-translate-x-[calc(100%+16px)] lg:translate-x-0"
        )}
      >
        <div className={cn(
          "h-full flex flex-col bg-white dark:bg-zinc-950 rounded-[24px] border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-zinc-200/50 dark:shadow-black/50 overflow-hidden relative",
        )}>
          
          {/* 1. Header (Logo) */}
          <div className="h-20 flex items-center px-6 shrink-0">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 bg-zinc-900 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-zinc-900 font-bold text-xl shadow-lg shrink-0">
                F
              </div>
              <span className="font-bold text-lg text-zinc-900 dark:text-white tracking-tight">FOCHUS</span>
            </div>
          </div>

          {/* 2. Quick Actions */}
          <div className="px-4 mb-4 space-y-3">
            <button
              onClick={onOpenSpotlight}
              className="w-full flex items-center gap-3 px-3 py-2.5 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group text-zinc-500 dark:text-zinc-400"
              title="Ara ( / )"
            >
              <Search className="w-4 h-4 shrink-0 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
              <span className="text-sm font-medium">Ara...</span>
              <kbd className="ml-auto text-[10px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5 opacity-50">/</kbd>
            </button>

            <div className="flex gap-2">
              <button 
                onClick={onOpenTaskModal}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" /> Görev Ekle
              </button>
              <button 
                onClick={onOpenNoteModal}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl text-xs font-bold transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" /> Not Ekle
              </button>
            </div>
          </div>

          {/* 3. Navigation Menu */}
          <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
            {mainNav.map(item => {
              const Icon = item.icon;
              const active = activeView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => { onViewChange(item.id); setMobileOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                    active 
                      ? "text-zinc-900 dark:text-white font-semibold bg-zinc-100 dark:bg-zinc-800/50"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  )}
                >
                  <Icon className={cn("w-5 h-5 shrink-0 transition-colors", active ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400 group-hover:text-zinc-600")} />
                  <span>{item.label}</span>
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-600 dark:bg-indigo-400 rounded-r-full" />
                  )}
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
                  ? "text-zinc-900 dark:text-white font-semibold bg-zinc-100 dark:bg-zinc-800/50" 
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900"
              )}
            >
              <Settings className={cn("w-5 h-5 shrink-0 transition-colors", activeView === 'settings' ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400 group-hover:text-zinc-600")} />
              <span>Ayarlar</span>
              {activeView === 'settings' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-600 dark:bg-indigo-400 rounded-r-full" />
              )}
            </button>
            <button
              onClick={() => { onViewChange('trash'); setMobileOpen(false); }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                activeView === 'trash' 
                  ? "text-zinc-900 dark:text-white font-semibold bg-zinc-100 dark:bg-zinc-800/50" 
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900"
              )}
            >
              <Trash2 className={cn("w-5 h-5 shrink-0 transition-colors", activeView === 'trash' ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400 group-hover:text-zinc-600")} />
              <span>Çöp Kutusu</span>
              {activeView === 'trash' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-600 dark:bg-indigo-400 rounded-r-full" />
              )}
            </button>
          </nav>

          {/* 4. Widgets Area (Current Tasks & Pomodoro) - INTEGRATED LOOK */}
          <div className="mt-auto bg-zinc-50/80 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800">
            
            {/* Current Tasks Widget */}
            <div className="px-4 pt-4 pb-2">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-3 h-3" /> Görevler
                </span>
                <button onClick={() => onViewChange('tasks')} className="p-1 rounded-md text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {currentTasks.length > 0 ? (
                <ul className="space-y-1">
                  {currentTasks.map(task => (
                    <li key={task.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 transition-colors group cursor-default">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0 group-hover:scale-125 transition-transform" />
                      <span className="truncate text-xs font-medium text-zinc-600 dark:text-zinc-300">{task.title}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-3 text-zinc-400 text-xs italic bg-white/50 dark:bg-zinc-800/50 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-700">
                  Aktif görev yok
                </div>
              )}
            </div>

            {/* Pomodoro Widget - INTEGRATED */}
            <div className="p-4 pt-2">
              <div className="bg-zinc-900 dark:bg-black rounded-xl p-4 text-white shadow-lg relative overflow-hidden group">
                {/* Background Pulse Effect */}
                {isActive && (
                  <div className="absolute inset-0 bg-indigo-500/20 animate-pulse" />
                )}
                
                <div className="relative z-10 flex flex-col items-center">
                  <div className="text-3xl font-mono font-bold tracking-tight mb-3 tabular-nums">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="flex gap-2 w-full">
                    <button 
                      onClick={toggleTimer}
                      className={cn(
                        "flex-1 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-all active:scale-95",
                        isActive 
                          ? "bg-red-500 hover:bg-red-600 text-white" 
                          : "bg-white text-zinc-900 hover:bg-zinc-200"
                      )}
                    >
                      {isActive ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                      {isActive ? "Dur" : "Başla"}
                    </button>
                    <button 
                      onClick={resetTimer}
                      className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center hover:bg-zinc-700 transition-colors text-zinc-400 hover:text-white active:scale-95"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </aside>
    </>
  );
};
