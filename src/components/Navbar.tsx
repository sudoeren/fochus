import React, { useState } from 'react';
import {
  Home,
  FileText,
  CheckSquare,
  Calendar,
  BarChart,
  Search,
  Plus,
  Timer
} from 'lucide-react';
import { cn } from '../lib/utils';
import { usePomodoro } from '../hooks/usePomodoro';
import { useTranslation } from 'react-i18next';

interface NavbarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onOpenSpotlight: () => void;
  onOpenTaskModal: () => void;
  onOpenPomodoro: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  onViewChange,
  onOpenSpotlight,
  onOpenTaskModal,
  onOpenPomodoro
}) => {
  const { t } = useTranslation();
  const { isActive, timeLeft, formatTime } = usePomodoro();
  const [hovered, setHovered] = useState<string | null>(null);

  const navItems = [
    { id: 'dashboard', icon: Home, label: t('navbar.dashboard') },
    { id: 'tasks', icon: CheckSquare, label: t('navbar.tasks') },
    { id: 'notes', icon: FileText, label: t('navbar.notes') },
    { id: 'weekly', icon: Calendar, label: t('navbar.calendar') },
    { id: 'stats', icon: BarChart, label: t('navbar.stats') }
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-4">
      {/* Floating Capsule */}
      <nav className="flex items-center gap-1 p-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 rounded-full shadow-2xl shadow-zinc-200/50 dark:shadow-black/50 transition-all duration-300 hover:scale-[1.02]">
        {/* Main Navigation */}
        <div className="flex items-center gap-1 pr-2 border-r border-zinc-200 dark:border-zinc-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActiveState = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                onMouseEnter={() => setHovered(item.id)}
                onMouseLeave={() => setHovered(null)}
                className={cn(
                  'relative p-3 rounded-full transition-all duration-200 group',
                  isActiveState
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md'
                    : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                )}
              >
                <Icon className={cn('w-5 h-5', isActiveState && 'scale-110')} />

                {/* Tooltip */}
                {hovered === item.id && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-2 py-1 text-[10px] font-medium text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 rounded-lg whitespace-nowrap animate-in fade-in slide-in-from-bottom-2">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Actions Group */}
        <div className="flex items-center gap-1 pl-1">
          {/* Search / Spotlight */}
          <button
            onClick={onOpenSpotlight}
            className="p-3 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors relative group"
          >
            <Search className="w-5 h-5" />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-2 py-1 text-[10px] font-medium text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {t('navbar.search')}
            </span>
          </button>

          {/* Quick Add */}
          <button
            onClick={onOpenTaskModal}
            className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-full transition-colors relative group"
          >
            <Plus className="w-5 h-5" />
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-2 py-1 text-[10px] font-medium text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {t('navbar.new_task')}
            </span>
          </button>

          {/* Pomodoro Indicator */}
          <button
            onClick={onOpenPomodoro}
            className={cn(
              'flex items-center gap-2 pl-3 pr-4 py-2 ml-1 rounded-full text-xs font-bold font-mono transition-all border',
              isActive
                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30 animate-pulse'
                : 'bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 border-zinc-100 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            )}
          >
            <Timer className="w-4 h-4" />
            {formatTime(timeLeft)}
          </button>
        </div>
      </nav>
    </div>
  );
};
