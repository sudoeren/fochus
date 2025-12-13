import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Command, 
  FileText, 
  CheckSquare, 
  Settings, 
  ArrowRight, 
  Layout,
  Plus,
  Hash,
  CornerDownLeft,
  Calendar
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTasks } from '../hooks/useTasks';
import { useNotes } from '../hooks/useNotes';

interface SpotlightProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  onOpenNoteModal: () => void;
  onOpenTaskModal: () => void;
}

// Group Types
type SpotlightGroup = 'actions' | 'navigation' | 'tasks' | 'notes';

interface SpotlightItem {
  id: string;
  label: string;
  detail?: string;
  icon: any;
  group: SpotlightGroup;
  action: () => void;
  shortcut?: string;
}

export const Spotlight: React.FC<SpotlightProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenNoteModal,
  onOpenTaskModal
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { tasks } = useTasks();
  const { notes } = useNotes();

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global Shortcut Listener (/)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Toggle with / if not typing in input/textarea
      if (e.key === '/' && !isOpen) {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag !== 'input' && activeTag !== 'textarea') {
          e.preventDefault();
          // We need a way to open it from here. 
          // Since this component is conditionally rendered by parent, 
          // the parent handles the state. 
          // We assume the parent has attached the listener for opening,
          // but if we were controlling state locally or via context we'd do it here.
          // For now, we rely on App.tsx to handle the opening.
          // Wait, App.tsx handles Cmd+K, let's add / there or trust the user prompt implies updating App.tsx?
          // The prompt says "spotlight (/) tuşu ile açılabilsin". 
          // I should probably dispatch an event or rely on App.tsx modification.
          // BUT: I cannot modify App.tsx easily in this step without reading it.
          // Let's assume I need to modify App.tsx as well or emit a custom event.
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
        }
      }
    };

    // Actually, the cleanest way is to dispatch the custom event the App listens to, 
    // OR Update App.tsx. I will update App.tsx in a separate step if needed, 
    // but looking at previous App.tsx, it listens to Cmd+K.
    // I will modify App.tsx to listen to '/' as well.
  }, [isOpen]);

  // Define Static Actions
  const staticItems: SpotlightItem[] = [
    { 
      id: 'new-task', 
      label: 'Yeni Görev', 
      detail: 'Görev ekle',
      icon: CheckSquare, 
      group: 'actions', 
      action: () => { onOpenTaskModal(); onClose(); },
      shortcut: 'T'
    },
    { 
      id: 'new-note', 
      label: 'Yeni Not', 
      detail: 'Not al',
      icon: FileText, 
      group: 'actions', 
      action: () => { onOpenNoteModal(); onClose(); },
      shortcut: 'N'
    },
    { 
      id: 'go-dashboard', 
      label: 'Dashboard', 
      detail: 'Ana sayfa',
      icon: Layout, 
      group: 'navigation', 
      action: () => { onNavigate('dashboard'); onClose(); }
    },
    { 
      id: 'go-tasks', 
      label: 'Görevlerim', 
      detail: 'Listeye git',
      icon: CheckSquare, 
      group: 'navigation', 
      action: () => { onNavigate('tasks'); onClose(); }
    },
    { 
      id: 'go-notes', 
      label: 'Notlarım', 
      detail: 'Deftere git',
      icon: FileText, 
      group: 'navigation', 
      action: () => { onNavigate('notes'); onClose(); }
    },
    { 
      id: 'go-settings', 
      label: 'Ayarlar', 
      detail: 'Tercihler',
      icon: Settings, 
      group: 'navigation', 
      action: () => { onNavigate('settings'); onClose(); }
    },
  ];

  // Dynamic Content (Filtered)
  const taskItems: SpotlightItem[] = tasks
    .filter(t => t.title.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5)
    .map(t => ({
      id: `task-${t.id}`,
      label: t.title,
      detail: t.isCompleted ? 'Tamamlandı' : 'Bekliyor',
      icon: Hash,
      group: 'tasks',
      action: () => { onNavigate('tasks'); onClose(); }
    }));

  const noteItems: SpotlightItem[] = notes
    .filter(n => n.title.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5)
    .map(n => ({
      id: `note-${n.id}`,
      label: n.title,
      detail: new Date(n.createdAt).toLocaleDateString(),
      icon: FileText,
      group: 'notes',
      action: () => { onNavigate('notes'); onClose(); }
    }));

  // Combine and Filter Items
  const filteredStatic = query 
    ? staticItems.filter(i => i.label.toLowerCase().includes(query.toLowerCase()))
    : staticItems;

  const allItems = [...filteredStatic, ...taskItems, ...noteItems];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % allItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + allItems.length) % allItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (allItems[selectedIndex]) {
          allItems[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, allItems, selectedIndex, onClose]);

  // Render Group Header
  const renderGroupHeader = (group: string, index: number) => {
    const prevItem = allItems[index - 1];
    if (!prevItem || prevItem.group !== group) {
      const labels: Record<string, string> = {
        actions: 'Eylemler',
        navigation: 'Sayfalar',
        tasks: 'Görevler',
        notes: 'Notlar'
      };
      return (
        <div className="px-3 py-2 text-[10px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest sticky top-0 bg-zinc-50/95 dark:bg-zinc-900/95 backdrop-blur-sm z-10">
          {labels[group]}
        </div>
      );
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-zinc-950/40 backdrop-blur-[4px] animate-in fade-in duration-200" 
        onClick={onClose} 
      />

      {/* Main Container */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-xl shadow-2xl overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-800 animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-200 flex flex-col max-h-[70vh]">
        
        {/* Search Bar */}
        <div className="flex items-center px-4 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <Search className="w-5 h-5 text-zinc-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-lg text-zinc-900 dark:text-white placeholder-zinc-400 font-medium"
            placeholder="Ne yapmak istersiniz?"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            autoComplete="off"
            autoCorrect="off"
          />
          <div className="flex items-center gap-2">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 text-[10px] text-zinc-500 font-medium">ESC</kbd>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 scroll-smooth bg-zinc-50 dark:bg-zinc-950/50">
          {allItems.length > 0 ? (
            <div className="space-y-0.5">
              {allItems.map((item, index) => (
                <div key={item.id}>
                  {renderGroupHeader(item.group, index)}
                  <button
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-150 relative",
                      index === selectedIndex 
                        ? "bg-white dark:bg-zinc-800 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-700 z-10" 
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                    )}
                  >
                     {/* Left Border Accent for Active Item */}
                     {index === selectedIndex && (
                       <div className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-500 rounded-r-full" />
                     )}

                    <div className={cn(
                      "p-1.5 rounded-md transition-colors ml-1",
                      index === selectedIndex 
                        ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400" 
                        : "bg-zinc-200/50 dark:bg-zinc-800 text-zinc-500"
                    )}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "font-medium truncate",
                          index === selectedIndex ? "text-zinc-900 dark:text-white" : ""
                        )}>
                          {item.label}
                        </span>
                        {item.detail && (
                          <span className="text-xs text-zinc-400 truncate ml-2">
                            {item.detail}
                          </span>
                        )}
                      </div>
                    </div>

                    {index === selectedIndex && (
                       <CornerDownLeft className="w-4 h-4 text-zinc-400 ml-2" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
             <div className="py-16 text-center text-zinc-500 flex flex-col items-center gap-3">
               <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                 <Command className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
               </div>
               <p className="text-sm">Sonuç bulunamadı.</p>
             </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
           <div className="flex gap-4">
              <span className="flex items-center gap-1.5">
                <Command className="w-3 h-3" />
                <span className="font-medium text-zinc-500 dark:text-zinc-300">Eylemler</span>
              </span>
           </div>
           <div className="flex gap-1.5">
             <kbd className="px-1.5 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-500">↑↓</kbd>
             <kbd className="px-1.5 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-500">↵</kbd>
           </div>
        </div>
      </div>
    </div>
  );
};
