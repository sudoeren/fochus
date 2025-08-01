import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

const commands = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, description: 'Ana sayfa', keywords: ['dashboard', 'ana', 'home'], type: 'navigation', category: 'navigation' },
  { id: 'notes', label: 'Notlar', icon: BookOpen, description: 'Notlarınızı görüntüleyin', keywords: ['notes', 'notlar', 'note'], type: 'navigation', category: 'content' },
  { id: 'tasks', label: 'Görevler', icon: CheckSquare, description: 'Görevlerinizi yönetin', keywords: ['tasks', 'görevler', 'task', 'todo'], type: 'navigation', category: 'content' },
  { id: 'weekly', label: 'Haftalık Planlayıcı', icon: Calendar, description: 'Haftalık planınızı görün', keywords: ['weekly', 'haftalık', 'planner', 'takvim'], type: 'navigation', category: 'planning' },
  { id: 'settings', label: 'Ayarlar', icon: Settings, description: 'Uygulama ayarları', keywords: ['settings', 'ayarlar', 'config'], type: 'navigation', category: 'system' },
  { id: 'new-note', label: 'Yeni Not Oluştur', icon: BookOpen, description: 'Hızla yeni not ekleyin', keywords: ['yeni', 'not', 'oluştur', 'ekle', 'new', 'note'], type: 'action', category: 'actions' },
  { id: 'new-task', label: 'Yeni Görev Oluştur', icon: CheckSquare, description: 'Hızla yeni görev ekleyin', keywords: ['yeni', 'görev', 'oluştur', 'ekle', 'new', 'task'], type: 'action', category: 'actions' },
];

