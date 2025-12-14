import { useState, useEffect, useRef } from 'react';

export type TimerMode = 'work' | 'shortBreak' | 'longBreak';

interface PomodoroSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
  longBreakInterval: number;
}

interface PomodoroState {
  mode: TimerMode;
  timeLeft: number;
  isActive: boolean;
  cycles: number;
  settings: PomodoroSettings;
}

const DEFAULT_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  autoStartBreaks: false,
  autoStartWork: false,
  longBreakInterval: 4,
};

const getDefaultTimes = (settings: PomodoroSettings) => ({
  work: settings.workDuration * 60,
  shortBreak: settings.shortBreakDuration * 60,
  longBreak: settings.longBreakDuration * 60,
});

export const usePomodoro = () => {
  const [state, setState] = useState<PomodoroState>(() => {
    const saved = localStorage.getItem('pomodoroState');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        settings: { ...DEFAULT_SETTINGS, ...parsed.settings }
      };
    }
    return {
      mode: 'work',
      timeLeft: DEFAULT_SETTINGS.workDuration * 60,
      isActive: false,
      cycles: 0,
      settings: DEFAULT_SETTINGS
    };
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const DEFAULT_TIMES = getDefaultTimes(state.settings);

  // Save state to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('pomodoroState', JSON.stringify(state));
  }, [state]);

  // Timer logic
  useEffect(() => {
    if (state.isActive && state.timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setState((prev) => {
          if (prev.timeLeft <= 1) {
            // Timer finished within the interval
            if (intervalRef.current) clearInterval(intervalRef.current);
            
            // Play notification sound
            const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
            audio.play().catch(e => console.log('Audio play failed', e));

            // Determine next mode
            const times = getDefaultTimes(prev.settings);
            let nextMode: TimerMode = 'work';
            let shouldAutoStart = false;

            if (prev.mode === 'work') {
              const newCycles = prev.cycles + 1;
              if (newCycles % prev.settings.longBreakInterval === 0) {
                nextMode = 'longBreak';
              } else {
                nextMode = 'shortBreak';
              }
              shouldAutoStart = prev.settings.autoStartBreaks;
              return { 
                ...prev, 
                isActive: shouldAutoStart, 
                timeLeft: times[nextMode],
                mode: nextMode,
                cycles: newCycles
              };
            } else {
              nextMode = 'work';
              shouldAutoStart = prev.settings.autoStartWork;
              return { 
                ...prev, 
                isActive: shouldAutoStart, 
                timeLeft: times.work,
                mode: 'work'
              };
            }
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    } else {
       if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.isActive, state.mode]);

  const toggleTimer = () => {
    setState(prev => ({ ...prev, isActive: !prev.isActive }));
  };

  const resetTimer = () => {
    const times = getDefaultTimes(state.settings);
    setState(prev => ({
      ...prev,
      isActive: false,
      timeLeft: times[prev.mode]
    }));
  };

  const setMode = (mode: TimerMode) => {
    const times = getDefaultTimes(state.settings);
    setState(prev => ({
      ...prev,
      mode,
      isActive: false,
      timeLeft: times[mode]
    }));
  };

  const updateSettings = (newSettings: Partial<PomodoroSettings>) => {
    setState(prev => {
      const updatedSettings = { ...prev.settings, ...newSettings };
      const times = getDefaultTimes(updatedSettings);
      return {
        ...prev,
        settings: updatedSettings,
        timeLeft: times[prev.mode],
        isActive: false
      };
    });
  };

  const resetCycles = () => {
    setState(prev => ({ ...prev, cycles: 0 }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    ...state,
    toggleTimer,
    resetTimer,
    setMode,
    formatTime,
    updateSettings,
    resetCycles,
    progress: 1 - (state.timeLeft / DEFAULT_TIMES[state.mode])
  };
};
