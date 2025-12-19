import { useSyncExternalStore } from 'react';
import { pomodoroAPI } from '../services/api';

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
  longBreakInterval: 4
};

const getDefaultTimes = (settings: PomodoroSettings) => ({
  work: settings.workDuration * 60,
  shortBreak: settings.shortBreakDuration * 60,
  longBreak: settings.longBreakDuration * 60
});

const loadInitialState = (): PomodoroState => {
  try {
    const saved = localStorage.getItem('pomodoroState');
    if (saved) {
      const parsed = JSON.parse(saved);
      const settings = { ...DEFAULT_SETTINGS, ...(parsed?.settings ?? {}) };
      const times = getDefaultTimes(settings);
      const mode: TimerMode = parsed?.mode ?? 'work';
      const timeLeft = typeof parsed?.timeLeft === 'number' ? parsed.timeLeft : times[mode];
      return {
        mode,
        timeLeft: Math.max(0, timeLeft),
        isActive: Boolean(parsed?.isActive ?? false),
        cycles: typeof parsed?.cycles === 'number' ? parsed.cycles : 0,
        settings
      };
    }
  } catch {
    // ignore
  }

  return {
    mode: 'work',
    timeLeft: DEFAULT_SETTINGS.workDuration * 60,
    isActive: false,
    cycles: 0,
    settings: DEFAULT_SETTINGS
  };
};

let storeState: PomodoroState = loadInitialState();
const listeners = new Set<() => void>();
let intervalId: ReturnType<typeof setInterval> | null = null;

const persist = () => {
  try {
    localStorage.setItem('pomodoroState', JSON.stringify(storeState));
  } catch {
    // ignore
  }
};

const emitChange = () => {
  for (const listener of listeners) listener();
};

const stopIntervalIfNeeded = () => {
  if (intervalId && (!storeState.isActive || storeState.timeLeft <= 0)) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

const startIntervalIfNeeded = () => {
  if (!intervalId && storeState.isActive && storeState.timeLeft > 0) {
    intervalId = setInterval(() => {
      tick();
    }, 1000);
  }
};

const setStoreState = (updater: (prev: PomodoroState) => PomodoroState) => {
  storeState = updater(storeState);
  persist();
  emitChange();
  startIntervalIfNeeded();
  stopIntervalIfNeeded();
};

const recordCompletedSession = (prev: PomodoroState) => {
  try {
    const times = getDefaultTimes(prev.settings);
    const endTime = new Date();
    const duration = times[prev.mode];
    const startTime = new Date(endTime.getTime() - duration * 1000);
    pomodoroAPI
      .create({
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration,
        mode: prev.mode,
        completed: true
      })
      .catch(() => {
        // ignore
      });
  } catch {
    // ignore
  }
};

const playFinishSound = () => {
  try {
    const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
    audio.play().catch(() => {
      // ignore
    });
  } catch {
    // ignore
  }
};

const tick = () => {
  const prev = storeState;
  if (!prev.isActive) return;

  if (prev.timeLeft <= 1) {
    playFinishSound();
    recordCompletedSession(prev);

    const times = getDefaultTimes(prev.settings);

    if (prev.mode === 'work') {
      const newCycles = prev.cycles + 1;
      const nextMode: TimerMode =
        newCycles % prev.settings.longBreakInterval === 0 ? 'longBreak' : 'shortBreak';
      const shouldAutoStart = prev.settings.autoStartBreaks;
      setStoreState(() => ({
        ...prev,
        cycles: newCycles,
        mode: nextMode,
        timeLeft: times[nextMode],
        isActive: shouldAutoStart
      }));
      return;
    }

    const shouldAutoStart = prev.settings.autoStartWork;
    setStoreState(() => ({
      ...prev,
      mode: 'work',
      timeLeft: times.work,
      isActive: shouldAutoStart
    }));
    return;
  }

  setStoreState((current) => ({
    ...current,
    timeLeft: Math.max(0, current.timeLeft - 1)
  }));
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getSnapshot = () => storeState;

export const usePomodoro = () => {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const toggleTimer = () => {
    setStoreState((prev) => {
      const next = { ...prev, isActive: !prev.isActive };
      return next;
    });
  };

  const resetTimer = () => {
    setStoreState((prev) => {
      const times = getDefaultTimes(prev.settings);
      return {
        ...prev,
        isActive: false,
        timeLeft: times[prev.mode]
      };
    });
  };

  const setMode = (mode: TimerMode) => {
    setStoreState((prev) => {
      const times = getDefaultTimes(prev.settings);
      return {
        ...prev,
        mode,
        isActive: false,
        timeLeft: times[mode]
      };
    });
  };

  const updateSettings = (newSettings: Partial<PomodoroSettings>) => {
    setStoreState((prev) => {
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
    setStoreState((prev) => ({ ...prev, cycles: 0 }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const times = getDefaultTimes(state.settings);
  const denom = times[state.mode] || 1;
  const progress = 1 - state.timeLeft / denom;

  return {
    ...state,
    toggleTimer,
    resetTimer,
    setMode,
    formatTime,
    updateSettings,
    resetCycles,
    progress: Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0
  };
};

// If state was persisted as active, resume ticking.
startIntervalIfNeeded();
stopIntervalIfNeeded();
