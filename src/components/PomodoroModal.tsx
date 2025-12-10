import React from 'react';
import { X, Play, Pause, RotateCcw, Coffee, Zap, Brain } from 'lucide-react';
import { usePomodoro, TimerMode } from '../hooks/usePomodoro';

interface PomodoroModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PomodoroModal: React.FC<PomodoroModalProps> = ({ isOpen, onClose }) => {
  const { 
    mode, 
    timeLeft, 
    isActive, 
    formatTime, 
    toggleTimer, 
    resetTimer, 
    setMode,
    progress 
  } = usePomodoro();

  if (!isOpen) return null;

  // Calculate ring stroke offset based on progress
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (1 - progress) * circumference;

  // Theme colors based on mode
  const getThemeColor = () => {
    switch (mode) {
      case 'work': return 'text-red-500 dark:text-red-400';
      case 'shortBreak': return 'text-emerald-500 dark:text-emerald-400';
      case 'longBreak': return 'text-blue-500 dark:text-blue-400';
      default: return 'text-gray-500';
    }
  };

  const getBgColor = () => {
    switch (mode) {
      case 'work': return 'bg-red-500 dark:bg-red-400';
      case 'shortBreak': return 'bg-emerald-500 dark:bg-emerald-400';
      case 'longBreak': return 'bg-blue-500 dark:bg-blue-400';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden scale-100 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col items-center pt-12 pb-8 px-8">
          
          {/* Timer Display with SVG Ring */}
          <div className="relative mb-10 group cursor-default">
            {/* Background Ring */}
            <svg className="w-72 h-72 transform -rotate-90" viewBox="0 0 260 260">
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
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className={`${getThemeColor()} transition-all duration-1000 ease-linear`}
              />
            </svg>

            {/* Time Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className={`text-6xl font-mono font-bold tracking-tighter tabular-nums text-gray-900 dark:text-white mb-2 ${isActive ? 'animate-pulse' : ''}`} style={{ animationDuration: '2s' }}>
                {formatTime(timeLeft)}
              </div>
              <div className={`text-sm font-medium uppercase tracking-widest ${getThemeColor()} opacity-80`}>
                {mode === 'work' ? 'ODAKLAN' : mode === 'shortBreak' ? 'KISA MOLA' : 'UZUN MOLA'}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6 mb-10">
            <button
              onClick={resetTimer}
              className="p-4 rounded-full text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all"
              title="Sıfırla"
            >
              <RotateCcw className="w-6 h-6" />
            </button>

            <button
              onClick={toggleTimer}
              className={`
                w-20 h-20 flex items-center justify-center rounded-[2rem] 
                text-white shadow-xl shadow-gray-200 dark:shadow-none 
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

            {/* Placeholder for balance */}
            <div className="w-14 h-14" /> 
          </div>

          {/* Mode Segmented Control */}
          <div className="flex p-1.5 bg-gray-100 dark:bg-zinc-800/80 rounded-2xl w-full">
            {[
              { id: 'work', label: 'Odak', icon: Zap },
              { id: 'shortBreak', label: 'Kısa', icon: Coffee },
              { id: 'longBreak', label: 'Uzun', icon: Brain },
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = mode === m.id;
              
              return (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id as TimerMode)}
                  className={`
                    flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${isSelected 
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