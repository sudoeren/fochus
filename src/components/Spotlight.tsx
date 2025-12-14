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
  Sun,
  Timer,
  Trash2,
  ArrowUp,
  ArrowDown
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
  onOpenPomodoro?: () => void;
}

interface SpotlightItem {
  id: string;
  label: string;
  detail?: string;
  icon: any;
  group: string;
  action: () => void;
  shortcut?: string;
  color?: string;
}

export const Spotlight: React.FC<SpotlightProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenNoteModal,
  onOpenTaskModal,
  onOpenPomodoro
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
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
  const quickActions: SpotlightItem[] = [
    {
      id: 'new-task',
      label: 'Yeni Görev Oluştur',
      detail: 'Hızlıca bir görev ekleyin',
      icon: Plus,
      group: 'Hızlı Eylemler',
      action: () => { onOpenTaskModal(); onClose(); },
      shortcut: 'Ctrl+T',
      color: 'emerald'
    },
    {
      id: 'new-note',
      label: 'Yeni Not Oluştur',
      detail: 'Hızlıca bir not alın',
      icon: FileText,
      group: 'Hızlı Eylemler',
      action: () => { onOpenNoteModal(); onClose(); },
      shortcut: 'Ctrl+N',
      color: 'amber'
    },
    {
      id: 'start-focus',
      label: 'Odak Zamanlayıcısı',
      detail: 'Pomodoro timer\'ı başlat',
      icon: Timer,
      group: 'Hızlı Eylemler',
      action: () => { onOpenPomodoro?.(); onClose(); },
      color: 'red'
    },
    {
      id: 'toggle-theme',
      label: theme === 'dark' ? 'Açık Moda Geç' : 'Koyu Moda Geç',
      detail: 'Tema tercihini değiştir',
      icon: theme === 'dark' ? Sun : Moon,
      group: 'Hızlı Eylemler',
      action: () => { setTheme(theme === 'dark' ? 'light' : 'dark'); onClose(); },
      color: 'indigo'
    },
  ];

  const navigationItems: SpotlightItem[] = [
    {
      id: 'go-dashboard',
      label: 'Ana Sayfa',
      detail: 'Genel bakış ve özet',
      icon: Layout,
      group: 'Sayfalar',
      action: () => { onNavigate('dashboard'); onClose(); }
    },
    {
      id: 'go-tasks',
      label: 'Görevler',
      detail: 'Tüm görevlerinizi yönetin',
      icon: CheckSquare,
      group: 'Sayfalar',
      action: () => { onNavigate('tasks'); onClose(); }
    },
    {
      id: 'go-notes',
      label: 'Notlar',
      detail: 'Notlarınızı görüntüleyin',
      icon: FileText,
      group: 'Sayfalar',
      action: () => { onNavigate('notes'); onClose(); }
    },
    {
      id: 'go-trash',
      label: 'Çöp Kutusu',
      detail: 'Silinen öğeler',
      icon: Trash2,
      group: 'Sayfalar',
      action: () => { onNavigate('trash'); onClose(); }
    },
    {
      id: 'go-settings',
      label: 'Ayarlar',
      detail: 'Uygulama tercihlerini düzenle',
      icon: Settings,
      group: 'Sayfalar',
      action: () => { onNavigate('settings'); onClose(); }
    },
  ];

  // Dynamic Content - Tasks
  const taskItems: SpotlightItem[] = tasks
    .filter(t => !t.isDeleted && t.title.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5)
    .map(t => ({
      id: `task-${t.id}`,
      label: t.title,
      detail: t.isCompleted ? '✓ Tamamlandı' : 'Bekliyor',
      icon: CheckSquare,
      group: 'Görevler',
      action: () => { onNavigate('tasks'); onClose(); },
      color: t.isCompleted ? 'emerald' : 'zinc'
    }));

  // Dynamic Content - Notes
  const noteItems: SpotlightItem[] = notes
    .filter(n => !n.isDeleted && n.title.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5)
    .map(n => ({
      id: `note-${n.id}`,
      label: n.title || 'Adsız Not',
      detail: new Date(n.createdAt).toLocaleDateString('tr-TR'),
      icon: FileText,
      group: 'Notlar',
      action: () => { onNavigate('notes'); onClose(); },
      color: 'amber'
    }));

  // Combine all items based on query
  let allItems: SpotlightItem[] = [];
  
  if (query.length === 0) {
    // Show quick actions and navigation when no query
    allItems = [...quickActions, ...navigationItems];
  } else {
    // Filter everything when there's a query
    const filteredQuickActions = quickActions.filter(i => 
      i.label.toLowerCase().includes(query.toLowerCase()) ||
      i.detail?.toLowerCase().includes(query.toLowerCase())
    );
    const filteredNavigation = navigationItems.filter(i => 
      i.label.toLowerCase().includes(query.toLowerCase()) ||
      i.detail?.toLowerCase().includes(query.toLowerCase())
    );
    allItems = [...filteredQuickActions, ...filteredNavigation, ...taskItems, ...noteItems];
  }

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  // Handle keyboard navigation
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

  // Group items for rendering
  const groupedItems = allItems.reduce((acc, item, index) => {
    const group = item.group;
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push({ ...item, globalIndex: index });
    return acc;
  }, {} as Record<string, (SpotlightItem & { globalIndex: number })[]>);

  const getColorClasses = (color?: string, isSelected?: boolean) => {
    if (!color) return isSelected ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400';
    
    const colors: Record<string, string> = {
      emerald: isSelected ? 'bg-emerald-600 text-white' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
      amber: isSelected ? 'bg-amber-600 text-white' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
      red: isSelected ? 'bg-red-600 text-white' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
      indigo: isSelected ? 'bg-indigo-600 text-white' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
      zinc: isSelected ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400',
    };
    return colors[color] || colors.zinc;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[70vh]">

        {/* Search Header */}
        <div className="flex items-center px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <Search className="w-5 h-5 text-zinc-400 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-base text-zinc-900 dark:text-white placeholder-zinc-400 font-medium"
            placeholder="Arama yapın veya komut yazın..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            autoComplete="off"
          />
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md text-[10px] font-medium text-zinc-500 border border-zinc-200 dark:border-zinc-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto custom-scrollbar">
          {allItems.length > 0 ? (
            <div className="py-2">
              {Object.entries(groupedItems).map(([group, items]) => (
                <div key={group} className="mb-2">
                  {/* Group Header */}
                  <div className="px-4 py-2 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider sticky top-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm z-10">
                    {group}
                  </div>
                  
                  {/* Group Items */}
                  <div className="px-2">
                    {items.map((item) => {
                      const isSelected = item.globalIndex === selectedIndex;
                      return (
                        <button
                          key={item.id}
                          data-index={item.globalIndex}
                          onClick={item.action}
                          onMouseEnter={() => setSelectedIndex(item.globalIndex)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-150 group mb-1",
                            isSelected
                              ? "bg-zinc-100 dark:bg-zinc-800"
                              : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                          )}
                        >
                          {/* Icon */}
                          <div className={cn(
                            "p-2.5 rounded-xl transition-all flex-shrink-0",
                            getColorClasses(item.color, isSelected)
                          )}>
                            <item.icon className="w-4 h-4" />
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className={cn(
                              "font-medium text-sm truncate",
                              isSelected ? "text-zinc-900 dark:text-white" : "text-zinc-700 dark:text-zinc-300"
                            )}>
                              {item.label}
                            </div>
                            {item.detail && (
                              <div className="text-xs text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                                {item.detail}
                              </div>
                            )}
                          </div>

                          {/* Right Side */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {item.shortcut && !isSelected && (
                              <kbd className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-[10px] font-medium text-zinc-400">
                                {item.shortcut}
                              </kbd>
                            )}
                            {isSelected && (
                              <div className="flex items-center gap-1 text-xs font-medium text-zinc-400">
                                <CornerDownLeft className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <Search className="w-6 h-6 text-zinc-400" />
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium">Sonuç bulunamadı</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Farklı bir arama terimi deneyin</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <ArrowUp className="w-3 h-3" />
              <ArrowDown className="w-3 h-3" />
              <span>Gezin</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CornerDownLeft className="w-3 h-3" />
              <span>Seç</span>
            </span>
            <span className="flex items-center gap-1.5 ml-2 border-l border-zinc-200 dark:border-zinc-700 pl-4">
              <kbd className="font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 rounded text-[10px]">/</kbd>
              <span>Aç</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="Fochus" className="w-4 h-4" />
            <span className="font-semibold">FOCHUS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
