import React, { useState, useEffect, useMemo } from 'react';
import { Search, ArrowRight, Hash, Calendar, Settings, Home, BookOpen, CheckSquare } from 'lucide-react';
import { SpotlightTaskModal } from './SpotlightTaskModal';
import { SpotlightNoteModal } from './SpotlightNoteModal';

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
  icon: any;
  description: string;
  keywords: string[];
  type: 'navigation' | 'action';
  category: string;
}

const DEFAULT_COMMANDS: Command[] = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: Home, 
    description: 'Ana sayfa', 
    keywords: ['dashboard', 'ana', 'home'], 
    type: 'navigation', 
    category: 'navigation' 
  },
  { 
    id: 'notes', 
    label: 'Notlar', 
    icon: BookOpen, 
    description: 'Notlarınızı görüntüleyin', 
    keywords: ['notes', 'notlar', 'note'], 
    type: 'navigation', 
    category: 'content' 
  },
  { 
    id: 'tasks', 
    label: 'Görevler', 
    icon: CheckSquare, 
    description: 'Görevlerinizi yönetin', 
    keywords: ['tasks', 'görevler', 'task', 'todo'], 
    type: 'navigation', 
    category: 'content' 
  },
  { 
    id: 'weekly', 
    label: 'Haftalık Planlayıcı', 
    icon: Calendar, 
    description: 'Haftalık planınızı görün', 
    keywords: ['weekly', 'haftalık', 'planner', 'takvim'], 
    type: 'navigation', 
    category: 'planning' 
  },
  { 
    id: 'settings', 
    label: 'Ayarlar', 
    icon: Settings, 
    description: 'Uygulama ayarları', 
    keywords: ['settings', 'ayarlar', 'config'], 
    type: 'navigation', 
    category: 'system' 
  },
  { 
    id: 'new-note', 
    label: 'Yeni Not Oluştur', 
    icon: BookOpen, 
    description: 'Hızla yeni not ekleyin', 
    keywords: ['yeni', 'not', 'oluştur', 'ekle', 'new', 'note'], 
    type: 'action', 
    category: 'actions' 
  },
  { 
    id: 'new-task', 
    label: 'Yeni Görev Oluştur', 
    icon: CheckSquare, 
    description: 'Hızla yeni görev ekleyin', 
    keywords: ['yeni', 'görev', 'oluştur', 'ekle', 'new', 'task'], 
    type: 'action', 
    category: 'actions' 
  },
];

// LocalStorage helper functions
const getStorageItem = (key: string, defaultValue: any) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setStorageItem = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage errors
  }
};

