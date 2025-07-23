import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ThemeProvider } from './components/ThemeProvider';
import { Spotlight } from './components/Spotlight';
import { NoteModal } from './components/NoteModal';
import { TaskModal } from './components/TaskModal';
import { Dashboard } from './pages/Dashboard';
import { Notes } from './pages/Notes';
import { Tasks } from './pages/Tasks';
import { WeeklyPlanner } from './pages/WeeklyPlanner';
import { Settings } from './pages/Settings';
import { Trash } from './pages/Trash';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Shortcut handler
  useEffect(() => {
    const handleShortcut = (event: string, data?: any) => {
      switch (event) {
        case 'navigate':
          if (data === 'home') setActiveView('dashboard');
          else if (data === 'notes') setActiveView('notes');
          else if (data === 'tasks') setActiveView('tasks');
          else if (data === 'weekly') setActiveView('weekly');
          break;
        case 'new-note':
          setShowNoteModal(true);
          break;
        case 'new-task':
          setShowTaskModal(true);
          break;
        case 'search':
          setIsSpotlightOpen(true);
          break;
      }
    };

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
        handleShortcut('new-note');
      }
      // Cmd+T / Ctrl+T for new task
      if ((e.metaKey || e.ctrlKey) && e.key === 't') {
        e.preventDefault();
        handleShortcut('new-task');
      }
    };

    // Register shortcut listener
    if (window.electronAPI && 'onShortcut' in window.electronAPI) {
      (window.electronAPI as any).onShortcut(handleShortcut);
    }

    document.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      // Cleanup listeners
      if (window.electronAPI && 'removeAllListeners' in window.electronAPI) {
        (window.electronAPI as any).removeAllListeners();
      }
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard 
          onOpenNoteModal={() => setShowNoteModal(true)}
          onOpenTaskModal={() => setShowTaskModal(true)}
        />;
      case 'notes':
        return <Notes onOpenNoteModal={() => setShowNoteModal(true)} />;
      case 'tasks':
        return <Tasks onOpenTaskModal={() => setShowTaskModal(true)} />;
      case 'weekly':
        return <WeeklyPlanner />;
      case 'trash':
        return <Trash />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard 
          onOpenNoteModal={() => setShowNoteModal(true)}
          onOpenTaskModal={() => setShowTaskModal(true)}
        />;
    }
  };

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        <main className="flex-1 overflow-hidden">
          {renderView()}
        </main>
        
        {/* Spotlight */}
        <Spotlight 
          isOpen={isSpotlightOpen}
          onClose={() => setIsSpotlightOpen(false)}
          onNavigate={setActiveView}
        />
        
        {/* Global Modals */}
        <NoteModal 
          isOpen={showNoteModal}
          onClose={() => setShowNoteModal(false)}
        />
        
        <TaskModal 
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
        />
      </div>
    </ThemeProvider>
  );
};

export default App;
