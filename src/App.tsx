import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ThemeProvider } from './components/ThemeProvider';
import { Spotlight } from './components/Spotlight';
import { NewNoteWindow } from './components/NewNoteWindow';
import { NewTaskWindow } from './components/NewTaskWindow';
import { PomodoroModal } from './components/PomodoroModal';
import { OnboardingModal } from './components/OnboardingModal';
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
  const [activeView, setActiveView] = useState(() => localStorage.getItem('activeView') || 'dashboard');

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
  const [authChecked, setAuthChecked] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Background Image State
  const [bgImage, setBgImage] = useState(() => localStorage.getItem('bgImage') || 'light');
  // Global Background State
  const [isGlobalBg, setIsGlobalBg] = useState(() => localStorage.getItem('isGlobalBg') === 'true');
  // Spotlight Enabled State
  const [isSpotlightEnabled, setIsSpotlightEnabled] = useState(() => {
    const stored = localStorage.getItem('isSpotlightEnabled');
    return stored === null ? true : stored === 'true';
  });

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

  const handleLogin = async () => {
    const token = getAuthToken();
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    try {
      const me = await authAPI.me();
      setIsAuthenticated(true);
      setCurrentUserId((me as any)?.id ?? null);
      setAuthChecked(true);

      // Check onboarding after login/register
      const pending = localStorage.getItem('fokus_onboarding_pending') === 'true';
      const uid = (me as any)?.id;
      const doneKey = uid ? `fokus_onboarding_done_${uid}` : null;
      const done = doneKey ? localStorage.getItem(doneKey) === 'true' : false;

      if (pending && !done) {
        setShowOnboarding(true);
      }
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
      setIsAuthenticated(false);
      setAuthChecked(true);
      setCurrentUserId(null);
      return;
    }

    authAPI
      .me()
      .then((me) => {
        setIsAuthenticated(true);
        setCurrentUserId((me as any)?.id ?? null);
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

  useEffect(() => {
    if (!isAuthenticated || !authChecked) return;
    if (!currentUserId) return;

    const pending = localStorage.getItem('fokus_onboarding_pending') === 'true';
    const doneKey = `fokus_onboarding_done_${currentUserId}`;
    const done = localStorage.getItem(doneKey) === 'true';

    if (pending && !done) {
      setShowOnboarding(true);
    }
  }, [isAuthenticated, authChecked, currentUserId]);

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

      if (isSpotlightEnabled && (((e.metaKey || e.ctrlKey) && e.key === 'k') || (e.key === '/' && !isInputActive))) {
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
  }, []);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard
          onNavigate={setActiveView}
          onOpenNoteModal={() => setShowNoteModal(true)}
          onOpenTaskModal={() => setShowTaskModal(true)}
          onEditTask={handleEditTask}
          onOpenSpotlight={() => setIsSpotlightOpen(true)}
          onOpenPomodoro={() => setShowPomodoroModal(true)}
          bgImage={bgImage}
          onBgChange={handleBgChange}
        />;
      case 'note-editor':
        return <NoteEditorPage
          noteId={editingNoteId}
          onBack={() => {
            setActiveView('dashboard');
            setEditingNoteId(undefined);
          }}
        />;
      case 'notes':
        return <Notes
          onOpenNoteModal={() => setShowNoteModal(true)}
          onEditNote={(id) => {
            setEditingNoteId(id);
            setActiveView('note-editor');
          }}
        />;
      case 'tasks':
        return <TasksWithLists
          onOpenTaskModal={() => setShowTaskModal(true)}
          onEditTask={handleEditTask}
        />;
      // case 'stats': removed
      case 'trash':
        return <Trash />;
      case 'settings':
        return <Settings
          bgImage={bgImage}
          onBgChange={handleBgChange}
          isGlobalBg={isGlobalBg}
          onToggleGlobalBg={handleGlobalBgToggle}
          isSpotlightEnabled={isSpotlightEnabled}
          onToggleSpotlight={handleSpotlightToggle}
        />;
      default:
        return <Dashboard
          onNavigate={setActiveView}
          onOpenNoteModal={() => setShowNoteModal(true)}
          onOpenTaskModal={() => setShowTaskModal(true)}
          bgImage={bgImage}
          onBgChange={handleBgChange}
        />;
    }
  };

  if (!authChecked && getAuthToken()) {
    return (
      <ThemeProvider>
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
          <div className="w-8 h-8 border-2 border-zinc-900 dark:border-white border-t-transparent rounded-full animate-spin" />
        </div>
      </ThemeProvider>
    );
  }

  if (!isAuthenticated) {
    return (
      <ThemeProvider>
        <Login onLogin={handleLogin} />
      </ThemeProvider>
    );
  }

  const isCustomBg = bgImage.startsWith('data:') || bgImage.startsWith('http') || bgImage.startsWith('blob:');
  const showBackground = isGlobalBg || activeView === 'dashboard';

  return (
    <ThemeProvider>
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
                  className={cn("absolute inset-0 w-full h-full object-cover transition-opacity duration-500", bgImage === 'light' ? 'opacity-100' : 'opacity-0')}
                />
                <img
                  src="/dark.png"
                  alt="Background"
                  className={cn("absolute inset-0 w-full h-full object-cover transition-opacity duration-500", bgImage === 'dark' ? 'opacity-100' : 'opacity-0')}
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
        />

        {/* Main Content Area - With Padding for Sidebar */}
        <main className={cn(
          "relative z-10 flex-1 min-h-screen lg:pl-[320px] transition-all duration-300 overflow-y-auto",
          // If global BG is on, we might want to ensure transparency in children, but Dashboard usually handles its own layout.
          // Other pages might need a translucent background if they assume a solid one.
          // For now, let's assume pages will layer on top.
        )}>
          {renderView()}
        </main>


        {/* Spotlight */}
        <Spotlight
          isOpen={isSpotlightOpen}
          onClose={() => setIsSpotlightOpen(false)}
          onNavigate={setActiveView}
          onOpenNoteModal={() => setShowNoteModal(true)}
          onOpenTaskModal={() => setShowTaskModal(true)}
          onOpenPomodoro={() => setShowPomodoroModal(true)}
        />

        {/* Modals */}
        <NewNoteWindow
          isOpen={showNoteModal}
          onClose={() => setShowNoteModal(false)}
          onExpand={(id) => {
            setEditingNoteId(id);
            setActiveView('note-editor');
            setShowNoteModal(false);
          }}
        />

        <NewTaskWindow
          isOpen={showTaskModal}
          onClose={closeTaskModal}
          initialData={editingTask}
        />

        <PomodoroModal
          isOpen={showPomodoroModal}
          onClose={() => setShowPomodoroModal(false)}
        />

        <OnboardingModal
          isOpen={showOnboarding}
          defaultTheme="dark"
          defaultBackground="dark"
          onBackgroundChange={handleBgChange}
          onComplete={() => {
            if (currentUserId) {
              localStorage.setItem(`fokus_onboarding_done_${currentUserId}`, 'true');
            }
            localStorage.removeItem('fokus_onboarding_pending');
            setShowOnboarding(false);
          }}
        />
      </div>
    </ThemeProvider>
  );
};

export default App;