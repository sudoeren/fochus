import React, { useState, useEffect } from 'react';
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
import { setupFastPolling } from './utils/refreshUtils';
import { cn } from './lib/utils';
import { authAPI, getAuthToken, setAuthToken } from './services/api';

const App: React.FC = () => {
  const { isDark } = useTheme();
  const [activeView, setActiveView] = useState(
    () => localStorage.getItem('activeView') || 'dashboard'
  );

  useEffect(() => {
    localStorage.setItem('activeView', activeView);
  }, [activeView]);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showPomodoroModal, setShowPomodoroModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
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
      const uid = (me as any)?.id ?? null;
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
        const uid = (me as any)?.id ?? null;
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

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const closeTaskModal = () => {
    setShowTaskModal(false);
    setEditingTask(null);
  };

  useEffect(() => {
    setupFastPolling();

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      const isInputActive = activeTag === 'input' || activeTag === 'textarea';

      // ESC key to close modals
      if (e.key === 'Escape') {
        if (isSpotlightOpen) {
          setIsSpotlightOpen(false);
          return;
        }
        if (showNoteModal) {
          setShowNoteModal(false);
          return;
        }
        if (showTaskModal) {
          closeTaskModal();
          return;
        }
        if (showPomodoroModal) {
          setShowPomodoroModal(false);
          return;
        }
      }

      if (isSpotlightEnabled && e.key === '/' && !isInputActive) {
        e.preventDefault();
        setIsSpotlightOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setShowNoteModal(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 't') {
        e.preventDefault();
        setShowTaskModal(true);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [isSpotlightOpen, showNoteModal, showTaskModal, showPomodoroModal, isSpotlightEnabled]);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard
            onNavigate={setActiveView}
            onOpenNoteModal={() => setShowNoteModal(true)}
            onOpenTaskModal={() => setShowTaskModal(true)}
            onEditTask={handleEditTask}
            onOpenSpotlight={() => setIsSpotlightOpen(true)}
            onOpenPomodoro={() => setShowPomodoroModal(true)}
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
              setActiveView('dashboard');
              setEditingNoteId(undefined);
            }}
          />
        );
      case 'notes':
        return (
          <Notes
            onOpenNoteModal={() => setShowNoteModal(true)}
            onEditNote={(id) => {
              setEditingNoteId(id);
              setActiveView('note-editor');
            }}
          />
        );
      case 'tasks':
        return (
          <TasksWithLists
            onOpenTaskModal={() => setShowTaskModal(true)}
            onEditTask={handleEditTask}
          />
        );
      // case 'stats': removed
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
            onNavigate={setActiveView}
            onOpenNoteModal={() => setShowNoteModal(true)}
            onOpenTaskModal={() => setShowTaskModal(true)}
            bgImage={bgImage}
            onBgChange={handleBgChange}
          />
        );
    }
  };

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
        onViewChange={setActiveView}
        onOpenSpotlight={() => setIsSpotlightOpen(true)}
        onOpenNoteModal={() => setShowNoteModal(true)}
        onOpenTaskModal={() => setShowTaskModal(true)}
        onOpenPomodoro={() => setShowPomodoroModal(true)}
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
          onClose={() => setIsSpotlightOpen(false)}
          onNavigate={setActiveView}
          onOpenNoteModal={() => setShowNoteModal(true)}
          onOpenTaskModal={() => setShowTaskModal(true)}
          onOpenPomodoro={() => setShowPomodoroModal(true)}
        />
      )}

      {/* Modals */}
      {showNoteModal && (
        <NewNoteWindow
          isOpen={showNoteModal}
          onClose={() => setShowNoteModal(false)}
          onExpand={(id) => {
            setEditingNoteId(id);
            setActiveView('note-editor');
            setShowNoteModal(false);
          }}
        />
      )}

      {showTaskModal && (
        <NewTaskWindow isOpen={showTaskModal} onClose={closeTaskModal} initialData={editingTask} />
      )}

      {showPomodoroModal && (
        <PomodoroModal isOpen={showPomodoroModal} onClose={() => setShowPomodoroModal(false)} />
      )}
    </div>
  );
};

export default App;
