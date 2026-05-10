import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, SidebarMode } from './components/Sidebar';
import { useTheme } from './components/ThemeProvider';
import { Spotlight } from './components/Spotlight';
import { NewNoteWindow } from './components/NewNoteWindow';
import { NewTaskWindow } from './components/NewTaskWindow';
import { PomodoroModal } from './components/PomodoroModal';
import { OnboardingPage } from './pages/OnboardingPage';
import { Dashboard } from './pages/Dashboard';
import { Notes } from './pages/Notes';
import { TasksWithLists } from './pages/TasksWithLists';
import { Settings } from './pages/Settings';
import { Trash } from './pages/Trash';
import { Login } from './pages/Login';
import { NoteEditorPage } from './pages/NoteEditorPage';
import { cn } from './lib/utils';
import { useTranslation } from 'react-i18next';
import { authAPI, tasksAPI, getAuthToken, setAuthToken } from './services/api';
import { useIsMobile } from './hooks/useIsMobile';
import { MobileRestricted } from './pages/MobileRestricted';
import type { Task } from './types/index';

const App: React.FC = () => {
  const isMobile = useIsMobile();
  const { isDark } = useTheme();
  const { t } = useTranslation();

  const [activeView, setActiveView] = useState(() => {
    const hash = window.location.hash.slice(1).split('?')[0];
    if (
      hash &&
      ['dashboard', 'notes', 'tasks', 'settings', 'trash', 'note-editor'].includes(hash)
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

      if (['dashboard', 'notes', 'tasks', 'settings', 'trash', 'note-editor'].includes(view)) {
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
    if (!getAuthToken()) return;
    const notified = new Set<string>();
    const interval = setInterval(async () => {
      try {
        const tasks = (await tasksAPI.getAll()) as Array<Record<string, unknown>>;
        const now = new Date();
        for (const task of tasks) {
          if (
            task.hasReminder &&
            task.reminderAt &&
            !task.isCompleted &&
            !notified.has(task.id as string) &&
            new Date(task.reminderAt as string) <= now
          ) {
            notified.add(task.id as string);
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(task.title as string, {
                body: t('notifications.reminder'),
                icon: '/logo.svg'
              });
            }
          }
        }
      } catch {
        // ignore
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [t]);

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
  const showBackground = isGlobalBg || activeView === 'dashboard';

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
    </div>
  );
};

export default App;
