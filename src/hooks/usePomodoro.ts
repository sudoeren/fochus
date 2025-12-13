import { useState, useEffect, useRef } from 'react';

export type TimerMode = 'work' | 'shortBreak' | 'longBreak';

interface PomodoroState {
  mode: TimerMode;
  timeLeft: number;
  isActive: boolean;
  cycles: number;
}

const DEFAULT_TIMES = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export const usePomodoro = () => {
  const [state, setState] = useState<PomodoroState>(() => {
    const saved = localStorage.getItem('pomodoroState');
    return saved ? JSON.parse(saved) : {
      mode: 'work',
      timeLeft: DEFAULT_TIMES.work,
      isActive: false,
      cycles: 0
    };
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Save state to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('pomodoroState', JSON.stringify(state));
  }, [state]);

  // Timer logic
  useEffect(() => {
    if (state.isActive && state.timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setState((prev) => {
          if (prev.timeLeft <= 0) {
            // Timer finished within the interval
            if (intervalRef.current) clearInterval(intervalRef.current);
            
            // Play notification sound
            const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
            audio.play().catch(e => console.log('Audio play failed', e));

            return { 
              ...prev, 
              isActive: false, 
              timeLeft: 0,
              cycles: prev.mode === 'work' ? prev.cycles + 1 : prev.cycles 
            };
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
    setState(prev => ({
      ...prev,
      isActive: false,
      timeLeft: DEFAULT_TIMES[prev.mode]
    }));
  };

  const setMode = (mode: TimerMode) => {
    setState(prev => ({
      ...prev,
      mode,
      isActive: false,
      timeLeft: DEFAULT_TIMES[mode]
    }));
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
    progress: 1 - (state.timeLeft / DEFAULT_TIMES[state.mode])
  };
};