export const Spotlight: React.FC<SpotlightProps> = ({ 
  isOpen, 
  onClose, 
  onNavigate, 
  onOpenNoteModal, 
  onOpenTaskModal 
}) => {
  // Core state
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showSpotlightTaskModal, setShowSpotlightTaskModal] = useState(false);
  const [showSpotlightNoteModal, setShowSpotlightNoteModal] = useState(false);

  // Settings state
  const [spotlightSettings, setSpotlightSettings] = useState(() => 
    getStorageItem('spotlightSettings', {})
  );
  const [spotlightOrder, setSpotlightOrder] = useState(() => 
    getStorageItem('spotlightOrder', [])
  );
  const [commandUsage, setCommandUsage] = useState(() => 
    getStorageItem('commandUsage', {})
  );

  // Sync settings from localStorage when component mounts or when isOpen changes
  useEffect(() => {
    if (isOpen) {
      const settings = getStorageItem('spotlightSettings', {});
      const order = getStorageItem('spotlightOrder', []);
      const usage = getStorageItem('commandUsage', {});
      
      setSpotlightSettings(settings);
      setSpotlightOrder(order);
      setCommandUsage(usage);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'spotlightSettings') {
        setSpotlightSettings(getStorageItem('spotlightSettings', {}));
      } else if (e.key === 'spotlightOrder') {
        setSpotlightOrder(getStorageItem('spotlightOrder', []));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Track command usage
  const trackCommandUsage = (commandId: string) => {
    const newUsage = { ...commandUsage, [commandId]: (commandUsage[commandId] || 0) + 1 };
    setCommandUsage(newUsage);
    setStorageItem('commandUsage', newUsage);
  };

  // Handle command execution
  const executeCommand = (command: Command) => {
    trackCommandUsage(command.id);
    
    if (command.type === 'navigation') {
      onNavigate(command.id);
      onClose();
    } else if (command.type === 'action') {
      if (command.id === 'new-note') {
        if (onOpenNoteModal) {
          onOpenNoteModal();
        } else {
          setShowSpotlightNoteModal(true);
        }
        onClose();
      } else if (command.id === 'new-task') {
        if (onOpenTaskModal) {
          onOpenTaskModal();
        } else {
          setShowSpotlightTaskModal(true);
        }
        onClose();
      }
    }
  };

  // Filter and sort commands
  const filteredCommands = useMemo(() => {
    let filtered = DEFAULT_COMMANDS;

    // Apply search filter
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      filtered = filtered.filter(command =>
        command.label.toLowerCase().includes(searchTerm) ||
        command.description.toLowerCase().includes(searchTerm) ||
        command.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
      );
    }

    // Apply visibility settings
    filtered = filtered.filter(command => {
      const isEnabled = spotlightSettings[command.id];
      return isEnabled !== false; // Show if true or undefined
    });

    // Apply sorting
    const orderType = spotlightSettings.commandOrder || 'default';
    
    switch (orderType) {
      case 'alphabetical':
        filtered.sort((a, b) => a.label.localeCompare(b.label, 'tr'));
        break;
      case 'usage':
        filtered.sort((a, b) => (commandUsage[b.id] || 0) - (commandUsage[a.id] || 0));
        break;
      case 'category':
        filtered.sort((a, b) => {
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
          }
          return a.label.localeCompare(b.label, 'tr');
        });
        break;
      case 'custom':
        if (spotlightOrder.length > 0) {
          filtered = filtered.filter(command => {
            const customItem = spotlightOrder.find((item: any) => item.id === command.id);
            return customItem ? customItem.enabled !== false : true;
          });
          
          filtered.sort((a, b) => {
            const orderA = spotlightOrder.findIndex((item: any) => item.id === a.id);
            const orderB = spotlightOrder.findIndex((item: any) => item.id === b.id);
            
            const indexA = orderA === -1 ? 999 : orderA;
            const indexB = orderB === -1 ? 999 : orderB;
            
            return indexA - indexB;
          });
        }
        break;
      default:
        // Keep original order
        break;
    }

    return filtered;
  }, [query, spotlightSettings, spotlightOrder, commandUsage]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, filteredCommands]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
        case 'Tab':
          e.preventDefault();
          if (filteredCommands.length > 0) {
            setSelectedIndex(prev => 
              prev >= Math.min(filteredCommands.length - 1, 5) ? 0 : prev + 1
            );
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (filteredCommands.length > 0) {
            setSelectedIndex(prev => 
              prev <= 0 ? Math.min(filteredCommands.length - 1, 5) : prev - 1
            );
          }
          break;
        case 'Enter':
          e.preventDefault();
          const visibleCommands = filteredCommands.slice(0, 6);
          if (visibleCommands[selectedIndex]) {
            executeCommand(visibleCommands[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  const visibleCommands = filteredCommands.slice(0, 6);

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-start justify-center pt-[8vh] sm:pt-[12vh] px-4 sm:px-6"
        onClick={onClose}
      >
        {/* Modal */}
        <div 
          className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <input
              autoFocus
              type="text"
              placeholder="Komut veya sayfa arayın..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none text-lg sm:text-xl font-medium"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                ×
              </button>
            )}
          </div>

          {/* Results */}
          <div className="max-h-[60vh] sm:max-h-[400px] overflow-hidden">
            {visibleCommands.length === 0 ? (
              <div className="p-8 sm:p-16 text-center text-gray-500 dark:text-gray-400">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                  <Hash className="w-8 h-8 sm:w-10 sm:h-10 opacity-40" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-700 dark:text-gray-300">
                  Sonuç bulunamadı
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Farklı anahtar kelimeler deneyin
                </p>
              </div>
            ) : (
              <div className="py-2">
                {visibleCommands.map((command, index) => {
                  const Icon = command.icon;
                  const isSelected = index === selectedIndex;
                  
                  return (
                    <div
                      key={command.id}
                      onClick={() => executeCommand(command)}
                      className={`relative flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800/30'
                      }`}
                    >
                      {/* Icon Container */}
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-150 ${
                        isSelected
                          ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 scale-105'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}>
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold text-base sm:text-lg leading-tight ${
                          isSelected 
                            ? 'text-blue-700 dark:text-blue-300' 
                            : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          {command.label}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                          {command.description}
                        </div>
                      </div>
                      
                      {/* Arrow Indicator */}
                      <div className={`transition-all duration-150 ${
                        isSelected ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
                      }`}>
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 dark:text-blue-400" />
                      </div>
                      
                      {/* Keyboard Shortcut */}
                      {isSelected && (
                        <div className="absolute right-2 top-2 hidden sm:block">
                          <kbd className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs rounded border">
                            Enter
                          </kbd>
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {filteredCommands.length > 6 && (
                  <div className="px-4 sm:px-6 py-3 sm:py-4 text-center border-t border-gray-100 dark:border-gray-800">
                    <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-full text-sm text-gray-600 dark:text-gray-400">
                      <span className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                      <span>+{filteredCommands.length - 6} sonuç daha var</span>
                      <span className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <kbd className="px-2 sm:px-2.5 py-1 sm:py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-mono font-medium shadow-sm">
                      ↑
                    </kbd>
                    <kbd className="px-2 sm:px-2.5 py-1 sm:py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-mono font-medium shadow-sm">
                      ↓
                    </kbd>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 hidden sm:inline">
                    Gezin
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 sm:px-3 py-1 sm:py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-mono font-medium shadow-sm">
                    Enter
                  </kbd>
                  <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 hidden sm:inline">
                    Seç
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 sm:px-3 py-1 sm:py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-mono font-medium shadow-sm">
                  Esc
                </kbd>
                <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 hidden sm:inline">
                  Kapat
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spotlight Modals */}
      <SpotlightTaskModal
        isOpen={showSpotlightTaskModal}
        onClose={() => setShowSpotlightTaskModal(false)}
      />
      
      <SpotlightNoteModal
        isOpen={showSpotlightNoteModal}
        onClose={() => setShowSpotlightNoteModal(false)}
      />
    </>
  );
};
