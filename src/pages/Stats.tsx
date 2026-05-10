import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock, FileText, Flame, ListChecks } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTasks } from '../hooks/useTasks';
import { useNotes } from '../hooks/useNotes';
import { pomodoroAPI } from '../services/api';

const formatFocusDuration = (seconds: number) => {
  const totalMinutes = Math.floor(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) return `${minutes}m`;
  if (minutes <= 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
};

export const Stats: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const { t } = useTranslation();
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

    const activeTasks = tasks.filter((task) => !task.isDeleted);
    const completedTasks = activeTasks.filter((task) => task.isCompleted);
    const completedThisWeek = completedTasks.filter((task) => {
      const updatedAt = task.updatedAt ? new Date(task.updatedAt) : null;
      return updatedAt ? updatedAt >= weekStart : false;
    }).length;
    const overdueTasks = activeTasks.filter((task) => {
      if (task.isCompleted || !task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < todayStart;
    }).length;
    const completedDays = new Set(
      completedTasks
        .map((task) => (task.updatedAt ? new Date(task.updatedAt) : null))
        .filter((date): date is Date => date instanceof Date && date >= weekStart)
        .map((date) => date.toISOString().slice(0, 10))
    );

    return {
      activeTasks: activeTasks.filter((task) => !task.isCompleted).length,
      completedThisWeek,
      overdueTasks,
      completionRate:
        activeTasks.length === 0
          ? 0
          : Math.round((completedTasks.length / activeTasks.length) * 100),
      activeDaysThisWeek: completedDays.size,
      notes: notes.filter((note) => !note.isDeleted).length
    };
  }, [notes, tasks]);

  const cards = [
    {
      label: t('dashboard.completed_week'),
      value: stats.completedThisWeek,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      label: t('dashboard.focus_total'),
      value: formatFocusDuration(weeklyFocusSeconds),
      icon: Clock,
      color: 'text-indigo-600 dark:text-indigo-400'
    },
    {
      label: t('dashboard.completion_rate'),
      value: `%${stats.completionRate}`,
      icon: Flame,
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      label: t('dashboard.overdue'),
      value: stats.overdueTasks,
      icon: AlertTriangle,
      color: 'text-rose-600 dark:text-rose-400'
    },
    {
      label: t('stats.active_tasks'),
      value: stats.activeTasks,
      icon: ListChecks,
      color: 'text-sky-600 dark:text-sky-400'
    },
    {
      label: t('stats.notes_total'),
      value: stats.notes,
      icon: FileText,
      color: 'text-amber-600 dark:text-amber-400'
    }
  ];

  return (
    <div className="min-h-screen px-8 py-10 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
            {t('stats.title')}
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">{t('stats.subtitle')}</p>
        </div>

        <div className="rounded-[2rem] bg-zinc-900 p-6 text-white dark:bg-zinc-900 border border-zinc-800 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase text-zinc-400">
              {t('dashboard.weekly_overview')}
            </p>
            <p className="mt-2 text-lg font-semibold">
              {t('dashboard.streak_days', {
                count: stats.activeDaysThisWeek,
                unit: t('dashboard.days')
              })}
            </p>
          </div>
          <button
            onClick={() => onNavigate('tasks')}
            className="rounded-full bg-white px-4 py-2 text-sm font-bold text-zinc-900 transition-colors hover:bg-zinc-200"
          >
            {t('dashboard.review_tasks')}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="rounded-[1.5rem] bg-white p-6 border border-zinc-100 shadow-sm dark:bg-zinc-900 dark:border-zinc-800"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">
                    {card.label}
                  </span>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div className="text-4xl font-bold text-zinc-900 dark:text-white">{card.value}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
