import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, Home, BookOpen, CheckSquare, Calendar, Settings } from 'lucide-react';

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

  // Commands - Simple array, no complexity
  const commands: Command[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      description: 'Ana sayfa',
      action: () => {
        onNavigate('dashboard');
        onClose();
      }
    },
    {
      id: 'notes',
      label: 'Notlar',
      icon: BookOpen,
      description: 'Notlarınızı görüntüleyin',
      action: () => {
        onNavigate('notes');
        onClose();
      }
    },
    {
      id: 'tasks',
      label: 'Görevler',
      icon: CheckSquare,
      description: 'Görevlerinizi yönetin',
      action: () => {
        onNavigate('tasks');
        onClose();
      }
    },
    {
      id: 'weekly',
      label: 'Haftalık Planlayıcı',
      icon: Calendar,
      description: 'Haftalık planınızı görün',
      action: () => {
        onNavigate('weekly');
        onClose();
      }
    },
    {
      id: 'settings',
      label: 'Ayarlar',
      icon: Settings,
      description: 'Uygulama ayarları',
      action: () => {
        onNavigate('settings');
        onClose();
      }
    },
    {
      id: 'new-note',
      label: 'Yeni Not Oluştur',
      icon: BookOpen,
      description: 'Hızla yeni not ekleyin',
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
      icon: CheckSquare,
      description: 'Hızla yeni görev ekleyin',
      action: () => {
        if (onOpenTaskModal) {
          onOpenTaskModal();
        }
        onClose();
      }
    }
  ];

  // Filter commands - Simple filter
  const filteredCommands = commands.filter(command =>
    command.label.toLowerCase().includes(query.toLowerCase()) ||
    command.description.toLowerCase().includes(query.toLowerCase())
  );

  // Reset selection when commands change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredCommands]);

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard handling - SIMPLE AND WORKING
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      console.log('Key pressed:', e.key); // Debug

      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        console.log('ESC pressed - closing spotlight');
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        if (filteredCommands[selectedIndex]) {
          console.log('Executing command:', filteredCommands[selectedIndex].label);
          filteredCommands[selectedIndex].action();
        }
        return;
      }
    };

    // Add listener with capture=true to ensure we get the event first
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-[15vh] px-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-4 p-6 border-b border-gray-200 dark:border-gray-700">
          <Search className="w-6 h-6 text-gray-400" />
          <input
            autoFocus
            type="text"
            placeholder="Komut veya sayfa arayın..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none text-lg"
          />
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Search className="w-8 h-8 opacity-40" />
              </div>
              <p>Sonuç bulunamadı</p>
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
                    className={`flex items-center gap-4 px-6 py-4 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isSelected
                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1">
                      <div className={`font-medium ${
                        isSelected 
                          ? 'text-blue-700 dark:text-blue-300' 
                          : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {command.label}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {command.description}
                      </div>
                    </div>
                    
                    {isSelected && (
                      <ArrowRight className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs">
                  ↑↓
                </kbd>
                <span>Gezin</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs">
                  Enter
                </kbd>
                <span>Seç</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs">
                Esc
              </kbd>
              <span>Kapat</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
