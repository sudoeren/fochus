import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ThemeProvider } from './components/ThemeProvider';
import { Dashboard } from './pages/Dashboard';
import { Notes } from './pages/Notes';
import { Tasks } from './pages/Tasks';
import { WeeklyPlanner } from './pages/WeeklyPlanner';
import { Settings } from './pages/Settings';
import { Trash } from './pages/Trash';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');

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
          setActiveView('notes');
          // TODO: Trigger new note modal
          break;
        case 'new-task':
          setActiveView('tasks');
          // TODO: Trigger new task modal
          break;
        case 'search':
          // TODO: Focus search input
          break;
      }
    };

    // Register shortcut listener
    if (window.electronAPI && 'onShortcut' in window.electronAPI) {
      (window.electronAPI as any).onShortcut(handleShortcut);
    }

    return () => {
      // Cleanup listeners
      if (window.electronAPI && 'removeAllListeners' in window.electronAPI) {
        (window.electronAPI as any).removeAllListeners();
      }
    };
  }, []);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'notes':
        return <Notes />;
      case 'tasks':
        return <Tasks />;
      case 'weekly':
        return <WeeklyPlanner />;
      case 'trash':
        return <Trash />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        <main className="flex-1 overflow-y-auto">
          {renderView()}
        </main>
      </div>
    </ThemeProvider>
  );
};

export default App;
