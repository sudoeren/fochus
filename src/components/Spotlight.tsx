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

const commands = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, description: 'Ana sayfa', keywords: ['dashboard', 'ana', 'home'], type: 'navigation', category: 'navigation' },
  { id: 'notes', label: 'Notlar', icon: BookOpen, description: 'Notlarınızı görüntüleyin', keywords: ['notes', 'notlar', 'note'], type: 'navigation', category: 'content' },
  { id: 'tasks', label: 'Görevler', icon: CheckSquare, description: 'Görevlerinizi yönetin', keywords: ['tasks', 'görevler', 'task', 'todo'], type: 'navigation', category: 'content' },
  { id: 'weekly', label: 'Haftalık Planlayıcı', icon: Calendar, description: 'Haftalık planınızı görün', keywords: ['weekly', 'haftalık', 'planner', 'takvim'], type: 'navigation', category: 'planning' },
  { id: 'settings', label: 'Ayarlar', icon: Settings, description: 'Uygulama ayarları', keywords: ['settings', 'ayarlar', 'config'], type: 'navigation', category: 'system' },
  { id: 'new-note', label: 'Yeni Not Oluştur', icon: BookOpen, description: 'Hızla yeni not ekleyin', keywords: ['yeni', 'not', 'oluştur', 'ekle', 'new', 'note'], type: 'action', category: 'actions' },
  { id: 'new-task', label: 'Yeni Görev Oluştur', icon: CheckSquare, description: 'Hızla yeni görev ekleyin', keywords: ['yeni', 'görev', 'oluştur', 'ekle', 'new', 'task'], type: 'action', category: 'actions' },
];

export const Spotlight: React.FC<SpotlightProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showSpotlightTaskModal, setShowSpotlightTaskModal] = useState(false);
  const [showSpotlightNoteModal, setShowSpotlightNoteModal] = useState(false);

  // Spotlight settings'i localStorage'dan al
  const spotlightSettings = useMemo(() => {
    return JSON.parse(localStorage.getItem('spotlightSettings') || '{}');
  }, []);

  // Command usage tracking
  const [commandUsage, setCommandUsage] = useState(() => {
    return JSON.parse(localStorage.getItem('commandUsage') || '{}');
  });

  // Filtered ve sorted commands
  const filteredCommands = useMemo(() => {
    let filtered = commands.filter(command =>
      command.label.toLowerCase().includes(query.toLowerCase()) ||
      command.description.toLowerCase().includes(query.toLowerCase()) ||
      command.keywords.some(keyword => keyword.toLowerCase().includes(query.toLowerCase()))
    );

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
      default:
        // Default order - keep original order
        break;
    }

    return filtered;
  }, [query, spotlightSettings.commandOrder, commandUsage]);

  const trackCommandUsage = (commandId: string) => {
    const newUsage = { ...commandUsage, [commandId]: (commandUsage[commandId] || 0) + 1 };
    setCommandUsage(newUsage);
    localStorage.setItem('commandUsage', JSON.stringify(newUsage));
  };

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleCommand = (command: any) => {
    // Track command usage
    trackCommandUsage(command.id);
    
    if (command.type === 'navigation') {
      onNavigate(command.id);
      onClose();
    } else if (command.type === 'action') {
      if (command.id === 'new-note') {
        setShowSpotlightNoteModal(true);
        onClose();
      } else if (command.id === 'new-task') {
        setShowSpotlightTaskModal(true);
        onClose();
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            handleCommand(filteredCommands[selectedIndex]);
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
  }, [isOpen, filteredCommands, selectedIndex, onNavigate, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            autoFocus
            type="text"
            placeholder="Arama yapın..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none text-lg"
          />
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Hash className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Sonuç bulunamadı</p>
            </div>
          ) : (
            <div className="py-2">
              {filteredCommands.map((command, index) => {
                const Icon = command.icon;
                return (
                  <button
                    key={command.id}
                    onClick={() => handleCommand(command)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      index === selectedIndex
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{command.label}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {command.description}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 flex-shrink-0 opacity-50" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded text-xs">↑↓</kbd>
                Seç
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded text-xs">Enter</kbd>
                Aç
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded text-xs">Esc</kbd>
              Kapat
            </span>
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
