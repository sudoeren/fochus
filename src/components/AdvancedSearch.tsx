import React, { useState, useEffect, useMemo } from 'react';
import { Search, FileText, CheckSquare, X } from 'lucide-react';
import { SearchResult, Note, Task } from '../types';

interface AdvancedSearchProps {
  notes: Note[];
  tasks: Task[];
  onSelect: (type: 'note' | 'task', id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  notes,
  tasks,
  onSelect,
  isOpen,
  onClose,
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'notes' | 'tasks'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Search function with scoring
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase();
    const results: SearchResult[] = [];

    // Search in notes
    if (selectedType === 'all' || selectedType === 'notes') {
      notes.forEach(note => {
        if (note.isDeleted) return;

        let score = 0;
        let matchedText = '';

        // Title match (highest priority)
        if (note.title.toLowerCase().includes(searchTerm)) {
          score += 10;
          matchedText = note.title;
        }

        // Content match
        const plainContent = note.plainContent || note.content;
        if (plainContent.toLowerCase().includes(searchTerm)) {
          score += 5;
          if (!matchedText) {
            const index = plainContent.toLowerCase().indexOf(searchTerm);
            const start = Math.max(0, index - 30);
            const end = Math.min(plainContent.length, index + searchTerm.length + 30);
            matchedText = '...' + plainContent.slice(start, end) + '...';
          }
        }

        // Tags match
        if (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchTerm))) {
          score += 7;
          if (!matchedText) {
            matchedText = `Etiket: ${note.tags.find(tag => tag.toLowerCase().includes(searchTerm))}`;
          }
        }

        if (score > 0) {
          results.push({
            type: 'note',
            id: note.id,
            title: note.title,
            content: plainContent,
            matchedText,
            score
          });
        }
      });
    }

    // Search in tasks
    if (selectedType === 'all' || selectedType === 'tasks') {
      tasks.forEach(task => {
        if (task.isDeleted) return;

        let score = 0;
        let matchedText = '';

        // Title match (highest priority)
        if (task.title.toLowerCase().includes(searchTerm)) {
          score += 10;
          matchedText = task.title;
        }

        // Description match
        if (task.description && task.description.toLowerCase().includes(searchTerm)) {
          score += 5;
          if (!matchedText) {
            const index = task.description.toLowerCase().indexOf(searchTerm);
            const start = Math.max(0, index - 30);
            const end = Math.min(task.description.length, index + searchTerm.length + 30);
            matchedText = '...' + task.description.slice(start, end) + '...';
          }
        }

        if (score > 0) {
          results.push({
            type: 'task',
            id: task.id,
            title: task.title,
            content: task.description,
            matchedText,
            score
          });
        }
      });
    }

    // Sort by score (highest first)
    return results.sort((a, b) => b.score - a.score);
  }, [query, notes, tasks, selectedType]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

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
            const result = searchResults[selectedIndex];
            onSelect(result.type, result.id);
            onClose();
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
  }, [isOpen, searchResults, selectedIndex, onSelect, onClose]);

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, selectedType]);

  if (!isOpen) return null;

  const highlightMatch = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20">
      <div className={`w-full max-w-2xl mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 ${className}`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Notlar ve görevlerde ara..."
              className="flex-1 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 border-none outline-none text-lg"
              autoFocus
            />
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                selectedType === 'all'
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Tümü ({notes.filter(n => !n.isDeleted).length + tasks.filter(t => !t.isDeleted).length})
            </button>
            <button
              onClick={() => setSelectedType('notes')}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                selectedType === 'notes'
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Notlar ({notes.filter(n => !n.isDeleted).length})
            </button>
            <button
              onClick={() => setSelectedType('tasks')}
              className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                selectedType === 'tasks'
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Görevler ({tasks.filter(t => !t.isDeleted).length})
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {query.trim() && searchResults.length === 0 && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Arama sonucu bulunamadı</p>
            </div>
          )}

          {!query.trim() && (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aramaya başlamak için yazmaya başlayın...</p>
            </div>
          )}

          {searchResults.map((result, index) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => {
                onSelect(result.type, result.id);
                onClose();
              }}
              className={`w-full p-4 text-left border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                  result.type === 'note' 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                }`}>
                  {result.type === 'note' ? (
                    <FileText className="w-4 h-4" />
                  ) : (
                    <CheckSquare className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {highlightMatch(result.title, query)}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded ${
                      result.type === 'note'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    }`}>
                      {result.type === 'note' ? 'Not' : 'Görev'}
                    </span>
                  </div>
                  
                  {result.matchedText && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {highlightMatch(result.matchedText, query)}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        {searchResults.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center justify-between">
              <span>{searchResults.length} sonuç bulundu</span>
              <span>↑↓ Gezin • Enter Seç • Esc Kapat</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
