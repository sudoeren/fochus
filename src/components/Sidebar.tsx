import React, { useState, useEffect } from 'react';
import {
  Home,
  BarChart3,
  FileText,
  CheckSquare,
  Settings,
  Trash2,
  Search,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Briefcase,
  ChevronRight,
  CheckCircle2,
  Circle,
  Zap,
  PanelLeftClose,
  PanelLeft,
  MousePointer
} from 'lucide-react';
import { usePomodoro } from '../hooks/usePomodoro';
import { useTasks } from '../hooks/useTasks';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';

export type SidebarMode = 'open' | 'closed' | 'hover';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onOpenSpotlight: () => void;
  onOpenNoteModal: () => void;
  onOpenTaskModal: () => void;
  onOpenPomodoro: () => void;
  sidebarMode: SidebarMode;
  onSidebarModeChange: (mode: SidebarMode) => void;
  onSidebarHoverExpandedChange: (expanded: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onViewChange,
  onOpenSpotlight,
  onOpenNoteModal,
  onOpenTaskModal,
  onOpenPomodoro,
  sidebarMode,
  onSidebarModeChange,
  onSidebarHoverExpandedChange
}) => {
  const { t } = useTranslation();
  const { isActive, timeLeft, formatTime, toggleTimer, resetTimer, progress } = usePomodoro();
  const { tasks, toggleTask } = useTasks();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // On mobile we don't have true hover; always show the full sidebar when opened.
  const isCompact = sidebarMode === 'hover' && !isHovered && !mobileOpen;

  useEffect(() => {
    if (sidebarMode !== 'hover') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsHovered(false);
    }
  }, [sidebarMode]);

  useEffect(() => {
    if (sidebarMode !== 'hover') {
      onSidebarHoverExpandedChange(false);
    }
  }, [sidebarMode, onSidebarHoverExpandedChange]);

  const cycleSidebarMode = () => {
    const modes: SidebarMode[] = ['open', 'hover', 'closed'];
    const currentIndex = modes.indexOf(sidebarMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    onSidebarModeChange(modes[nextIndex]);
  };

  const getSidebarModeLabel = () => {
    switch (sidebarMode) {
      case 'open':
        return t('sidebar.mode_open') || 'Açık';
      case 'closed':
        return t('sidebar.mode_closed') || 'Kapalı';
      case 'hover':
        return t('sidebar.mode_hover') || 'Hover';
    }
  };

  const mainNav = [
    { id: 'dashboard', label: t('sidebar.overview'), icon: Home },
    { id: 'stats', label: t('sidebar.stats'), icon: BarChart3 },
    { id: 'tasks', label: t('sidebar.tasks'), icon: CheckSquare },
    { id: 'notes', label: t('sidebar.notes'), icon: FileText }
  ];

  // Filter pending tasks for the widget (Show top 4)
  const currentTasks = tasks.filter((t) => !t.isCompleted && !t.isDeleted).slice(0, 4);

  const renderModeIcon = (className: string) => {
    switch (sidebarMode) {
      case 'open':
        return <PanelLeft className={className} />;
      case 'closed':
        return <PanelLeftClose className={className} />;
      case 'hover':
        return <MousePointer className={className} />;
    }
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

      {/* Desktop reopen button when fully closed */}
      {sidebarMode === 'closed' && (
        <div className="hidden lg:block fixed top-4 left-4 z-50">
          <button
            onClick={cycleSidebarMode}
            className="p-3 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors group"
            title={getSidebarModeLabel()}
          >
            {renderModeIcon(
              'w-5 h-5 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white'
            )}
          </button>
        </div>
      )}

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
          'fixed top-4 bottom-4 left-4 z-40 w-[300px] flex flex-col transition-all duration-300 ease-spring',
          // Mobile: slide in/out
          mobileOpen ? 'translate-x-0' : '-translate-x-[calc(100%+16px)]',
          // Desktop: visible unless fully closed
          'lg:translate-x-0',
          sidebarMode === 'closed' && 'lg:hidden',
          // Desktop width behavior: hover mode becomes a compact strip and expands on hover
          sidebarMode === 'hover' ? (isHovered ? 'lg:w-[300px]' : 'lg:w-20') : 'lg:w-[300px]'
        )}
        onMouseEnter={() => {
          if (sidebarMode !== 'hover') return;
          setIsHovered(true);
          onSidebarHoverExpandedChange(true);
        }}
        onMouseLeave={() => {
          if (sidebarMode !== 'hover') return;
          setIsHovered(false);
          onSidebarHoverExpandedChange(false);
        }}
      >
        <div
          className={cn(
            'h-full flex flex-col bg-white/85 dark:bg-zinc-950/85 backdrop-blur-2xl rounded-[24px] border border-zinc-200/60 dark:border-zinc-700/60 shadow-2xl shadow-zinc-300/30 dark:shadow-black/60 overflow-hidden relative'
          )}
        >
          {isCompact ? (
            // Compact icon dock (hover-collapsed)
            <div className="h-full flex flex-col items-center py-4">
              <button
                onClick={() => {
                  onViewChange('dashboard');
                  setMobileOpen(false);
                }}
                className="w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-white/70 dark:hover:bg-zinc-900/60 transition-colors"
                title="FOCHUS"
              >
                <img src="/logo.svg" alt="Fokus Logo" className="h-9 w-9 object-contain" />
              </button>

              <div className="mt-3 flex flex-col items-center gap-2">
                <button
                  onClick={onOpenSpotlight}
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-white/70 dark:hover:bg-zinc-900/60 transition-colors"
                  title={t('sidebar.quick_search') + ' ( / )'}
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>

              <div className="my-4 w-10 border-t border-zinc-200/60 dark:border-zinc-800/70" />

              <nav className="flex-1 w-full px-2 flex flex-col items-center gap-2 overflow-y-auto custom-scrollbar">
                {mainNav.map((item) => {
                  const Icon = item.icon;
                  const active = activeView === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onViewChange(item.id);
                        setMobileOpen(false);
                      }}
                      title={item.label}
                      className={cn(
                        'w-11 h-11 rounded-xl flex items-center justify-center transition-colors relative',
                        active
                          ? 'bg-white/80 dark:bg-zinc-900/70 text-zinc-900 dark:text-white'
                          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-zinc-900/60'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {active && (
                        <span className="absolute -right-0.5 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-indigo-500" />
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="my-4 w-10 border-t border-zinc-200/60 dark:border-zinc-800/70" />

              <div className="w-full px-2 flex flex-col items-center gap-2">
                <button
                  onClick={() => {
                    onViewChange('settings');
                    setMobileOpen(false);
                  }}
                  title={t('sidebar.settings')}
                  className={cn(
                    'w-11 h-11 rounded-xl flex items-center justify-center transition-colors relative',
                    activeView === 'settings'
                      ? 'bg-white/80 dark:bg-zinc-900/70 text-zinc-900 dark:text-white'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-zinc-900/60'
                  )}
                >
                  <Settings className="w-5 h-5" />
                  {activeView === 'settings' && (
                    <span className="absolute -right-0.5 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-indigo-500" />
                  )}
                </button>

                <button
                  onClick={() => {
                    onViewChange('trash');
                    setMobileOpen(false);
                  }}
                  title={t('sidebar.trash')}
                  className={cn(
                    'w-11 h-11 rounded-xl flex items-center justify-center transition-colors relative',
                    activeView === 'trash'
                      ? 'bg-white/80 dark:bg-zinc-900/70 text-zinc-900 dark:text-white'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-zinc-900/60'
                  )}
                >
                  <Trash2 className="w-5 h-5" />
                  {activeView === 'trash' && (
                    <span className="absolute -right-0.5 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-indigo-500" />
                  )}
                </button>
              </div>

              <div className="mt-4">
                <button
                  onClick={cycleSidebarMode}
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-zinc-900/60 transition-colors group"
                  title={getSidebarModeLabel()}
                >
                  {renderModeIcon('w-5 h-5')}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* 1. Header (Custom Logo) */}
              <div className="h-24 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-3">
                  <img src="/logo.svg" alt="Fokus Logo" className="h-10 w-10 object-contain" />
                  <span className="font-bold text-xl text-zinc-900 dark:text-white tracking-tight">
                    FOCHUS
                  </span>
                </div>
                {/* Sidebar Mode Toggle Button */}
                <button
                  onClick={cycleSidebarMode}
                  className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
                  title={getSidebarModeLabel()}
                >
                  {renderModeIcon(
                    'w-5 h-5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'
                  )}
                </button>
              </div>

              {/* 2. Quick Actions */}
              <div className="px-5 mb-1 space-y-4">
                <button
                  onClick={onOpenSpotlight}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 transition-all group text-zinc-500 dark:text-zinc-400"
                  title={t('sidebar.quick_search') + ' ( / )'}
                >
                  <Search className="w-4 h-4 shrink-0 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                  <span className="text-sm font-medium">{t('sidebar.quick_search')}</span>
                  <kbd className="ml-auto text-[10px] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded px-1.5 py-0.5 opacity-50">
                    /
                  </kbd>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={onOpenTaskModal}
                    className="col-span-1 flex items-center justify-center gap-2 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl hover:opacity-90 transition-all shadow-md shadow-zinc-900/20 active:scale-95 group"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-xs font-bold">{t('sidebar.new_task')}</span>
                  </button>

                  <button
                    onClick={onOpenNoteModal}
                    className="col-span-1 flex items-center justify-center gap-2 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl hover:opacity-90 transition-all shadow-md shadow-zinc-900/20 active:scale-95 group"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="text-xs font-bold">{t('sidebar.new_note')}</span>
                  </button>
                </div>
              </div>

              {/* 3. Navigation Menu */}
              {/* 3. Navigation Menu */}
              <nav className="flex-1 overflow-y-auto py-2 space-y-1 custom-scrollbar px-5">
                {mainNav.map((item) => {
                  const Icon = item.icon;
                  const active = activeView === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onViewChange(item.id);
                        setMobileOpen(false);
                      }}
                      title={isCompact ? item.label : undefined}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden',
                        active
                          ? 'text-zinc-900 dark:text-white bg-zinc-200/80 dark:bg-zinc-800/80 font-semibold'
                          : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                      )}
                    >
                      <Icon
                        className={cn(
                          'w-5 h-5 shrink-0 transition-all',
                          active
                            ? 'text-zinc-900 dark:text-white'
                            : 'text-zinc-400 group-hover:text-zinc-600'
                        )}
                      />
                      <span>{item.label}</span>
                    </button>
                  );
                })}

                <div className="my-4 border-t border-zinc-100 dark:border-zinc-800 mx-2" />

                {/* Settings & Trash */}
                <button
                  onClick={() => {
                    onViewChange('settings');
                    setMobileOpen(false);
                  }}
                  title={isCompact ? t('sidebar.settings') : undefined}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden',
                    activeView === 'settings'
                      ? 'text-zinc-900 dark:text-white bg-zinc-200/80 dark:bg-zinc-800/80 font-semibold'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                  )}
                >
                  <Settings
                    className={cn(
                      'w-5 h-5 shrink-0 transition-all',
                      activeView === 'settings'
                        ? 'text-zinc-900 dark:text-white'
                        : 'text-zinc-400 group-hover:text-zinc-600'
                    )}
                  />
                  <span>{t('sidebar.settings')}</span>
                </button>
                <button
                  onClick={() => {
                    onViewChange('trash');
                    setMobileOpen(false);
                  }}
                  title={isCompact ? t('sidebar.trash') : undefined}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden',
                    activeView === 'trash'
                      ? 'text-zinc-900 dark:text-white bg-zinc-200/80 dark:bg-zinc-800/80 font-semibold'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                  )}
                >
                  <Trash2
                    className={cn(
                      'w-5 h-5 shrink-0 transition-all',
                      activeView === 'trash'
                        ? 'text-zinc-900 dark:text-white'
                        : 'text-zinc-400 group-hover:text-zinc-600'
                    )}
                  />
                  <span>{t('sidebar.trash')}</span>
                </button>
              </nav>

              {/* 4. Functional Widgets Area */}
              <div className="flex flex-col gap-4 px-4 pb-6 mt-2">
                {/* Functional Tasks Widget */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5" /> {t('sidebar.up_next')}
                    </span>
                    <button
                      onClick={() => onViewChange('tasks')}
                      className="p-1 -mr-1 rounded-md text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {currentTasks.length > 0 ? (
                    <ul className="space-y-2">
                      {currentTasks.map((task) => (
                        <li key={task.id} className="flex items-start gap-3 group">
                          <button
                            onClick={() => toggleTask(task.id)}
                            className="mt-0.5 text-zinc-300 hover:text-indigo-500 transition-colors"
                          >
                            <Circle className="w-4 h-4" />
                          </button>
                          <span
                            className={cn(
                              'text-xs font-medium text-zinc-700 dark:text-zinc-300 line-clamp-2 leading-relaxed cursor-pointer transition-all hover:text-indigo-600 dark:hover:text-indigo-400',
                              task.isCompleted && 'line-through text-zinc-400'
                            )}
                            onClick={() => toggleTask(task.id)}
                          >
                            {task.title}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4 text-zinc-400 gap-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700">
                      <CheckCircle2 className="w-5 h-5 opacity-50" />
                      <span className="text-xs font-medium">{t('sidebar.all_done')}</span>
                    </div>
                  )}
                </div>

                {/* BIG Pomodoro Widget */}
                <div
                  onClick={onOpenPomodoro}
                  className="bg-zinc-900 dark:bg-black rounded-2xl p-5 text-white shadow-xl relative overflow-hidden group cursor-pointer"
                >
                  {/* Subtle Animated Background */}
                  <div className="absolute inset-0 bg-indigo-500/10 blur-2xl opacity-30 pointer-events-none group-hover:opacity-50 transition-opacity duration-700" />

                  <div className="relative z-10 flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-3 opacity-80">
                      <Zap
                        className={cn(
                          'w-3.5 h-3.5',
                          isActive && 'text-yellow-400 fill-yellow-400 animate-pulse'
                        )}
                      />
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                        {t('sidebar.focus_timer')}
                      </span>
                    </div>

                    <div className="text-5xl font-mono font-bold tracking-tighter tabular-nums mb-5 text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-400">
                      {formatTime(timeLeft)}
                    </div>

                    <div className="flex gap-2 w-full">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTimer();
                        }}
                        className="flex-1 h-10 bg-white text-zinc-900 rounded-xl flex items-center justify-center font-bold text-sm hover:bg-zinc-200 transition-all active:scale-95 shadow-none"
                      >
                        {isActive ? (
                          <Pause className="w-4 h-4 fill-current mr-1" />
                        ) : (
                          <Play className="w-4 h-4 fill-current mr-1" />
                        )}
                        {isActive ? t('sidebar.pause') : t('sidebar.start')}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          resetTimer();
                        }}
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
            </>
          )}
        </div>
      </aside>
    </>
  );
};