export const Spotlight: React.FC<SpotlightProps> = ({ isOpen, onClose, onNavigate, onOpenNoteModal, onOpenTaskModal }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showSpotlightTaskModal, setShowSpotlightTaskModal] = useState(false);
  const [showSpotlightNoteModal, setShowSpotlightNoteModal] = useState(false);

  // Spotlight settings'i localStorage'dan al
  const [spotlightSettings, setSpotlightSettingsState] = useState(() => {
    return JSON.parse(localStorage.getItem('spotlightSettings') || '{}');
  });

  // LocalStorage değişikliklerini dinle
  useEffect(() => {
    const handleStorageChange = () => {
      setSpotlightSettingsState(JSON.parse(localStorage.getItem('spotlightSettings') || '{}'));
      setSpotlightOrderState(JSON.parse(localStorage.getItem('spotlightOrder') || '[]'));
    };

    // Storage event listener (farklı sekmeler için)
    window.addEventListener('storage', handleStorageChange);
    
    // Ayrıca focus event'ini de dinle (aynı sekme içi değişiklikler için)
    const checkLocalStorage = () => {
      setSpotlightSettingsState(JSON.parse(localStorage.getItem('spotlightSettings') || '{}'));
      setSpotlightOrderState(JSON.parse(localStorage.getItem('spotlightOrder') || '[]'));
    };

    window.addEventListener('focus', checkLocalStorage);
    
    // Aynı sekme içi değişiklikler için polling (her 500ms)
    const pollInterval = setInterval(checkLocalStorage, 500);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', checkLocalStorage);
      clearInterval(pollInterval);
    };
  }, []);

  // Command usage tracking
  const [commandUsage, setCommandUsage] = useState(() => {
    return JSON.parse(localStorage.getItem('commandUsage') || '{}');
  });

  // Spotlight order state
  const [spotlightOrder, setSpotlightOrderState] = useState(() => {
    return JSON.parse(localStorage.getItem('spotlightOrder') || '[]');
  });

  // Filtered ve sorted commands
  const filteredCommands = useMemo(() => {
    let filtered;
    
    if (query.trim() === '') {
      // Arama yapılmadığında tüm komutları göster
      filtered = commands;
    } else {
      // Arama yapıldığında tüm komutları filtrele
      filtered = commands.filter(command =>
        command.label.toLowerCase().includes(query.toLowerCase()) ||
        command.description.toLowerCase().includes(query.toLowerCase()) ||
        command.keywords.some(keyword => keyword.toLowerCase().includes(query.toLowerCase()))
      );
    }

    // Apply spotlight settings filtering
    filtered = filtered.filter(command => {
      // Check if the command is enabled in settings
      // If no settings exist, show all commands (default: true)
      if (!spotlightSettings || Object.keys(spotlightSettings).length === 0) {
        return true; // Default: show all commands when no settings
      }
      
      // If setting exists, use its value. If not exists, default to true
      const isEnabled = spotlightSettings[command.id];
      return isEnabled !== false; // Show if true or undefined, hide if false
    });

    // Apply ordering based on settings
    const orderType = spotlightSettings.commandOrder || 'default';
    
    switch (orderType) {
      case 'alphabetical':
        filtered = filtered.sort((a, b) => a.label.localeCompare(b.label, 'tr'));
        break;
      case 'usage':
        filtered = filtered.sort((a, b) => (commandUsage[b.id] || 0) - (commandUsage[a.id] || 0));
        break;
      case 'category':
        filtered = filtered.sort((a, b) => {
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
          }
          return a.label.localeCompare(b.label, 'tr');
        });
        break;
      case 'custom':
        // Custom ordering based on user preference
        if (spotlightOrder.length > 0) {
          // First filter out disabled items
          filtered = filtered.filter(command => {
            const customItem = spotlightOrder.find((item: any) => item.id === command.id);
            return customItem ? customItem.enabled : true;
          });
          
          // Then sort according to custom order
          filtered = filtered.sort((a, b) => {
            const orderA = spotlightOrder.findIndex((item: any) => item.id === a.id);
            const orderB = spotlightOrder.findIndex((item: any) => item.id === b.id);
            
            // If item not found in custom order, put it at the end
            const indexA = orderA === -1 ? 999 : orderA;
            const indexB = orderB === -1 ? 999 : orderB;
            
            return indexA - indexB;
          });
        }
        break;
      default:
        // Default order - keep original order
        break;
    }

    return filtered;
  }, [query, spotlightSettings, spotlightOrder, commandUsage]);

  const trackCommandUsage = (commandId: string) => {
    const newUsage = { ...commandUsage, [commandId]: (commandUsage[commandId] || 0) + 1 };
    setCommandUsage(newUsage);
    localStorage.setItem('commandUsage', JSON.stringify(newUsage));
  };

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      
      // Spotlight açıldığında settings'i yenile
      setSpotlightSettingsState(JSON.parse(localStorage.getItem('spotlightSettings') || '{}'));
      setSpotlightOrderState(JSON.parse(localStorage.getItem('spotlightOrder') || '[]'));
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleCommand = useCallback((command: any) => {
    // Track command usage
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
  }, [onNavigate, onClose, onOpenNoteModal, onOpenTaskModal, commandUsage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
        case 'Tab':
          if (filteredCommands.length === 0) return;
          e.preventDefault();
          const maxIndex = Math.min(filteredCommands.length, 6) - 1;
          setSelectedIndex(prev => {
            const newIndex = prev + 1;
            return newIndex > maxIndex ? 0 : newIndex; // Circular navigation
          });
          break;
        case 'ArrowUp':
          if (filteredCommands.length === 0) return;
          e.preventDefault();
          const maxIndexUp = Math.min(filteredCommands.length, 6) - 1;
          setSelectedIndex(prev => {
            const newIndex = prev - 1;
            return newIndex < 0 ? maxIndexUp : newIndex; // Circular navigation
          });
          break;
        case 'Enter':
          if (filteredCommands.length === 0) return;
          e.preventDefault();
          const visibleCommands = filteredCommands.slice(0, 6);
          if (visibleCommands[selectedIndex]) {
            handleCommand(visibleCommands[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose, handleCommand]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh] sm:pt-[12vh] bg-black/70 backdrop-blur-md px-4 sm:px-6">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
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
          {filteredCommands.length === 0 ? (
            <div className="p-8 sm:p-16 text-center text-gray-500 dark:text-gray-400">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                <Hash className="w-8 h-8 sm:w-10 sm:h-10 opacity-40" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-gray-700 dark:text-gray-300">Sonuç bulunamadı</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Farklı anahtar kelimeler deneyin</p>
            </div>
          ) : (
            <div className="py-2">
              {filteredCommands.slice(0, 6).map((command, index) => {
                const Icon = command.icon;
                const isSelected = index === selectedIndex;
                return (
                  <div
                    key={command.id}
                    onClick={() => handleCommand(command)}
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
                <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 hidden sm:inline">Gezin</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 sm:px-3 py-1 sm:py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-mono font-medium shadow-sm">
                  Enter
                </kbd>
                <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 hidden sm:inline">Seç</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 sm:px-3 py-1 sm:py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-mono font-medium shadow-sm">
                Esc
              </kbd>
              <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 hidden sm:inline">Kapat</span>
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
    </div>
  );
};
