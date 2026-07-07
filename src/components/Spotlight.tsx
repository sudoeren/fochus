import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  FileText,
  CheckSquare,
  Settings,
  BarChart3,
  Layout,
  Plus,
  CornerDownLeft,
  Moon,
  Sun,
  Timer,
  Trash2,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTasks } from '../hooks/useTasks';
import { useNotes } from '../hooks/useNotes';
import { useTheme } from './ThemeProvider';
import { useTranslation } from 'react-i18next';

interface SpotlightProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  onOpenNoteModal: () => void;
  onOpenTaskModal: () => void;
  onOpenPomodoro?: () => void;
}

interface SpotlightItem {
  id: string;
  label: string;
  detail?: string;
  searchText?: string;
  icon: React.ComponentType<{ className?: string }>;
  group: string;
  action: () => void;
  shortcut?: string;
  color?: string;
}

const normalizeSearch = (value: string) =>
  value
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const isSubsequence = (needle: string, haystack: string) => {
  let index = 0;
  for (const char of haystack) {
    if (char === needle[index]) index += 1;
    if (index === needle.length) return true;
  }
  return false;
};

const scoreText = (query: string, text: string) => {
  const q = normalizeSearch(query);
  const value = normalizeSearch(text);

  if (!q) return 1;
  if (!value) return 0;
  if (value === q) return 100;
  if (value.startsWith(q)) return 85;
  if (value.includes(q)) return 65;
  if (value.split(/\s+/).some((word) => word.startsWith(q))) return 50;
  if (q.length >= 2 && isSubsequence(q, value)) return 25;
  return 0;
};

const stripHtml = (value?: string) =>
  value ? new DOMParser().parseFromString(value, 'text/html').body.textContent || '' : '';

