import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ArrowRight, Home, BookOpen, CheckSquare, Calendar, Settings, Plus, Hash } from 'lucide-react';

interface SpotlightProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  onOpenNoteModal?: () => void;
  onOpenTaskModal?: () => void;
}

interface Command {
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

  // Update ref when isOpen changes
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Define commands with actions
  const commands: Command[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      description: 'Ana sayfa ve genel bakış',
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
      description: 'Notlarınızı görüntüleyin ve düzenleyin',
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
      description: 'Görevlerinizi yönetin ve takip edin',
      keywords: ['tasks', 'görevler', 'task', 'todo', 'yapılacak'],
      category: 'navigation',
      action: () => {
        onNavigate('tasks');
        onClose();
      }
    },
    {
      id: 'weekly',
      label: 'Haftalık Planlayıcı',
      icon: Calendar,
      description: 'Haftalık planınızı görüntüleyin',
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
      description: 'Uygulama ayarlarını yapılandırın',
      keywords: ['settings', 'ayarlar', 'config', 'konfigürasyon'],
      category: 'navigation',
      action: () => {
        onNavigate('settings');
        onClose();
      }
    },
    {
      id: 'new-note',
      label: 'Yeni Not Oluştur',
      icon: Plus,
      description: 'Hızlıca yeni bir not ekleyin',
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
      label: 'Yeni Görev Oluştur',
      icon: Plus,
      description: 'Hızlıca yeni bir görev ekleyin',
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

  // Reset selection when filtered commands change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands]);

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

  // Keyboard navigation with proper event handling
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpenRef.current) return;

    console.log('🎯 Spotlight Key:', e.key);

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        e.stopPropagation();
        console.log('🎯 Closing spotlight');
        onClose();
        break;

      case 'ArrowDown':
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex(prev => {
          const newIndex = prev >= filteredCommands.length - 1 ? 0 : prev + 1;
          console.log('🎯 Arrow down, new index:', newIndex);
          return newIndex;
        });
        break;

      case 'ArrowUp':
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex(prev => {
          const newIndex = prev <= 0 ? filteredCommands.length - 1 : prev - 1;
          console.log('🎯 Arrow up, new index:', newIndex);
          return newIndex;
        });
        break;

      case 'Enter':
        e.preventDefault();
        e.stopPropagation();
        if (filteredCommands[selectedIndex]) {
          console.log('🎯 Executing:', filteredCommands[selectedIndex].label);
          filteredCommands[selectedIndex].action();
        }
        break;

      case 'Tab':
        e.preventDefault(); // Prevent tab navigation
        break;
    }
  }, [filteredCommands, selectedIndex, onClose]);

  // Setup keyboard event listeners
  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener('keydown', handleKeyDown, { capture: true });
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[12vh] px-4 sm:px-6"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in slide-in-from-top-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Search */}
        <div className="flex items-center gap-4 p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Search className="w-5 h-5 text-white" />
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder="Komut veya sayfa arayın..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none text-lg font-medium"
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              ×
            </button>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Hash className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Sonuç bulunamadı
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Farklı anahtar kelimeler deneyin
              </p>
            </div>
          ) : (
            <div className="py-2">
              {filteredCommands.map((command, index) => {
                const Icon = command.icon;
                const isSelected = index === selectedIndex;
                
                return (
                  <div
                    key={command.id}
                    onClick={() => command.action()}
                    className={`relative flex items-center gap-4 px-6 py-4 cursor-pointer transition-all duration-150 ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-l-4 border-blue-500'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-150 ${
                      isSelected
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white scale-105 shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold text-lg leading-tight ${
                        isSelected 
                          ? 'text-blue-700 dark:text-blue-300' 
                          : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {command.label}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {command.description}
                      </div>
                    </div>
                    
                    {/* Category Badge */}
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      command.category === 'navigation'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    }`}>
                      {command.category === 'navigation' ? 'Gezinti' : 'Eylem'}
                    </div>
                    
                    {/* Arrow for selected */}
                    {isSelected && (
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-xs font-mono shadow-sm">
                    ↑
                  </kbd>
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-xs font-mono shadow-sm">
                    ↓
                  </kbd>
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Gezin
                </span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-xs font-mono shadow-sm">
                  Enter
                </kbd>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Seç
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md text-xs font-mono shadow-sm">
                Esc
              </kbd>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Kapat
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
