import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ArrowRight, Home, BookOpen, CheckSquare, Calendar, Settings, Plus, Hash, X, Command, User } from 'lucide-react';

interface SpotlightProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  onOpenNoteModal?: () => void;
  onOpenTaskModal?: () => void;
}

interface CommandItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  keywords: string[];
  category: 'navigation' | 'actions';
  action: () => void;
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
  const isOpenRef = useRef(isOpen);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Update ref when isOpen changes
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Define commands with actions
  const commands: CommandItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      description: 'Genel bakış ve özet',
      keywords: ['dashboard', 'ana', 'home', 'anasayfa', 'genel'],
      category: 'navigation',
      action: () => {
        onNavigate('dashboard');
        onClose();
      }
    },
    {
      id: 'notes',
      label: 'Notlar',
      icon: BookOpen,
      description: 'Not defterine git',
      keywords: ['notes', 'notlar', 'note', 'yazı', 'döküman'],
      category: 'navigation',
      action: () => {
        onNavigate('notes');
        onClose();
      }
    },
    {
      id: 'tasks',
      label: 'Görevler',
      icon: CheckSquare,
      description: 'Görev listesini aç',
      keywords: ['tasks', 'görevler', 'task', 'todo', 'yapılacak'],
      category: 'navigation',
      action: () => {
        onNavigate('tasks');
        onClose();
      }
    },
    {
      id: 'weekly',
      label: 'Haftalık Plan',
      icon: Calendar,
      description: 'Takvim görünümü',
      keywords: ['weekly', 'haftalık', 'planner', 'takvim', 'plan'],
      category: 'navigation',
      action: () => {
        onNavigate('weekly');
        onClose();
      }
    },
    {
      id: 'settings',
      label: 'Ayarlar',
      icon: Settings,
      description: 'Uygulama tercihleri',
      keywords: ['settings', 'ayarlar', 'config', 'konfigürasyon'],
      category: 'navigation',
      action: () => {
        onNavigate('settings');
        onClose();
      }
    },
    {
      id: 'profile',
      label: 'Profilim',
      icon: User,
      description: 'Kullanıcı profili ve hesap',
      keywords: ['profile', 'profil', 'hesap', 'account', 'user', 'kullanıcı'],
      category: 'navigation',
      action: () => {
        onNavigate('profile');
        onClose();
      }
    },
    {
      id: 'new-note',
      label: 'Yeni Not',
      icon: Plus,
      description: 'Yeni bir not oluştur',
      keywords: ['yeni', 'not', 'oluştur', 'ekle', 'new', 'note', 'create'],
      category: 'actions',
      action: () => {
        if (onOpenNoteModal) {
          onOpenNoteModal();
        }
        onClose();
      }
    },
    {
      id: 'new-task',
      label: 'Yeni Görev',
      icon: Plus,
      description: 'Yeni bir görev ekle',
      keywords: ['yeni', 'görev', 'oluştur', 'ekle', 'new', 'task', 'create'],
      category: 'actions',
      action: () => {
        if (onOpenTaskModal) {
          onOpenTaskModal();
        }
        onClose();
      }
    }
  ];

  // Memoized filtered commands
  const filteredCommands = React.useMemo(() => {
    if (!query.trim()) {
      return commands;
    }

    const searchTerm = query.toLowerCase().trim();
    return commands.filter(command => 
      command.label.toLowerCase().includes(searchTerm) ||
      command.description.toLowerCase().includes(searchTerm) ||
      command.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
    );
  }, [query, commands]);

  // Reset selection when search query changes
  useEffect(() => {
    setSelectedIndex(0);
    // Clear refs array when filtering changes
    itemRefs.current = [];
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    if (itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });
    }
  }, [selectedIndex]);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      // Focus input after a small delay to ensure modal is rendered
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpenRef.current) return;

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        onClose();
        break;

      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => {
          const searchTerm = query.toLowerCase().trim();
          const currentFiltered = !searchTerm ? commands : commands.filter(command => 
            command.label.toLowerCase().includes(searchTerm) ||
            command.description.toLowerCase().includes(searchTerm) ||
            command.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
          );
          return prev >= currentFiltered.length - 1 ? 0 : prev + 1;
        });
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => {
          const searchTerm = query.toLowerCase().trim();
          const currentFiltered = !searchTerm ? commands : commands.filter(command => 
            command.label.toLowerCase().includes(searchTerm) ||
            command.description.toLowerCase().includes(searchTerm) ||
            command.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
          );
          return prev <= 0 ? currentFiltered.length - 1 : prev - 1;
        });
        break;

      case 'Enter':
        e.preventDefault();
        const searchTerm = query.toLowerCase().trim();
        const currentFiltered = !searchTerm ? commands : commands.filter(command => 
          command.label.toLowerCase().includes(searchTerm) ||
          command.description.toLowerCase().includes(searchTerm) ||
          command.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
        );
        
        if (currentFiltered[selectedIndex]) {
          currentFiltered[selectedIndex].action();
        }
        break;
    }
  }, [onClose, query, commands, selectedIndex]);

  // Setup keyboard event listeners
  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4 sm:px-6 transition-all duration-200"
      onClick={onClose}
    >
      <div 
        className="
          w-full max-w-2xl 
          bg-white dark:bg-zinc-900 
          rounded-2xl shadow-2xl 
          border border-gray-200 dark:border-zinc-800 
          overflow-hidden 
          animate-in slide-in-from-top-4 fade-in duration-200
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Search */}
        <div className="flex items-center gap-4 p-5 border-b border-gray-200 dark:border-zinc-800">
          <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
            <Search className="w-5 h-5 text-gray-400 dark:text-zinc-500" />
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder="Ne yapmak istersiniz?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="
              flex-1 bg-transparent 
              text-gray-900 dark:text-white 
              placeholder-gray-400 dark:placeholder-zinc-500 
              outline-none text-xl font-medium
            "
            autoComplete="off"
            spellCheck={false}
          />
          <div className="flex items-center gap-2">
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="px-2 py-1 bg-gray-100 dark:bg-zinc-800 rounded-md text-xs font-medium text-gray-500 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700">
              Esc
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto scrollbar-hide py-2">
          {filteredCommands.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 flex items-center justify-center">
                <Command className="w-8 h-8 text-gray-300 dark:text-zinc-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-zinc-200 mb-1">
                Sonuç bulunamadı
              </h3>
              <p className="text-sm text-gray-500 dark:text-zinc-500">
                Farklı bir komut deneyin
              </p>
            </div>
          ) : (
            <div className="px-2 space-y-1">
              {filteredCommands.map((command, index) => {
                const Icon = command.icon;
                const isSelected = index === selectedIndex;
                
                return (
                  <div
                    key={command.id}
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    onClick={() => command.action()}
                    className={`
                      relative flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all duration-150
                      ${isSelected 
                        ? 'bg-blue-600 dark:bg-blue-600 text-white shadow-md' 
                        : 'text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800'
                      }
                    `}
                  >
                    {/* Icon */}
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center transition-colors
                      ${isSelected 
                        ? 'bg-white/20 text-white' 
                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400'
                      }
                    `}>
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium text-base ${isSelected ? 'text-white' : 'text-gray-900 dark:text-zinc-100'}`}>
                        {command.label}
                      </div>
                      <div className={`text-sm truncate ${isSelected ? 'text-blue-100' : 'text-gray-500 dark:text-zinc-500'}`}>
                        {command.description}
                      </div>
                    </div>
                    
                    {/* Category Badge */}
                    <div className={`
                      px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider
                      ${isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-500'
                      }
                    `}>
                      {command.category === 'navigation' ? 'Git' : 'Yap'}
                    </div>
                    
                    {/* Arrow for selected */}
                    {isSelected && (
                      <ArrowRight className="w-5 h-5 text-white animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 flex items-center justify-between text-xs text-gray-500 dark:text-zinc-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md font-mono">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md font-mono">↓</kbd>
              <span>Gezin</span>
            </div>
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md font-mono">↵</kbd>
              <span>Seç</span>
            </div>
          </div>
          <div>
            <span className="font-medium text-gray-900 dark:text-zinc-300">Fokus</span> Spotlight
          </div>
        </div>
      </div>
    </div>
  );
};