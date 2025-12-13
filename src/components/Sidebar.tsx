import React, { useState } from 'react';
import { 
  Home, 
  FileText, 
  CheckSquare, 
  Calendar, 
  BarChart2, 
  Settings, 
  Trash2, 
  Search, 
  Plus, 
  Play, 
  Pause, 
  RotateCcw,
  Clock,
  LayoutGrid
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

const navItems = [
  { id: 'dashboard', label: 'Genel Bakış', icon: Home },
  { id: 'tasks', label: 'Görevler', icon: CheckSquare },
  { id: 'notes', label: 'Notlar', icon: FileText },
  { id: 'weekly', label: 'Takvim', icon: Calendar },
  { id: 'stats', label: 'Raporlar', icon: BarChart2 },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onViewChange,
  onOpenSpotlight,
  onOpenNoteModal,
  onOpenTaskModal,
  onOpenPomodoro
}) => {
  const { isActive, timeLeft, formatTime, toggleTimer, resetTimer } = usePomodoro();
  const { tasks } = useTasks();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Active tasks for widget
  const activeTasks = tasks.filter(t => !t.isCompleted && !t.isDeleted).slice(0, 3);

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-xl shadow-sm border border-zinc-200/50 dark:border-zinc-800/50"
      >
        <LayoutGrid className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={cn(
        "fixed top-4 bottom-4 left-4 z-40 w-[260px] flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
        "lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-[calc(100%+20px)] lg:translate-x-0"
      )}>
        
        {/* Main Panel */}
        <div className="h-full flex flex-col bg-zinc-50/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-[24px] border border-white/20 dark:border-zinc-800 shadow-2xl shadow-zinc-200/50 dark:shadow-black/50 overflow-hidden ring-1 ring-zinc-900/5">
          
          {/* 1. Header Area */}
          <div className="pt-6 px-6 pb-2 shrink-0">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded-lg flex items-center justify-center text-white dark:text-zinc-900 font-bold shadow-md shadow-zinc-900/10">
                F
              </div>
              <span className="font-bold text-lg text-zinc-900 dark:text-white tracking-tight">FOCHUS</span>
            </div>

            {/* Global Search */}
            <button
              onClick={onOpenSpotlight}
              className="w-full flex items-center gap-3 px-3 py-2.5 bg-white dark:bg-black/20 rounded-xl border border-zinc-200/50 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10 transition-all group shadow-sm"
            >
              <Search className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
              <span className="text-sm font-medium text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">Ara...</span>
              <kbd className="ml-auto text-[10px] font-sans text-zinc-300 dark:text-zinc-600">/</kbd>
            </button>
          </div>

          {/* 2. Navigation */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5 custom-scrollbar">
            {/* Main Items */}
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { onViewChange(item.id); setMobileOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 relative group",
                    active 
                      ? "text-zinc-900 dark:text-white bg-white dark:bg-white/10 shadow-sm shadow-zinc-200/50 dark:shadow-none" 
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/50 dark:hover:bg-white/5"
                  )}
                >
                  <Icon className={cn("w-4 h-4 transition-colors", active ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300")} />
                  {item.label}
                </button>
              );
            })}

            <div className="h-4" />

            {/* Quick Actions Title */}
            <div className="px-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 opacity-70">
              Hızlı İşlem
            </div>

            {/* Add Buttons */}
            <button
              onClick={onOpenTaskModal}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/50 dark:hover:bg-white/5 transition-all group"
            >
              <div className="w-4 h-4 rounded flex items-center justify-center border border-zinc-300 dark:border-zinc-700 group-hover:border-zinc-400 dark:group-hover:border-zinc-500">
                <Plus className="w-3 h-3" />
              </div>
              Yeni Görev
            </button>
            <button
              onClick={onOpenNoteModal}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/50 dark:hover:bg-white/5 transition-all group"
            >
              <div className="w-4 h-4 rounded flex items-center justify-center border border-zinc-300 dark:border-zinc-700 group-hover:border-zinc-400 dark:group-hover:border-zinc-500">
                <Plus className="w-3 h-3" />
              </div>
              Yeni Not
            </button>

            <div className="h-4" />

            {/* Secondary Items */}
            <button
              onClick={() => { onViewChange('settings'); setMobileOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/50 dark:hover:bg-white/5 transition-all"
            >
              <Settings className="w-4 h-4 text-zinc-400" />
              Ayarlar
            </button>
            <button
              onClick={() => { onViewChange('trash'); setMobileOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/50 dark:hover:bg-white/5 transition-all"
            >
              <Trash2 className="w-4 h-4 text-zinc-400" />
              Çöp Kutusu
            </button>
          </div>

          {/* 3. Footer / Widgets */}
          <div className="p-4 space-y-4">
            
            {/* Active Tasks Widget (Minimal) */}
            {activeTasks.length > 0 && (
              <div className="bg-white/50 dark:bg-white/5 rounded-xl p-3 border border-zinc-100 dark:border-white/5">
                <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  <Clock className="w-3 h-3" />
                  Sırada
                </div>
                <div className="space-y-1.5">
                  {activeTasks.map(task => (
                    <div key={task.id} className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate pl-2 border-l-2 border-indigo-500/50">
                      {task.title}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pomodoro (Integrated) */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-zinc-900 dark:bg-black rounded-2xl p-4 text-white shadow-xl flex flex-col items-center">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">TIMER</div>
                <div className="text-3xl font-mono font-bold tracking-tight mb-3 tabular-nums text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-400">
                  {formatTime(timeLeft)}
                </div>
                
                <div className="flex items-center gap-2 w-full">
                  <button 
                    onClick={toggleTimer}
                    className="flex-1 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    {isActive ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  </button>
                  <button 
                    onClick={resetTimer}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-zinc-400 hover:text-white"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </aside>
    </>
  );
};