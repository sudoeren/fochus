import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, FileText, CheckSquare, Calendar, Settings, Trash2, Pin, Home, X } from 'lucide-react';
import { useNotes } from '../hooks/useNotes';
import { useTasks } from '../hooks/useTasks';

interface SpotlightProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: 'note' | 'task' | 'command' | 'navigation';
  icon: React.ReactNode;
  action: () => void;
  data?: any;
}

export const Spotlight: React.FC<SpotlightProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mode, setMode] = useState<'search' | 'create-note' | 'create-task'>('search');
  const [creationData, setCreationData] = useState({
    title: '',
    content: '',
    description: '',
    dueDate: ''
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const { notes, addNote } = useNotes();
  const { tasks, addTask } = useTasks();

  const resetSpotlight = () => {
    setQuery('');
    setSelectedIndex(0);
    setMode('search');
    setCreationData({ title: '', content: '', description: '', dueDate: '' });
  };

  // Commands
  const commands: SearchResult[] = [
    {
      id: 'new-note',
      title: 'Yeni Not Oluştur',
      subtitle: 'Spotlight içinde not oluşturun',
      type: 'command',
      icon: <FileText className="w-4 h-4" />,
      action: () => {
        setMode('create-note');
        setCreationData({ title: '', content: '', description: '', dueDate: '' });
      }
    },
    {
      id: 'new-task',
      title: 'Yeni Görev Oluştur',
      subtitle: 'Hızlı görev ekleme',
      type: 'command',
      icon: <CheckSquare className="w-4 h-4" />,
      action: () => {
        setMode('create-task');
        setCreationData({ title: '', content: '', description: '', dueDate: '' });
      }
    },
    ...(query.trim() ? [{
      id: 'search-web',
      title: `"${query.trim()}" için web araması yap`,
      subtitle: 'Google\'da ara',
      type: 'command' as const,
      icon: <Search className="w-4 h-4" />,
      action: () => {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(query.trim())}`, '_blank');
        onClose();
      }
    }] : [])
  ];

  // Navigation items
  const navigationItems: SearchResult[] = [
    {
      id: 'nav-dashboard',
      title: 'Ana Sayfa',
      subtitle: 'Günlük özet ve istatistikler',
      type: 'navigation',
      icon: <Home className="w-4 h-4" />,
      action: () => {
        onNavigate('dashboard');
        onClose();
      }
    },
    {
      id: 'nav-notes',
      title: 'Notlar',
      subtitle: 'Tüm notlarını görüntüle',
      type: 'navigation',
      icon: <FileText className="w-4 h-4" />,
      action: () => {
        onNavigate('notes');
        onClose();
      }
    },
    {
      id: 'nav-tasks',
      title: 'Görevler',
      subtitle: 'Günlük görevlerin',
      type: 'navigation',
      icon: <CheckSquare className="w-4 h-4" />,
      action: () => {
        onNavigate('tasks');
        onClose();
      }
    },
    {
      id: 'nav-weekly',
      title: 'Haftalık Plan',
      subtitle: 'Haftalık görünüm',
      type: 'navigation',
      icon: <Calendar className="w-4 h-4" />,
      action: () => {
        onNavigate('weekly');
        onClose();
      }
    },
    {
      id: 'nav-trash',
      title: 'Çöp Kutusu',
      subtitle: 'Silinen öğeler',
      type: 'navigation',
      icon: <Trash2 className="w-4 h-4" />,
      action: () => {
        onNavigate('trash');
        onClose();
      }
    },
    {
      id: 'nav-settings',
      title: 'Ayarlar',
      subtitle: 'Uygulama ayarları',
      type: 'navigation',
      icon: <Settings className="w-4 h-4" />,
      action: () => {
        onNavigate('settings');
        onClose();
      }
    }
  ];

  // Search results (only for search mode)
  const searchResults = useMemo(() => {
    if (mode !== 'search') return [];
    
    if (!query.trim()) {
      return [...commands, ...navigationItems];
    }

    const queryLower = query.toLowerCase();
    const results: SearchResult[] = [];

    // Add matching commands and navigation
    [...commands, ...navigationItems].forEach(item => {
      if (item.title.toLowerCase().includes(queryLower) || 
          item.subtitle?.toLowerCase().includes(queryLower)) {
        results.push(item);
      }
    });

    // Search in notes
    notes.forEach(note => {
      const titleMatch = note.title.toLowerCase().includes(queryLower);
      const contentMatch = note.content.toLowerCase().includes(queryLower);

      if (titleMatch || contentMatch) {
        results.push({
          id: `note-${note.id}`,
          title: note.title,
          subtitle: note.content.substring(0, 60) + (note.content.length > 60 ? '...' : ''),
          type: 'note',
          icon: (
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              {note.isPinned && <Pin className="w-2 h-2 text-yellow-500" />}
            </div>
          ),
          action: () => {
            onNavigate('notes');
            onClose();
            // Focus on the note after navigation
            setTimeout(() => {
              const noteElement = document.querySelector(`[data-note-id="${note.id}"]`);
              noteElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
          },
          data: note
        });
      }
    });

    // Search in tasks
    tasks.forEach(task => {
      const titleMatch = task.title.toLowerCase().includes(queryLower);
      const descMatch = task.description?.toLowerCase().includes(queryLower);

      if (titleMatch || descMatch) {
        results.push({
          id: `task-${task.id}`,
          title: task.title,
          subtitle: task.description || (task.isCompleted ? 'Tamamlandı' : 'Bekliyor'),
          type: 'task',
          icon: (
            <div className="flex items-center gap-1">
              <CheckSquare className="w-4 h-4" />
              {task.isPinned && <Pin className="w-2 h-2 text-yellow-500" />}
            </div>
          ),
          action: () => {
            onNavigate('tasks');
            onClose();
            // Focus on the task after navigation
            setTimeout(() => {
              const taskElement = document.querySelector(`[data-task-id="${task.id}"]`);
              taskElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
          },
          data: task
        });
      }
    });

    return results;
  }, [mode, query, notes, tasks, commands, navigationItems, onNavigate, onClose, addNote, addTask]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // If in creation mode, handle ESC differently
      if (mode !== 'search') {
        if (e.key === 'Escape') {
          e.preventDefault();
          setMode('search');
          setCreationData({ title: '', content: '', description: '', dueDate: '' });
        }
        return;
      }

      // Normal search mode navigation
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < searchResults.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : searchResults.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (searchResults[selectedIndex]) {
            searchResults[selectedIndex].action();
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
  }, [isOpen, selectedIndex, searchResults, onClose, mode]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      resetSpotlight();
    }
  }, [isOpen]);

  // Update selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchResults.length]);

  if (!isOpen) return null;

  // Render different modes
  const renderContent = () => {
    switch (mode) {
      case 'create-note':
        return (
          <div className="space-y-4">
            {/* Note Creation Header */}
            <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-700/50">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300">Yeni Not Oluştur</h3>
                <p className="text-sm text-blue-700 dark:text-blue-400">Spotlighttan çıkmadan not oluşturun</p>
              </div>
              <button
                onClick={() => {
                  setMode('search');
                  setCreationData({ title: '', content: '', description: '', dueDate: '' });
                }}
                className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Note Form */}
            <div className="p-4 space-y-4">
              <input
                type="text"
                value={creationData.title}
                onChange={(e) => setCreationData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Not başlığı..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <textarea
                value={creationData.content}
                onChange={(e) => setCreationData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Not içeriği..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={async () => {
                    if (creationData.title.trim()) {
                      await addNote({ title: creationData.title, content: creationData.content });
                      resetSpotlight();
                      onClose();
                    }
                  }}
                  disabled={!creationData.title.trim()}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg disabled:cursor-not-allowed transition-colors"
                >
                  Notu Kaydet
                </button>
              </div>
            </div>
          </div>
        );

      case 'create-task':
        return (
          <div className="space-y-4">
            {/* Task Creation Header */}
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border-b border-green-200 dark:border-green-700/50">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 dark:text-green-300">Yeni Görev Oluştur</h3>
                <p className="text-sm text-green-700 dark:text-green-400">Hızlı görev ekleme</p>
              </div>
              <button
                onClick={() => {
                  setMode('search');
                  setCreationData({ title: '', content: '', description: '', dueDate: '' });
                }}
                className="p-1 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800/50 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Task Form */}
            <div className="p-4 space-y-4">
              <input
                type="text"
                value={creationData.title}
                onChange={(e) => setCreationData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Görev başlığı..."
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                autoFocus
              />
              <textarea
                value={creationData.description}
                onChange={(e) => setCreationData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Açıklama (opsiyonel)..."
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
              <input
                type="date"
                value={creationData.dueDate}
                onChange={(e) => setCreationData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={async () => {
                    if (creationData.title.trim()) {
                      const taskToAdd = {
                        title: creationData.title,
                        description: creationData.description,
                        ...(creationData.dueDate && { dueDate: new Date(creationData.dueDate) })
                      };
                      await addTask(taskToAdd);
                      resetSpotlight();
                      onClose();
                    }
                  }}
                  disabled={!creationData.title.trim()}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg disabled:cursor-not-allowed transition-colors"
                >
                  Görevi Kaydet
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <>
            {/* Search Input */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ara, komut çalıştır veya yeni öğe oluştur..."
                  className="w-full pl-10 pr-4 py-3 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none text-lg"
                />
              </div>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {searchResults.length > 0 ? (
                <div className="py-2">
                  {searchResults.map((result, index) => (
                    <button
                      key={result.id}
                      onClick={result.action}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-3 ${
                        index === selectedIndex 
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500' 
                          : ''
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                        {result.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          {result.title}
                        </div>
                        {result.subtitle && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {result.subtitle}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                        {getTypeLabel(result.type)}
                      </div>
                    </button>
                  ))}
                </div>
              ) : query.trim() ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>"{query}" için sonuç bulunamadı</p>
                  <div className="mt-4 space-x-2">
                    <button
                      onClick={() => {
                        const title = query.trim();
                        addNote({ title, content: '' });
                        onNavigate('notes');
                        onClose();
                      }}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Not olarak oluştur
                    </button>
                    <span className="text-gray-300">•</span>
                    <button
                      onClick={() => {
                        const title = query.trim();
                        addTask({ title, description: '' });
                        onNavigate('tasks');
                        onClose();
                      }}
                      className="text-sm text-green-600 dark:text-green-400 hover:underline"
                    >
                      Görev olarak oluştur
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="font-semibold mb-2">Hızlı Komutlar</div>
                      <div className="space-y-1">
                        <div>Ctrl+K - Arama</div>
                        <div>Ctrl+N - Yeni Not</div>
                        <div>Ctrl+T - Yeni Görev</div>
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold mb-2">İpuçları</div>
                      <div className="space-y-1">
                        <div>Sayfa adı yazarak git</div>
                        <div>Not/görev adı ile ara</div>
                        <div>Yazıp Enter'a bas</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-4">
                  <span>↑↓ Gezin</span>
                  <span>Enter Seç</span>
                  <span>Esc Kapat</span>
                </div>
                <div className="text-right">
                  {searchResults.length} sonuç
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl mx-4 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'note':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
    case 'task':
      return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
    case 'command':
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
    case 'navigation':
      return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
    default:
      return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'note':
      return 'Not';
    case 'task':
      return 'Görev';
    case 'command':
      return 'Komut';
    case 'navigation':
      return 'Sayfa';
    default:
      return '';
  }
};
