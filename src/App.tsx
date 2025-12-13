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
import { cn } from './lib/utils';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showPomodoroModal, setShowPomodoroModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | undefined>(undefined);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Background Image State
  const [bgImage, setBgImage] = useState(() => localStorage.getItem('bgImage') || 'light');
  // Global Background State
  const [isGlobalBg, setIsGlobalBg] = useState(() => localStorage.getItem('isGlobalBg') === 'true');

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);
  
  // Persist background choice
  const handleBgChange = (newBg: string) => {
    setBgImage(newBg);
    localStorage.setItem('bgImage', newBg);
  };

  const handleGlobalBgToggle = (enabled: boolean) => {
    setIsGlobalBg(enabled);
    localStorage.setItem('isGlobalBg', String(enabled));
  };

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
        return <Settings 
          bgImage={bgImage}
          onBgChange={handleBgChange}
          isGlobalBg={isGlobalBg}
          onToggleGlobalBg={handleGlobalBgToggle}
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

export default App;