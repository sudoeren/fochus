import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Flame,
  ListChecks,
  ArrowRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTasks } from '../hooks/useTasks';
import { useNotes } from '../hooks/useNotes';
import { pomodoroAPI } from '../services/api';
import { cn } from '../lib/utils';

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

const formatFocusDuration = (seconds: number, language: string) => {
  const totalMinutes = Math.floor(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const hourSuffix = language.startsWith('tr') ? 's' : 'h';
  const minuteSuffix = language.startsWith('tr') ? 'd' : 'm';

  if (hours <= 0) return `${minutes}${minuteSuffix}`;
  if (minutes <= 0) return `${hours}${hourSuffix}`;
  return `${hours}${hourSuffix} ${minutes}${minuteSuffix}`;
};

export const Stats: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const { t, i18n } = useTranslation();
  const { tasks } = useTasks();
  const { notes } = useNotes();
  const [weeklyFocusSeconds, setWeeklyFocusSeconds] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const loadStats = async () => {
      try {
        const stats = (await pomodoroAPI.getStats('week')) as { work?: { duration?: number } };
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

  const stats = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const weekStart = new Date(todayStart);
    const day = weekStart.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    weekStart.setDate(weekStart.getDate() + mondayOffset);

    const weekDays = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      return {
        key: date.toISOString().slice(0, 10),
        label: date.toLocaleDateString(i18n.language, { weekday: 'short' }).slice(0, 3),
        isToday: date.getTime() === todayStart.getTime(),
        completed: 0
      };
    });

    const activeTasks = tasks.filter((task) => !task.isDeleted);
    const completedTasks = activeTasks.filter((task) => task.isCompleted);
    const completedThisWeek = completedTasks.filter((task) => {
      const updatedAt = task.updatedAt ? new Date(task.updatedAt) : null;
      if (!updatedAt || updatedAt < weekStart) return false;
      const key = updatedAt.toISOString().slice(0, 10);
      const dayEntry = weekDays.find((entry) => entry.key === key);
      if (dayEntry) dayEntry.completed += 1;
      return true;
    }).length;
    const overdueTasks = activeTasks.filter((task) => {
      if (task.isCompleted || !task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < todayStart;
    }).length;
    const completedDays = weekDays.filter((entry) => entry.completed > 0).length;

    return {
      activeTasks: activeTasks.filter((task) => !task.isCompleted).length,
      completedThisWeek,
      overdueTasks,
      completionRate:
        activeTasks.length === 0
          ? 0
          : Math.round((completedTasks.length / activeTasks.length) * 100),
      activeDaysThisWeek: completedDays,
      notes: notes.filter((note) => !note.isDeleted).length,
      weekDays
    };
  }, [i18n.language, notes, tasks]);

  const focusLabel = formatFocusDuration(weeklyFocusSeconds, i18n.language);
  const focusProgress = clampPercent(Math.round((weeklyFocusSeconds / (5 * 60 * 60)) * 100));

  const cards = [
    {
      label: t('dashboard.completed_week'),
      value: stats.completedThisWeek,
      detail: t('stats.week_progress', { count: stats.activeDaysThisWeek }),
      icon: CheckCircle2,
      progress: clampPercent(Math.round((stats.activeDaysThisWeek / 7) * 100)),
      tone: 'emerald'
    },
    {
      label: t('dashboard.focus_total'),
      value: focusLabel,
      detail: t('stats.focus_target'),
      icon: Clock,
      progress: focusProgress,
      tone: 'sky'
    },
    {
      label: t('dashboard.completion_rate'),
      value: `%${stats.completionRate}`,
      detail: t('stats.open_tasks', { count: stats.activeTasks }),
      icon: Flame,
      progress: stats.completionRate,
      tone: 'amber'
    },
    {
      label: t('dashboard.overdue'),
      value: stats.overdueTasks,
      detail: stats.overdueTasks > 0 ? t('stats.needs_review') : t('stats.health_clear'),
      icon: AlertTriangle,
      progress: stats.overdueTasks > 0 ? clampPercent(stats.overdueTasks * 20) : 100,
      tone: stats.overdueTasks > 0 ? 'rose' : 'emerald'
    }
  ];

  const colorMap: Record<string, { dot: string; bar: string }> = {
    emerald: { dot: 'bg-emerald-500', bar: 'bg-emerald-400' },
    sky: { dot: 'bg-sky-500', bar: 'bg-sky-400' },
    amber: { dot: 'bg-amber-500', bar: 'bg-amber-400' },
    rose: { dot: 'bg-rose-500', bar: 'bg-rose-400' }
  };

  const recentNotes = notes.filter((n) => !n.isDeleted).slice(0, 4);

  return (
    <div className="min-h-screen px-8 py-10 lg:px-12">
      <div className="mx-auto max-w-6xl space-y-10">
        {/* Header */}
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-zinc-400">
            {t('dashboard.weekly_overview')}
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-950 dark:text-white">
            {t('stats.title')}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            {t('stats.subtitle')}
          </p>
        </header>

        {/* Status Cards */}
        <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const color = colorMap[card.tone];

            return (
              <div
                key={card.label}
                className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 p-5 shadow-sm ring-1 ring-zinc-200/50 dark:ring-zinc-800/50"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    {card.label}
                  </span>
                </div>
                <div className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
                  {card.value}
                </div>
                <div className="mt-4">
                  <div className="h-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className={cn('h-full rounded-full transition-all', color.bar)}
                      style={{ width: `${card.progress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">{card.detail}</p>
                </div>
              </div>
            );
          })}
        </section>

        {/* Quick Notes */}
        {recentNotes.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {t('dashboard.notes')}
              </h2>
              <button
                onClick={() => onNavigate('notes')}
                className="flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              >
                {t('dashboard.all')} <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recentNotes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => onNavigate('notes')}
                  className="group text-left rounded-2xl bg-white/80 dark:bg-zinc-900/80 p-4 shadow-sm ring-1 ring-zinc-200/50 dark:ring-zinc-800/50 hover:ring-zinc-300 dark:hover:ring-zinc-700 transition-all hover:shadow-md"
                >
                  <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
                    {note.title || t('dashboard.untitled_note')}
                  </h3>
                  {note.content && (
                    <p className="mt-1.5 text-xs text-zinc-400 dark:text-zinc-500 line-clamp-2 leading-relaxed">
                      {new DOMParser().parseFromString(note.content, 'text/html').body
                        ?.textContent || ''}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Weekly Activity + Snapshot */}
        <section className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 p-6 shadow-sm ring-1 ring-zinc-200/50 dark:ring-zinc-800/50">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
                  {t('stats.weekly_activity')}
                </h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  {t('dashboard.streak_days', {
                    count: stats.activeDaysThisWeek,
                    unit: t('dashboard.days')
                  })}
                </p>
              </div>
              <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-xs font-bold text-zinc-600 dark:text-zinc-300">
                {stats.activeDaysThisWeek}/7
              </span>
            </div>

            <div className="mt-8 grid grid-cols-7 gap-3">
              {stats.weekDays.map((day) => (
                <div key={day.key} className="flex flex-col items-center gap-3">
                  <div
                    className={cn(
                      'flex h-20 w-full max-w-16 items-end justify-center rounded-2xl bg-zinc-100 p-1.5 dark:bg-zinc-800',
                      day.isToday && 'ring-2 ring-zinc-300 dark:ring-zinc-600'
                    )}
                  >
                    <div
                      className={cn(
                        'w-full rounded-xl bg-zinc-300 transition-all dark:bg-zinc-700',
                        day.completed > 0 && 'bg-zinc-900 dark:bg-white'
                      )}
                      style={{
                        height: `${day.completed > 0 ? clampPercent(28 + day.completed * 18) : 8}%`
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold uppercase text-zinc-400">{day.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white/80 dark:bg-zinc-900/80 p-6 shadow-sm ring-1 ring-zinc-200/50 dark:ring-zinc-800/50">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
              {t('stats.snapshot')}
            </h2>
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-zinc-50 dark:bg-zinc-800/70 p-4">
                <div className="flex items-center gap-3">
                  <ListChecks className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                  <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                    {t('stats.active_tasks')}
                  </span>
                </div>
                <span className="text-xl font-bold text-zinc-950 dark:text-white">
                  {stats.activeTasks}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-zinc-50 dark:bg-zinc-800/70 p-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                  <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                    {t('stats.notes_total')}
                  </span>
                </div>
                <span className="text-xl font-bold text-zinc-950 dark:text-white">
                  {stats.notes}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