export const Spotlight: React.FC<SpotlightProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenNoteModal,
  onOpenTaskModal,
  onOpenPomodoro
}) => {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { tasks } = useTasks();
  const { notes } = useNotes();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  // Static items definition
  const quickActions: SpotlightItem[] = useMemo(
    () => [
      {
        id: 'new-task',
        label: t('spotlight.actions.new_task'),
        detail: t('spotlight.actions.new_task_desc'),
        icon: Plus,
        group: t('spotlight.groups.quick_actions'),
        action: () => {
          onOpenTaskModal();
          onClose();
        },
        color: 'emerald'
      },
      {
        id: 'new-note',
        label: t('spotlight.actions.new_note'),
        detail: t('spotlight.actions.new_note_desc'),
        icon: FileText,
        group: t('spotlight.groups.quick_actions'),
        action: () => {
          onOpenNoteModal();
          onClose();
        },
        color: 'amber'
      },
      {
        id: 'start-focus',
        label: t('spotlight.actions.focus_timer'),
        detail: t('spotlight.actions.focus_timer_desc'),
        icon: Timer,
        group: t('spotlight.groups.quick_actions'),
        action: () => {
          onOpenPomodoro?.();
          onClose();
        },
        color: 'red'
      },
      {
        id: 'toggle-theme',
        label:
          theme === 'dark'
            ? t('spotlight.actions.toggle_light')
            : t('spotlight.actions.toggle_dark'),
        detail: t('spotlight.actions.toggle_theme_desc'),
        icon: theme === 'dark' ? Sun : Moon,
        group: t('spotlight.groups.quick_actions'),
        action: () => {
          setTheme(theme === 'dark' ? 'light' : 'dark');
          onClose();
        },
        color: 'indigo'
      }
    ],
    [t, onOpenTaskModal, onClose, onOpenNoteModal, onOpenPomodoro, theme, setTheme]
  );

  const navigationItems: SpotlightItem[] = useMemo(
    () => [
      {
        id: 'go-dashboard',
        label: t('spotlight.pages.dashboard'),
        detail: t('spotlight.pages.dashboard_desc'),
        icon: Layout,
        group: t('spotlight.groups.pages'),
        action: () => {
          onNavigate('dashboard');
          onClose();
        }
      },
      {
        id: 'go-stats',
        label: t('spotlight.pages.stats'),
        detail: t('spotlight.pages.stats_desc'),
        icon: BarChart3,
        group: t('spotlight.groups.pages'),
        action: () => {
          onNavigate('stats');
          onClose();
        }
      },
      {
        id: 'go-tasks',
        label: t('spotlight.pages.tasks'),
        detail: t('spotlight.pages.tasks_desc'),
        icon: CheckSquare,
        group: t('spotlight.groups.pages'),
        action: () => {
          onNavigate('tasks');
          onClose();
        }
      },
      {
        id: 'go-notes',
        label: t('spotlight.pages.notes'),
        detail: t('spotlight.pages.notes_desc'),
        icon: FileText,
        group: t('spotlight.groups.pages'),
        action: () => {
          onNavigate('notes');
          onClose();
        }
      },
      {
        id: 'go-trash',
        label: t('spotlight.pages.trash'),
        detail: t('spotlight.pages.trash_desc'),
        icon: Trash2,
        group: t('spotlight.groups.pages'),
        action: () => {
          onNavigate('trash');
          onClose();
        }
      },
      {
        id: 'go-settings',
        label: t('spotlight.pages.settings'),
        detail: t('spotlight.pages.settings_desc'),
        icon: Settings,
        group: t('spotlight.groups.pages'),
        action: () => {
          onNavigate('settings');
          onClose();
        }
      }
    ],
    [t, onNavigate, onClose]
  );

  // Dynamic Content - Tasks
  const taskItems: SpotlightItem[] = useMemo(
    () =>
      tasks
        .filter((task) => !task.isDeleted)
        .map((task) => ({
          id: `task-${task.id}`,
          label: task.title,
          detail: task.isCompleted
            ? `✓ ${t('spotlight.details.completed')}`
            : t('spotlight.details.pending'),
          searchText: [task.title, task.description ?? '', task.status ?? ''].join(' '),
          icon: CheckSquare,
          group: t('spotlight.groups.tasks'),
          action: () => {
            onNavigate('tasks');
            onClose();
          },
          color: task.isCompleted ? 'emerald' : 'zinc'
        })),
    [tasks, t, onNavigate, onClose]
  );

  // Dynamic Content - Notes
  const noteItems: SpotlightItem[] = useMemo(
    () =>
      notes
        .filter((note) => !note.isDeleted)
        .map((note) => ({
          id: `note-${note.id}`,
          label: note.title || t('spotlight.details.untitled_note'),
          detail: new Date(note.createdAt).toLocaleDateString(
            i18n.language === 'tr' ? 'tr-TR' : 'en-US'
          ),
          searchText: [note.title, stripHtml(note.content)].join(' '),
          icon: FileText,
          group: t('spotlight.groups.notes'),
          action: () => {
            onNavigate('notes');
            onClose();
          },
          color: 'amber'
        })),
    [notes, t, i18n.language, onNavigate, onClose]
  );

  const recentItems: SpotlightItem[] = useMemo(() => {
    const recentTasks = taskItems.map((item) => {
      const task = tasks.find((candidate) => `task-${candidate.id}` === item.id);
      return {
        item: { ...item, group: t('spotlight.groups.recent') },
        date: task?.updatedAt ? new Date(task.updatedAt).getTime() : 0
      };
    });
    const recentNotes = noteItems.map((item) => {
      const note = notes.find((candidate) => `note-${candidate.id}` === item.id);
      return {
        item: { ...item, group: t('spotlight.groups.recent') },
        date: note?.updatedAt ? new Date(note.updatedAt).getTime() : 0
      };
    });

    return [...recentTasks, ...recentNotes]
      .sort((a, b) => b.date - a.date)
      .slice(0, 5)
      .map(({ item }) => item);
  }, [taskItems, noteItems, tasks, notes, t]);

  // Combine all items based on query
  const allItems = useMemo(() => {
    if (!query.trim()) {
      return [...quickActions, ...navigationItems, ...recentItems];
    }

    return [...quickActions, ...navigationItems, ...taskItems, ...noteItems]
      .map((item) => ({
        item,
        score: Math.max(
          scoreText(query, item.label),
          scoreText(query, item.detail ?? ''),
          scoreText(query, item.searchText ?? '')
        )
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || a.item.label.localeCompare(b.item.label))
      .slice(0, 20)
      .map(({ item }) => item);
  }, [query, quickActions, navigationItems, recentItems, taskItems, noteItems]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % allItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + allItems.length) % allItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (allItems[selectedIndex]) allItems[selectedIndex].action();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, allItems, selectedIndex]);

  // Group items for rendering
  const groupedItems = allItems.reduce(
    (acc, item, index) => {
      const group = item.group;
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push({ ...item, globalIndex: index });
      return acc;
    },
    {} as Record<string, (SpotlightItem & { globalIndex: number })[]>
  );

  const getColorClasses = (color?: string, isSelected?: boolean) => {
    if (!color)
      return isSelected
        ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400';

    const colors: Record<string, string> = {
      emerald: isSelected
        ? 'bg-emerald-600 text-white'
        : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
      amber: isSelected
        ? 'bg-amber-600 text-white'
        : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
      red: isSelected
        ? 'bg-red-600 text-white'
        : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
      indigo: isSelected
        ? 'bg-indigo-600 text-white'
        : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
      zinc: isSelected
        ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
    };
    return colors[color] || colors.zinc;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[70vh]">
        {/* Search Header */}
        <div className="flex items-center px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <Search className="w-5 h-5 text-zinc-400 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-base text-zinc-900 dark:text-white placeholder-zinc-400 font-medium"
            placeholder={t('spotlight.placeholder')}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            autoComplete="off"
          />
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md text-[10px] font-medium text-zinc-500 border border-zinc-200 dark:border-zinc-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto custom-scrollbar">
          {allItems.length > 0 ? (
            <div className="py-2">
              {Object.entries(groupedItems).map(([group, items]) => (
                <div key={group} className="mb-2">
                  {/* Group Header */}
                  <div className="px-4 py-2 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider sticky top-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm z-10">
                    {group}
                  </div>

                  {/* Group Items */}
                  <div className="px-2">
                    {items.map((item) => {
                      const isSelected = item.globalIndex === selectedIndex;
                      return (
                        <button
                          key={item.id}
                          data-index={item.globalIndex}
                          onClick={item.action}
                          onMouseEnter={() => setSelectedIndex(item.globalIndex)}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-150 group mb-1',
                            isSelected
                              ? 'bg-zinc-100 dark:bg-zinc-800'
                              : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                          )}
                        >
                          {/* Icon */}
                          <div
                            className={cn(
                              'p-2.5 rounded-xl transition-all flex-shrink-0',
                              getColorClasses(item.color, isSelected)
                            )}
                          >
                            <item.icon className="w-4 h-4" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div
                              className={cn(
                                'font-medium text-sm truncate',
                                isSelected
                                  ? 'text-zinc-900 dark:text-white'
                                  : 'text-zinc-700 dark:text-zinc-300'
                              )}
                            >
                              {item.label}
                            </div>
                            {item.detail && (
                              <div className="text-xs text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                                {item.detail}
                              </div>
                            )}
                          </div>

                          {/* Right Side */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {item.shortcut && !isSelected && (
                              <kbd className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-[10px] font-medium text-zinc-400">
                                {item.shortcut}
                              </kbd>
                            )}
                            {isSelected && (
                              <div className="flex items-center gap-1 text-xs font-medium text-zinc-400">
                                <CornerDownLeft className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <Search className="w-6 h-6 text-zinc-400" />
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                {t('spotlight.no_results')}
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                {t('spotlight.try_different')}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <ArrowUp className="w-3 h-3" />
              <ArrowDown className="w-3 h-3" />
              <span>{t('spotlight.navigate')}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CornerDownLeft className="w-3 h-3" />
              <span>{t('spotlight.select')}</span>
            </span>
            <span className="flex items-center gap-1.5 ml-2 border-l border-zinc-200 dark:border-zinc-700 pl-4">
              <kbd className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 rounded text-[10px]">
                /
              </kbd>
              <span>{t('spotlight.open')}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Fochus" className="w-4 h-4" />
            <span className="font-semibold">FOCHUS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
