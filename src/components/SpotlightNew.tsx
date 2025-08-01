import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, CheckSquare, Calendar, Settings, Home, Trash, ArrowRight, Clock, Star, Plus, User, ChevronsRight } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { useNotes } from '../hooks/useNotes';

interface SpotlightProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  onCreateNote: () => void;
  onCreateTask: () => void;
  onEditNote?: (note: any) => void;
  onEditTask?: (task: any) => void;
}

export const SpotlightNew: React.FC<SpotlightProps> = ({ 
  isOpen, 
  onClose, 
  onNavigate,
  onCreateNote,
  onCreateTask,
  onEditNote,
  onEditTask
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { tasks } = useTasks();
  const { notes } = useNotes();

  // Spotlight ayarları localStorage'dan okunacak
  const spotlightSettings = JSON.parse(localStorage.getItem('spotlightSettings') || '{}');
  const {
    showRecentItems = true,
    showQuickActions = true,
    showNavigation = true,
    maxResults = 5,
    searchInContent = true
  } = spotlightSettings;

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const navigationCommands = [
    { id: 'nav-dashboard', title: 'Anasayfa', icon: Home, action: () => onNavigate('dashboard') },
    { id: 'nav-notes', title: 'Notlarım', icon: FileText, action: () => onNavigate('notes') },
    { id: 'nav-tasks', title: 'Görevlerim', icon: CheckSquare, action: () => onNavigate('tasks') },
    { id: 'nav-weekly', title: 'Haftalık Planlayıcı', icon: Calendar, action: () => onNavigate('weekly') },
    { id: 'nav-trash', title: 'Çöp Kutusu', icon: Trash, action: () => onNavigate('trash') },
    { id: 'nav-settings', title: 'Ayarlar', icon: Settings, action: () => onNavigate('settings') }
  ];

  const quickActions = [
    { id: 'create-note', title: 'Yeni Not Oluştur', icon: Plus, action: onCreateNote, keyword: 'not ekle' },
    { id: 'create-task', title: 'Yeni Görev Oluştur', icon: Plus, action: onCreateTask, keyword: 'görev ekle' },
    { id: 'show-today-tasks', title: 'Bugünün Görevleri', icon: Clock, action: () => {
      onNavigate('tasks');
      onClose();
    }, keyword: 'bugün' },
    { id: 'show-pinned', title: 'Sabitlenen Öğeler', icon: Star, action: () => {
      // Sabitlenmiş öğeleri göster
      onNavigate('dashboard');
      onClose();
    }, keyword: 'sabitli' }
  ];

  const recentItems = [
    ...tasks.slice(0, 3).map(task => ({
      id: `task-${task.id}`,
      title: task.title,
      subtitle: task.description,
      icon: CheckSquare,
      action: () => onEditTask?.(task),
      type: 'task'
    })),
    ...notes.slice(0, 3).map(note => ({
      id: `note-${note.id}`,
      title: note.title,
      subtitle: note.content?.substring(0, 50) + '...',
      icon: FileText,
      action: () => onEditNote?.(note),
      type: 'note'
    }))
  ];

  const searchResults = () => {
    if (!query.trim()) {
      const results = [];
      
      if (showQuickActions) {
        results.push(...quickActions);
      }
      
      if (showNavigation) {
        results.push(...navigationCommands);
      }
      
      if (showRecentItems) {
        results.push(...recentItems.slice(0, maxResults));
      }
      
      return results.slice(0, 12);
    }

    const queryLower = query.toLowerCase();
    const results = [];

    // Quick actions araması
    quickActions.forEach(action => {
      if (action.title.toLowerCase().includes(queryLower) || 
          action.keyword.toLowerCase().includes(queryLower)) {
        results.push({ ...action, relevance: 100 });
      }
    });

    // Navigation araması
    navigationCommands.forEach(nav => {
      if (nav.title.toLowerCase().includes(queryLower)) {
        results.push({ ...nav, relevance: 90 });
      }
    });

    // Tasks araması
    tasks.forEach(task => {
      const titleMatch = task.title.toLowerCase().includes(queryLower);
      const descMatch = searchInContent && task.description?.toLowerCase().includes(queryLower);
      
      if (titleMatch || descMatch) {
        results.push({
          id: `task-${task.id}`,
          title: task.title,
          subtitle: task.description,
          icon: CheckSquare,
          action: () => onEditTask?.(task),
          type: 'task',
          relevance: titleMatch ? 80 : 60
        });
      }
    });

    // Notes araması
    notes.forEach(note => {
      const titleMatch = note.title.toLowerCase().includes(queryLower);
      const contentMatch = searchInContent && note.content?.toLowerCase().includes(queryLower);
      
      if (titleMatch || contentMatch) {
        results.push({
          id: `note-${note.id}`,
          title: note.title,
          subtitle: note.content?.substring(0, 50) + '...',
          icon: FileText,
          action: () => onEditNote?.(note),
          type: 'note',
          relevance: titleMatch ? 80 : 60
        });
      }
    });

    // Relevance'a göre sırala ve limit uygula
    return results
      .sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
      .slice(0, maxResults);
  };

  const filteredResults = searchResults();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredResults.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredResults[selectedIndex]) {
          filteredResults[selectedIndex].action();
          onClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
      case 'Tab':
        e.preventDefault();
        if (e.shiftKey) {
          setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else {
          setSelectedIndex(prev => Math.min(prev + 1, filteredResults.length - 1));
        }
        break;
    }
  };

  // Selected item scroll into view
  useEffect(() => {
    if (resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  // Query değiştiğinde selection reset
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 pt-20 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Arama yapın veya komut girin..."
            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none text-lg"
          />
          <div className="flex gap-1">
            <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded border">↑↓</kbd>
            <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded border">Enter</kbd>
            <kbd className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded border">Esc</kbd>
          </div>
        </div>

        {/* Results */}
        <div ref={resultsRef} className="max-h-96 overflow-y-auto">
          {filteredResults.length > 0 ? (
            <>
              {!query && showQuickActions && (
                <div className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-100 dark:border-gray-700">
                  Hızlı Eylemler
                </div>
              )}
              
              {filteredResults.map((result, index) => {
                const Icon = result.icon;
                const isSelected = index === selectedIndex;
                
                return (
                  <button
                    key={result.id}
                    onClick={() => {
                      result.action();
                      onClose();
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      isSelected ? 'bg-blue-50 dark:bg-blue-900/30 border-r-2 border-blue-500' : ''
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${
                      isSelected 
                        ? 'text-blue-500' 
                        : result.type === 'task' 
                          ? 'text-green-500' 
                          : result.type === 'note'
                            ? 'text-purple-500'
                            : 'text-gray-400'
                    }`} />
                    
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium ${
                        isSelected 
                          ? 'text-blue-900 dark:text-blue-100' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {result.title}
                      </div>
                      {result.subtitle && (
                        <div className={`text-sm truncate ${
                          isSelected 
                            ? 'text-blue-700 dark:text-blue-300' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {result.subtitle}
                        </div>
                      )}
                    </div>
                    
                    {isSelected && (
                      <ArrowRight className="w-4 h-4 text-blue-500" />
                    )}
                  </button>
                );
              })}
            </>
          ) : (
            <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Arama sonucu bulunamadı</p>
              <p className="text-sm mt-1">Farklı anahtar kelimeler deneyin</p>
            </div>
          )}
        </div>

        {/* Keyboard shortcuts info */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span><ChevronsRight className="w-3 h-3 inline mr-1" />Tab ile gezin</span>
              <span><ArrowRight className="w-3 h-3 inline mr-1" />Enter ile seçin</span>
            </div>
            <span>Ctrl+K ile açın</span>
          </div>
        </div>
      </div>
    </div>
  );
};
