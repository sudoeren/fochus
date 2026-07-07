import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, SidebarMode } from './components/Sidebar';
import { useTheme } from './components/ThemeProvider';
import { Spotlight } from './components/Spotlight';
import { NewNoteWindow } from './components/NewNoteWindow';
import { NewTaskWindow } from './components/NewTaskWindow';
import { PomodoroModal } from './components/PomodoroModal';
import { OnboardingPage } from './pages/OnboardingPage';
import { Dashboard } from './pages/Dashboard';
import { Stats } from './pages/Stats';
import { Notes } from './pages/Notes';
import { TasksWithLists } from './pages/TasksWithLists';
import { Settings } from './pages/Settings';
import { Trash } from './pages/Trash';
import { Login } from './pages/Login';
import { NoteEditorPage } from './pages/NoteEditorPage';
import { cn } from './lib/utils';
import { useTranslation } from 'react-i18next';
import { authAPI, tasksAPI, getAuthToken, setAuthToken } from './services/api';
import { notificationService } from './services/NotificationService';
import { useIsMobile } from './hooks/useIsMobile';
import { MobileRestricted } from './pages/MobileRestricted';
import type { Task } from './types/index';

const NOTIFIED_REMINDERS_KEY = 'fochus_notified_reminders';
const REMINDER_NOTICE_SNOOZE_UNTIL_KEY = 'fochus_reminder_notice_snooze_until';

const loadNotifiedReminders = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(NOTIFIED_REMINDERS_KEY) || '[]');
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set<string>();
  }
};

const saveNotifiedReminders = (ids: Set<string>) => {
  localStorage.setItem(NOTIFIED_REMINDERS_KEY, JSON.stringify([...ids].slice(-250)));
};

const isReminderNoticeSnoozed = () => {
  const until = Number(localStorage.getItem(REMINDER_NOTICE_SNOOZE_UNTIL_KEY) || 0);
  return Number.isFinite(until) && Date.now() < until;
};

interface ReminderNotice {
  count: number;
  latestTitle: string;
}

