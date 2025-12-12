import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ThemeProvider } from './components/ThemeProvider';
import { Spotlight } from './components/Spotlight';
import { NoteModal } from './components/NoteModal';
import { TaskModal } from './components/TaskModal';
import { PomodoroModal } from './components/PomodoroModal';
import { Dashboard } from './pages/Dashboard';
import { Notes } from './pages/Notes';
import { TasksNew } from './pages/Tasks_new';
import { WeeklyPlanner } from './pages/WeeklyPlanner';
import { Settings } from './pages/Settings';
import { Trash } from './pages/Trash';
import { Stats } from './pages/Stats';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { setupFastPolling } from './utils/refreshUtils';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showPomodoroModal, setShowPomodoroModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
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

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
    setActiveView('dashboard');
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const closeTaskModal = () => {
    setShowTaskModal(false);
    setEditingTask(null);
  };

  // Shortcut handler
  useEffect(() => {
    // Setup FAST polling system for instant updates
    setupFastPolling();

    // Global keyboard shortcuts
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Cmd+K / Ctrl+K for Spotlight
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSpotlightOpen(true);
      }
      // Cmd+N / Ctrl+N for new note
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        setShowNoteModal(true);
      }
      // Cmd+T / Ctrl+T for new task
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
      case 'profile':
        return <Profile onLogout={handleLogout} />;
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
      <div className="flex h-screen bg-gray-50 dark:bg-black overflow-hidden">
        <Sidebar 
          activeView={activeView} 
          onViewChange={setActiveView} 
          onOpenSpotlight={() => setIsSpotlightOpen(true)}
          onOpenNoteModal={() => setShowNoteModal(true)}
          onOpenTaskModal={() => setShowTaskModal(true)}
          onOpenPomodoro={() => setShowPomodoroModal(true)}
        />
        <main className="flex-1 overflow-hidden lg:ml-0">
          <div className="h-full overflow-auto">
            {renderView()}
          </div>
        </main>
        
        {/* Spotlight */}
        <Spotlight 
          isOpen={isSpotlightOpen}
          onClose={() => setIsSpotlightOpen(false)}
          onNavigate={setActiveView}
          onOpenNoteModal={() => setShowNoteModal(true)}
          onOpenTaskModal={() => setShowTaskModal(true)}
        />
        
        {/* Global Modals */}
        <NoteModal 
          isOpen={showNoteModal}
          onClose={() => setShowNoteModal(false)}
          onEscapeToSpotlight={() => {
            setShowNoteModal(false);
            setIsSpotlightOpen(true);
          }}
        />
        
        <TaskModal 
          isOpen={showTaskModal}
          onClose={closeTaskModal}
          editingTask={editingTask}
          onEscapeToSpotlight={() => {
            closeTaskModal();
            setIsSpotlightOpen(true);
          }}
        />

        <PomodoroModal
          isOpen={showPomodoroModal}
          onClose={() => setShowPomodoroModal(false)}
        />
      </div>
    </ThemeProvider>
  );
};

export default App;