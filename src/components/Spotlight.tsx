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
  Moon,
  Sun
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTasks } from '../hooks/useTasks';
import { useNotes } from '../hooks/useNotes';
import { useTheme } from './ThemeProvider';

interface SpotlightProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  onOpenNoteModal: () => void;
  onOpenTaskModal: () => void;
}

interface SpotlightItem {
  id: string;
  label: string;
  detail?: string;
  icon: any;
  group: string;
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
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Static items definition
  const staticItems: SpotlightItem[] = [
    {
      id: 'new-task',
      label: 'Yeni Görev',
      detail: 'Görev ekle',
      icon: Plus,
      group: 'Eylemler',
      action: () => { onOpenTaskModal(); onClose(); },
      shortcut: 'T'
    },
    {
      id: 'new-note',
      label: 'Yeni Not',
      detail: 'Not al',
      icon: FileText,
      group: 'Eylemler',
      action: () => { onOpenNoteModal(); onClose(); },
      shortcut: 'N'
    },
    {
      id: 'toggle-theme',
      label: theme === 'dark' ? 'Açık Mod' : 'Koyu Mod',
      detail: 'Temayı değiştir',
      icon: theme === 'dark' ? Sun : Moon,
      group: 'Eylemler',
      action: () => { setTheme(theme === 'dark' ? 'light' : 'dark'); onClose(); },
    },
    {
      id: 'go-dashboard',
      label: 'Dashboard',
      icon: Layout,
      group: 'Navigasyon',
      action: () => { onNavigate('dashboard'); onClose(); }
    },
    {
      id: 'go-tasks',
      label: 'Görevlerim',
      icon: CheckSquare,
      group: 'Navigasyon',
      action: () => { onNavigate('tasks'); onClose(); }
    },
    {
      id: 'go-notes',
      label: 'Notlarım',
      icon: FileText,
      group: 'Navigasyon',
      action: () => { onNavigate('notes'); onClose(); }
    },
    {
      id: 'go-settings',
      label: 'Ayarlar',
      icon: Settings,
      group: 'Navigasyon',
      action: () => { onNavigate('settings'); onClose(); }
    },
  ];

  // Dynamic Content
  const taskItems: SpotlightItem[] = tasks
    .filter(t => t.title.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 3)
    .map(t => ({
      id: `task-${t.id}`,
      label: t.title,
      detail: t.listId ? `Liste: ${t.listId}` : 'Kategorisiz',
      icon: Hash,
      group: 'Görevler',
      action: () => { onNavigate('tasks'); onClose(); }
    }));

  const noteItems: SpotlightItem[] = notes
    .filter(n => n.title.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 3)
    .map(n => ({
      id: `note-${n.id}`,
      label: n.title,
      detail: new Date(n.createdAt).toLocaleDateString(),
      icon: FileText,
      group: 'Notlar',
      action: () => { onNavigate('notes'); onClose(); }
    }));

  var allItems = query
    ? [...staticItems.filter(i => i.label.toLowerCase().includes(query.toLowerCase())), ...taskItems, ...noteItems]
    : staticItems;

  // Handle keys inside component as well for navigation
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
        if (allItems[selectedIndex]) allItems[selectedIndex].action();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, allItems, selectedIndex, onClose]);

  const renderGroupHeader = (group: string, index: number) => {
    const prevItem = allItems[index - 1];
    if (!prevItem || prevItem.group !== group) {
      return (
        <div className="px-3 py-2 text-[10px] font-bold text-zinc-400 dark:text-zinc-600 uppercase tracking-widest sticky top-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm z-10">
          {group}
        </div>
      );
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden border border-zinc-200/50 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[60vh] transform origin-center">

        {/* Header / Input */}
        <div className="flex items-center px-4 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <Search className="w-5 h-5 text-zinc-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-lg text-zinc-900 dark:text-white placeholder-zinc-400 font-medium"
            placeholder="Ne yapmak istersiniz?"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            autoComplete="off"
          />
          <div className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            FOCHUS
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {allItems.length > 0 ? (
            <div className="space-y-0.5">
              {allItems.map((item, index) => (
                <div key={item.id}>
                  {renderGroupHeader(item.group, index)}
                  <button
                    onClick={item.action}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-3 rounded-lg text-left transition-all duration-150 group",
                      index === selectedIndex
                        ? "bg-zinc-100 dark:bg-zinc-800"
                        : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        "p-2 rounded-md transition-colors",
                        index === selectedIndex
                          ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm"
                          : "bg-zinc-200/50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                      )}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className={cn(
                          "block font-medium truncate text-sm",
                          index === selectedIndex ? "text-zinc-900 dark:text-white" : "text-zinc-700 dark:text-zinc-300"
                        )}>
                          {item.label}
                        </span>
                        {item.detail && (
                          <span className="block text-xs text-zinc-400 truncate">
                            {item.detail}
                          </span>
                        )}
                      </div>
                    </div>

                    {item.shortcut && index !== selectedIndex && (
                      <kbd className="px-2 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-[10px] font-medium text-zinc-400">
                        {item.shortcut}
                      </kbd>
                    )}

                    {index === selectedIndex && (
                      <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 animate-in fade-in slide-in-from-left-1">
                        Seç <CornerDownLeft className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-zinc-400 flex flex-col items-center gap-2">
              <Command className="w-8 h-8 text-zinc-300 dark:text-zinc-700" />
              <p>Sonuç yok</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400">
          <div className="flex gap-3">
            <span className="flex items-center gap-1"><ArrowRight className="w-3 h-3" /> Seç</span>
            <span className="flex items-center gap-1"><Command className="w-3 h-3" /> Eylemler</span>
          </div>
          <div className="font-medium">v1.2</div>
        </div>
      </div>
    </div>
  );
};
