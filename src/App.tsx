import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ThemeProvider } from './components/ThemeProvider';
import { Spotlight } from './components/Spotlight';
import { NewNoteWindow } from './components/NewNoteWindow';
import { NewTaskWindow } from './components/NewTaskWindow';
import { PomodoroModal } from './components/PomodoroModal';
import { Dashboard } from './pages/Dashboard';
import { Notes } from './pages/Notes';
import { TasksNew } from './pages/Tasks_new';
import { WeeklyPlanner } from './pages/WeeklyPlanner';
import { Settings } from './pages/Settings';
import { Trash } from './pages/Trash';
import { Stats } from './pages/Stats';
import { Login } from './pages/Login';
import { NoteEditorPage } from './pages/NoteEditorPage';
import { setupFastPolling } from './utils/refreshUtils';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showPomodoroModal, setShowPomodoroModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | undefined>(undefined);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
  };

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

      if (((e.metaKey || e.ctrlKey) && e.key === 'k') || (e.key === '/' && !isInputActive)) {
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
        return <Notes onOpenNoteModal={() => setShowNoteModal(true)} />;
      case 'tasks':
        return <TasksNew
          onOpenTaskModal={() => setShowTaskModal(true)}
          onEditTask={handleEditTask}
        />;
      case 'weekly':
        return <WeeklyPlanner />;
      case 'stats':
        return <Stats />;
      case 'trash':
        return <Trash />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard
          onNavigate={setActiveView}
          onOpenNoteModal={() => setShowNoteModal(true)}
          onOpenTaskModal={() => setShowTaskModal(true)}
        />;
    }
  };

  if (!isAuthenticated) {
    return (
      <ThemeProvider>
        <Login onLogin={handleLogin} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="relative min-h-screen text-zinc-900 dark:text-zinc-100 flex overflow-hidden">
        
        {/* GLOBAL BACKGROUND - Covers entire viewport */}
        <div className="fixed inset-0 z-0 pointer-events-none">
           <BackgroundWrapper />
           {/* Global Overlay for readability */}
           <div className="absolute inset-0 bg-white/30 dark:bg-black/40 backdrop-blur-[2px]" />
        </div>

        {/* Floating Sidebar (Fixed Position) */}
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
          onOpenSpotlight={() => setIsSpotlightOpen(true)}
          onOpenNoteModal={() => setShowNoteModal(true)}
          onOpenTaskModal={() => setShowTaskModal(true)}
          onOpenPomodoro={() => setShowPomodoroModal(true)}
        />

        {/* Main Content Area - With Padding for Sidebar - Z-index ensures it sits above background */}
        <main className="relative z-10 flex-1 min-h-screen lg:pl-[320px] transition-all duration-300 overflow-y-auto">
          {renderView()}
        </main>

        {/* Spotlight */}
        <Spotlight
          isOpen={isSpotlightOpen}
          onClose={() => setIsSpotlightOpen(false)}
          onNavigate={setActiveView}
          onOpenNoteModal={() => setShowNoteModal(true)}
          onOpenTaskModal={() => setShowTaskModal(true)}
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
      </div>
    </ThemeProvider>
  );
};

// Helper component to access theme context for the background
const BackgroundWrapper = () => {
  // We need to access the theme from local storage or context if available. 
  // Since App component doesn't have direct access to theme context here easily without refactoring,
  // we will use a simple CSS-based approach or a small internal component if ThemeProvider allows.
  // Assuming ThemeProvider exposes useTheme, but we are inside it.
  
  // Actually, let's just use CSS classes with dark: modifier since Tailwind handles it via 'class' strategy on the html element.
  return (
    <>
      <img 
        src="/light.png" 
        alt="Background" 
        className="absolute inset-0 w-full h-full object-cover dark:hidden transition-opacity duration-500" 
      />
      <img 
        src="/dark.png" 
        alt="Background" 
        className="absolute inset-0 w-full h-full object-cover hidden dark:block transition-opacity duration-500" 
      />
    </>
  );
}

export default App;