const App: React.FC = () => {
  const isMobile = useIsMobile();
  const { isDark } = useTheme();
  const { t } = useTranslation();

  const [activeView, setActiveView] = useState(() => {
    const hash = window.location.hash.slice(1).split('?')[0];
    if (
      hash &&
      ['dashboard', 'stats', 'notes', 'tasks', 'settings', 'trash', 'note-editor'].includes(hash)
    ) {
      return hash;
    }
    return localStorage.getItem('activeView') || 'dashboard';
  });

  useEffect(() => {
    localStorage.setItem('activeView', activeView);
  }, [activeView]);

  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showPomodoroModal, setShowPomodoroModal] = useState(false);

  // Navigation Handlers
  const handleNavigate = useCallback(
    (view: string) => {
      if (view === activeView) return;
      window.history.pushState(null, '', `#${view}`);
      setActiveView(view);
      setShowNoteModal(false);
      setShowTaskModal(false);
      setShowPomodoroModal(false);
      setIsSpotlightOpen(false);
    },
    [activeView]
  );

  const handleOpenModal = useCallback(
    (modalName: string) => {
      const currentHash = window.location.hash.slice(1).split('?')[0] || activeView;
      window.history.pushState({ modal: modalName }, '', `#${currentHash}?modal=${modalName}`);

      if (modalName === 'note') setShowNoteModal(true);
      if (modalName === 'task') setShowTaskModal(true);
      if (modalName === 'pomodoro') setShowPomodoroModal(true);
      if (modalName === 'spotlight') setIsSpotlightOpen(true);
    },
    [activeView]
  );

  const handleCloseModal = useCallback(() => {
    if (window.history.state?.modal) {
      window.history.back();
    } else {
      const hash = window.location.hash.slice(1).split('?')[0] || activeView;
      window.history.replaceState(null, '', `#${hash}`);
      setShowNoteModal(false);
      setShowTaskModal(false);
      setShowPomodoroModal(false);
      setIsSpotlightOpen(false);
    }
  }, [activeView]);

  // Sync Effect
  useEffect(() => {
    const handleStateChange = () => {
      const hash = window.location.hash.slice(1);
      const [view, query] = hash.split('?');
      const params = new URLSearchParams(query);
      const modal = params.get('modal');

      if (
        ['dashboard', 'stats', 'notes', 'tasks', 'settings', 'trash', 'note-editor'].includes(view)
      ) {
        setActiveView(view);
      }

      setShowNoteModal(modal === 'note');
      setShowTaskModal(modal === 'task');
      setShowPomodoroModal(modal === 'pomodoro');
      setIsSpotlightOpen(modal === 'spotlight');
    };

    window.addEventListener('popstate', handleStateChange);
    window.addEventListener('hashchange', handleStateChange);

    // Initial sync
    handleStateChange();

    return () => {
      window.removeEventListener('popstate', handleStateChange);
      window.removeEventListener('hashchange', handleStateChange);
    };
  }, []);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [editingNoteId, setEditingNoteId] = useState<string | undefined>(undefined);
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getAuthToken()));
  const [authChecked, setAuthChecked] = useState(() => !getAuthToken());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [reminderNotice, setReminderNotice] = useState<ReminderNotice | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() =>
    notificationService.getPermission()
  );

  // Background Image State - Default to 'default' which adapts to theme
  const [bgImage, setBgImage] = useState(() => localStorage.getItem('bgImage') || 'default');
  // Global Background State
  const [isGlobalBg, setIsGlobalBg] = useState(() => localStorage.getItem('isGlobalBg') === 'true');
  // Spotlight Enabled State
  const [isSpotlightEnabled, setIsSpotlightEnabled] = useState(() => {
    const stored = localStorage.getItem('isSpotlightEnabled');
    return stored === null ? true : stored === 'true';
  });

  // Sidebar mode state for main content adjustment
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>(() => {
    const saved = localStorage.getItem('sidebarMode');
    return (saved as SidebarMode) || 'open';
  });

  const [sidebarHoverExpanded, setSidebarHoverExpanded] = useState(false);

  useEffect(() => {
    localStorage.setItem('sidebarMode', sidebarMode);
  }, [sidebarMode]);

  // Persist background choice
  const handleBgChange = (newBg: string) => {
    setBgImage(newBg);
    localStorage.setItem('bgImage', newBg);
  };

  const handleGlobalBgToggle = (enabled: boolean) => {
    setIsGlobalBg(enabled);
    localStorage.setItem('isGlobalBg', String(enabled));
  };

  const handleSpotlightToggle = (enabled: boolean) => {
    setIsSpotlightEnabled(enabled);
    localStorage.setItem('isSpotlightEnabled', String(enabled));
  };

  const checkOnboarding = (uid: string) => {
    const pending = localStorage.getItem('fokus_onboarding_pending') === 'true';
    const doneKey = `fokus_onboarding_done_${uid}`;
    const done = localStorage.getItem(doneKey) === 'true';

    if (pending && !done) {
      setShowOnboarding(true);
    }
  };

  const handleLogin = async () => {
    const token = getAuthToken();
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    try {
      const me = await authAPI.me();
      setIsAuthenticated(true);
      const uid = (me as { id?: string })?.id ?? null;
      setCurrentUserId(uid);
      setAuthChecked(true);

      if (uid) checkOnboarding(uid);
    } catch {
      setAuthToken(null);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    const handleLogout = () => {
      setAuthToken(null);
      setIsAuthenticated(false);
      setActiveView('dashboard');
    };

    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      return;
    }

    authAPI
      .me()
      .then((me) => {
        setIsAuthenticated(true);
        const uid = (me as { id?: string })?.id ?? null;
        setCurrentUserId(uid);
        if (uid) checkOnboarding(uid);
      })
      .catch(() => {
        setAuthToken(null);
        setIsAuthenticated(false);
        setCurrentUserId(null);
      })
      .finally(() => {
        setAuthChecked(true);
      });
  }, []);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    handleOpenModal('task');
  };

  useEffect(() => {
    if (!showTaskModal) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditingTask(undefined);
    }
  }, [showTaskModal]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      const isInputActive = activeTag === 'input' || activeTag === 'textarea';

      // ESC key to close modals
      if (e.key === 'Escape') {
        if (isSpotlightOpen || showNoteModal || showTaskModal || showPomodoroModal) {
          handleCloseModal();
          return;
        }
      }

      if (isSpotlightEnabled && e.key === '/' && !isInputActive) {
        e.preventDefault();
        setIsSpotlightOpen(true);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [
    isSpotlightOpen,
    showNoteModal,
    showTaskModal,
    showPomodoroModal,
    isSpotlightEnabled,
    handleCloseModal
  ]);

  // Reminder polling
  useEffect(() => {
    if (!isAuthenticated || !getAuthToken()) return;

    let cancelled = false;
    const notified = loadNotifiedReminders();

    const checkReminders = async () => {
      try {
        const tasks = (await tasksAPI.getAll()) as Array<Record<string, unknown>>;
        const now = new Date();
        const dueTasks = tasks.filter((task) => {
          const id = typeof task.id === 'string' ? task.id : '';
          return (
            id &&
            task.hasReminder &&
            task.reminderAt &&
            !task.isCompleted &&
            !notified.has(id) &&
            new Date(task.reminderAt as string) <= now
          );
        });

        if (dueTasks.length === 0 || cancelled) return;

        const permission = notificationService.getPermission();
        setNotificationPermission(permission);

        if (permission === 'granted') {
          for (const task of dueTasks) {
            const id = String(task.id);
            const title = String(task.title ?? t('notifications.reminder'));
            const reminderAt = task.reminderAt ? new Date(String(task.reminderAt)) : undefined;
            await notificationService.showTaskReminder(title, reminderAt);
            notified.add(id);
          }
          saveNotifiedReminders(notified);
          setReminderNotice(null);
          return;
        }

        if (!isReminderNoticeSnoozed()) {
          setReminderNotice({
            count: dueTasks.length,
            latestTitle: String(dueTasks[0].title ?? t('notifications.reminder'))
          });
        }
      } catch {
        // ignore
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60000);
    window.addEventListener('focus', checkReminders);

    return () => {
      cancelled = true;
      window.removeEventListener('focus', checkReminders);
      clearInterval(interval);
    };
  }, [isAuthenticated, t]);

  const handleEnableReminderNotifications = async () => {
    const granted = await notificationService.requestPermission();
    setNotificationPermission(notificationService.getPermission());
    if (granted) {
      setReminderNotice(null);
      localStorage.removeItem(REMINDER_NOTICE_SNOOZE_UNTIL_KEY);
    }
  };

  const handleDismissReminderNotice = () => {
    localStorage.setItem(REMINDER_NOTICE_SNOOZE_UNTIL_KEY, String(Date.now() + 10 * 60 * 1000));
    setReminderNotice(null);
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard
            onNavigate={handleNavigate}
            onOpenNoteModal={() => handleOpenModal('note')}
            onOpenTaskModal={() => handleOpenModal('task')}
            onEditTask={handleEditTask}
            onOpenSpotlight={() => handleOpenModal('spotlight')}
            onOpenPomodoro={() => handleOpenModal('pomodoro')}
            bgImage={bgImage}
            onBgChange={handleBgChange}
          />
        );
      case 'note-editor':
        return (
          <NoteEditorPage
            key={editingNoteId}
            noteId={editingNoteId}
            onBack={() => {
              handleNavigate('dashboard');
              setEditingNoteId(undefined);
            }}
          />
        );
      case 'stats':
        return <Stats onNavigate={handleNavigate} />;
      case 'notes':
        return (
          <Notes
            onOpenNoteModal={() => handleOpenModal('note')}
            onEditNote={(id) => {
              setEditingNoteId(id);
              handleNavigate('note-editor');
            }}
          />
        );
      case 'tasks':
        return (
          <TasksWithLists
            onOpenTaskModal={() => handleOpenModal('task')}
            onEditTask={handleEditTask}
          />
        );
      case 'trash':
        return <Trash />;
      case 'settings':
        return (
          <Settings
            bgImage={bgImage}
            onBgChange={handleBgChange}
            isGlobalBg={isGlobalBg}
            onToggleGlobalBg={handleGlobalBgToggle}
            isSpotlightEnabled={isSpotlightEnabled}
            onToggleSpotlight={handleSpotlightToggle}
          />
        );
      default:
        return (
          <Dashboard
            onNavigate={handleNavigate}
            onOpenNoteModal={() => handleOpenModal('note')}
            onOpenTaskModal={() => handleOpenModal('task')}
            bgImage={bgImage}
            onBgChange={handleBgChange}
          />
        );
    }
  };

  // Mobile Check
  if (isMobile) {
    return <MobileRestricted />;
  }

  if (!authChecked && getAuthToken()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="w-8 h-8 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  if (showOnboarding) {
    return (
      <OnboardingPage
        onBackgroundChange={handleBgChange}
        onGlobalBgChange={handleGlobalBgToggle}
        onComplete={() => {
          if (currentUserId) {
            localStorage.setItem(`fokus_onboarding_done_${currentUserId}`, 'true');
          }
          localStorage.removeItem('fokus_onboarding_pending');
          setShowOnboarding(false);
        }}
      />
    );
  }

  const isCustomBg =
    bgImage.startsWith('data:') || bgImage.startsWith('http') || bgImage.startsWith('blob:');
  const showBackground = isGlobalBg;

  // Determine which background to show based on theme if default
  const showLightBg = bgImage === 'light' || (bgImage === 'default' && !isDark);
  const showDarkBg = bgImage === 'dark' || (bgImage === 'default' && isDark);

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-black text-zinc-900 dark:text-zinc-100 flex overflow-hidden">
      {/* GLOBAL BACKGROUND IMAGE */}
      {showBackground && (
        <div className="fixed inset-0 z-0 pointer-events-none">
          {isCustomBg ? (
            <img
              src={bgImage}
              alt="Custom Background"
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 opacity-100"
            />
          ) : (
            <>
              <img
                src="/light.png"
                alt="Background"
                className={cn(
                  'absolute inset-0 w-full h-full object-cover transition-opacity duration-500',
                  showLightBg ? 'opacity-100' : 'opacity-0'
                )}
              />
              <img
                src="/dark.png"
                alt="Background"
                className={cn(
                  'absolute inset-0 w-full h-full object-cover transition-opacity duration-500',
                  showDarkBg ? 'opacity-100' : 'opacity-0'
                )}
              />
            </>
          )}
          {/* Overlay for readability */}
          <div className="absolute inset-0 bg-white/30 dark:bg-black/40 backdrop-blur-[2px]" />
        </div>
      )}

      {/* Floating Sidebar (Fixed Position) */}
      <Sidebar
        activeView={activeView}
        onViewChange={handleNavigate}
        onOpenSpotlight={() => handleOpenModal('spotlight')}
        onOpenNoteModal={() => handleOpenModal('note')}
        onOpenTaskModal={() => handleOpenModal('task')}
        onOpenPomodoro={() => handleOpenModal('pomodoro')}
        sidebarMode={sidebarMode}
        onSidebarModeChange={(mode) => {
          setSidebarMode(mode);
          if (mode !== 'hover') setSidebarHoverExpanded(false);
        }}
        onSidebarHoverExpandedChange={setSidebarHoverExpanded}
      />

      {/* Main Content Area - With Padding for Sidebar */}
      <main
        className={cn(
          'relative z-10 flex-1 min-h-screen transition-all duration-300 overflow-y-auto',
          sidebarMode === 'open'
            ? 'lg:pl-[320px]'
            : sidebarMode === 'hover'
              ? sidebarHoverExpanded
                ? 'lg:pl-[320px]'
                : 'lg:pl-[96px]'
              : 'lg:pl-4'
        )}
      >
        {renderView()}
      </main>

      {/* Spotlight */}
      {isSpotlightOpen && (
        <Spotlight
          isOpen={isSpotlightOpen}
          onClose={handleCloseModal}
          onNavigate={handleNavigate}
          onOpenNoteModal={() => handleOpenModal('note')}
          onOpenTaskModal={() => handleOpenModal('task')}
          onOpenPomodoro={() => handleOpenModal('pomodoro')}
        />
      )}

      {/* Modals */}
      {showNoteModal && (
        <NewNoteWindow
          isOpen={showNoteModal}
          onClose={handleCloseModal}
          onExpand={(id) => {
            setEditingNoteId(id);
            handleNavigate('note-editor');
          }}
        />
      )}

      {showTaskModal && (
        <NewTaskWindow
          isOpen={showTaskModal}
          onClose={handleCloseModal}
          initialData={editingTask as Partial<Task>}
        />
      )}

      {showPomodoroModal && <PomodoroModal isOpen={showPomodoroModal} onClose={handleCloseModal} />}

      {reminderNotice && (
        <div className="fixed bottom-6 right-6 z-50 w-[min(360px,calc(100vw-32px))] rounded-2xl border border-amber-200 bg-white p-4 shadow-2xl shadow-zinc-900/20 dark:border-amber-500/30 dark:bg-zinc-900">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-zinc-900 dark:text-white">
                {t('notifications.missed_title', { count: reminderNotice.count })}
              </p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                {t('notifications.missed_desc', { title: reminderNotice.latestTitle })}
              </p>
              {notificationPermission !== 'denied' && notificationService.isAvailable() && (
                <button
                  onClick={handleEnableReminderNotifications}
                  className="mt-3 rounded-full bg-zinc-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  {t('notifications.enable')}
                </button>
              )}
            </div>
            <button
              onClick={handleDismissReminderNotice}
              className="rounded-full p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-white"
              aria-label={t('common.close')}
            >
              x
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
