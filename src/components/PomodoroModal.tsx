import React, { useState } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Zap,
  Brain,
  Settings,
  ChevronLeft,
  Minus,
  Plus,
  RotateCw
} from 'lucide-react';
import { usePomodoro, TimerMode } from '../hooks/usePomodoro';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';

interface PomodoroModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PomodoroModal: React.FC<PomodoroModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const {
    mode,
    timeLeft,
    isActive,
    formatTime,
    toggleTimer,
    resetTimer,
    setMode,
    progress,
    cycles,
    settings,
    updateSettings,
    resetCycles
  } = usePomodoro();

  const [showSettings, setShowSettings] = useState(false);

  if (!isOpen) return null;

  // Calculate ring stroke offset based on progress
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (1 - progress) * circumference;

  // Theme colors based on mode
  const getThemeColor = () => {
    switch (mode) {
      case 'work':
        return 'text-red-500 dark:text-red-400';
      case 'shortBreak':
        return 'text-emerald-500 dark:text-emerald-400';
      case 'longBreak':
        return 'text-blue-500 dark:text-blue-400';
      default:
        return 'text-gray-500';
    }
  };

  const getBgColor = () => {
    switch (mode) {
      case 'work':
        return 'bg-red-500 dark:bg-red-400';
      case 'shortBreak':
        return 'bg-emerald-500 dark:bg-emerald-400';
      case 'longBreak':
        return 'bg-blue-500 dark:bg-blue-400';
      default:
        return 'bg-gray-500';
    }
  };

  const getStrokeColor = () => {
    switch (mode) {
      case 'work':
        return '#ef4444';
      case 'shortBreak':
        return '#10b981';
      case 'longBreak':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  // Settings view
  if (showSettings) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
        <div
          className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <button
              onClick={() => setShowSettings(false)}
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              {t('pomodoro.settings_title')}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Duration Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                {t('pomodoro.durations')}
              </h3>

              {/* Work Duration */}
              <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl text-red-600 dark:text-red-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-zinc-900 dark:text-white">
                    {t('pomodoro.focus_duration')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateSettings({ workDuration: Math.max(1, settings.workDuration - 5) })
                    }
                    className="p-2 bg-white dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                  </button>
                  <span className="w-12 text-center font-mono font-bold text-lg text-zinc-900 dark:text-white">
                    {settings.workDuration}
                  </span>
                  <button
                    onClick={() =>
                      updateSettings({ workDuration: Math.min(120, settings.workDuration + 5) })
                    }
                    className="p-2 bg-white dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                  </button>
                </div>
              </div>

              {/* Short Break */}
              <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-zinc-900 dark:text-white">
                    {t('pomodoro.short_break')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateSettings({
                        shortBreakDuration: Math.max(1, settings.shortBreakDuration - 1)
                      })
                    }
                    className="p-2 bg-white dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                  </button>
                  <span className="w-12 text-center font-mono font-bold text-lg text-zinc-900 dark:text-white">
                    {settings.shortBreakDuration}
                  </span>
                  <button
                    onClick={() =>
                      updateSettings({
                        shortBreakDuration: Math.min(30, settings.shortBreakDuration + 1)
                      })
                    }
                    className="p-2 bg-white dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                  </button>
                </div>
              </div>

              {/* Long Break */}
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                    <Brain className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-zinc-900 dark:text-white">
                    {t('pomodoro.long_break')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateSettings({
                        longBreakDuration: Math.max(1, settings.longBreakDuration - 5)
                      })
                    }
                    className="p-2 bg-white dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                  </button>
                  <span className="w-12 text-center font-mono font-bold text-lg text-zinc-900 dark:text-white">
                    {settings.longBreakDuration}
                  </span>
                  <button
                    onClick={() =>
                      updateSettings({
                        longBreakDuration: Math.min(60, settings.longBreakDuration + 5)
                      })
                    }
                    className="p-2 bg-white dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Auto-start Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                {t('pomodoro.automation')}
              </h3>

              <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
                <div>
                  <span className="font-medium text-zinc-900 dark:text-white">
                    {t('pomodoro.auto_start_breaks')}
                  </span>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {t('pomodoro.auto_start_breaks_desc')}
                  </p>
                </div>
                <button
                  onClick={() => updateSettings({ autoStartBreaks: !settings.autoStartBreaks })}
                  className={cn(
                    'w-12 h-7 rounded-full p-1 transition-colors duration-300',
                    settings.autoStartBreaks ? 'bg-indigo-600' : 'bg-zinc-200 dark:bg-zinc-700'
                  )}
                >
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300',
                      settings.autoStartBreaks ? 'translate-x-5' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
                <div>
                  <span className="font-medium text-zinc-900 dark:text-white">
                    {t('pomodoro.auto_start_work')}
                  </span>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {t('pomodoro.auto_start_work_desc')}
                  </p>
                </div>
                <button
                  onClick={() => updateSettings({ autoStartWork: !settings.autoStartWork })}
                  className={cn(
                    'w-12 h-7 rounded-full p-1 transition-colors duration-300',
                    settings.autoStartWork ? 'bg-indigo-600' : 'bg-zinc-200 dark:bg-zinc-700'
                  )}
                >
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300',
                      settings.autoStartWork ? 'translate-x-5' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>

              {/* Long Break Interval */}
              <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl">
                <div>
                  <span className="font-medium text-zinc-900 dark:text-white">
                    {t('pomodoro.long_break_interval')}
                  </span>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {t('pomodoro.long_break_interval_desc')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateSettings({
                        longBreakInterval: Math.max(2, settings.longBreakInterval - 1)
                      })
                    }
                    className="p-2 bg-white dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                  </button>
                  <span className="w-8 text-center font-mono font-bold text-lg text-zinc-900 dark:text-white">
                    {settings.longBreakInterval}
                  </span>
                  <button
                    onClick={() =>
                      updateSettings({
                        longBreakInterval: Math.min(10, settings.longBreakInterval + 1)
                      })
                    }
                    className="p-2 bg-white dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main timer view
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden scale-100 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between">
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
            title={t('common.settings')}
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col items-center pt-14 pb-8 px-8">
          {/* Cycle Counter */}
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              {t('pomodoro.completed_cycles', { count: cycles })}
            </span>
            {cycles > 0 && (
              <button
                onClick={resetCycles}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                title={t('common.reset')}
              >
                <RotateCw className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Timer Display with SVG Ring */}
          <div className="relative mb-10 group cursor-default">
            {/* Background Ring */}
            <svg
              className="w-64 h-64"
              viewBox="0 0 260 260"
              style={{ transform: 'rotate(-90deg)' }}
            >
              <circle
                cx="130"
                cy="130"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-gray-100 dark:text-zinc-800"
              />
              {/* Progress Ring */}
              <circle
                cx="130"
                cy="130"
                r={radius}
                fill="none"
                stroke={getStrokeColor()}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>

            {/* Time Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div
                className={`text-5xl font-mono font-bold tracking-tighter tabular-nums text-gray-900 dark:text-white mb-2 ${isActive ? 'animate-pulse' : ''}`}
                style={{ animationDuration: '2s' }}
              >
                {formatTime(timeLeft)}
              </div>
              <div
                className={`text-xs font-bold uppercase tracking-[0.2em] ${getThemeColor()} opacity-80`}
              >
                {mode === 'work'
                  ? t('pomodoro.focus')
                  : mode === 'shortBreak'
                    ? t('pomodoro.short')
                    : t('pomodoro.long')}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 mb-10">
            <button
              onClick={resetTimer}
              className="w-14 h-14 flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              title={t('common.reset')}
            >
              <RotateCcw className="w-6 h-6" />
            </button>

            <button
              onClick={toggleTimer}
              className={`
                w-20 h-20 flex items-center justify-center rounded-[2rem] 
                text-white 
                transition-all duration-300 hover:scale-105 active:scale-95
                ${getBgColor()}
              `}
            >
              {isActive ? (
                <Pause className="w-8 h-8 fill-current" />
              ) : (
                <Play className="w-8 h-8 fill-current ml-1" />
              )}
            </button>
          </div>

          {/* Mode Segmented Control */}
          <div className="flex p-1.5 bg-gray-100 dark:bg-zinc-800/80 rounded-2xl w-full">
            {[
              { id: 'work', label: t('pomodoro.mode_focus'), icon: Zap },
              { id: 'shortBreak', label: t('pomodoro.mode_short'), icon: Coffee },
              { id: 'longBreak', label: t('pomodoro.mode_long'), icon: Brain }
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = mode === m.id;

              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id as TimerMode)}
                  className={`
                    flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${
                      isSelected
                        ? 'bg-white dark:bg-zinc-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? getThemeColor() : ''}`} />
                  {m.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
