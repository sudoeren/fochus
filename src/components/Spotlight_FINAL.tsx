import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, Home, BookOpen, CheckSquare, Calendar, Settings } from 'lucide-react';

interface SpotlightProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  onOpenNoteModal?: () => void;
  onOpenTaskModal?: () => void;
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

  // Commands
  const commands = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, desc: 'Ana sayfa', action: () => { onNavigate('dashboard'); onClose(); } },
    { id: 'notes', label: 'Notlar', icon: BookOpen, desc: 'Notlarınızı görün', action: () => { onNavigate('notes'); onClose(); } },
    { id: 'tasks', label: 'Görevler', icon: CheckSquare, desc: 'Görevlerinizi yönetin', action: () => { onNavigate('tasks'); onClose(); } },
    { id: 'weekly', label: 'Haftalık Planlayıcı', icon: Calendar, desc: 'Haftalık planınız', action: () => { onNavigate('weekly'); onClose(); } },
    { id: 'settings', label: 'Ayarlar', icon: Settings, desc: 'Uygulama ayarları', action: () => { onNavigate('settings'); onClose(); } },
    { id: 'new-note', label: 'Yeni Not', icon: BookOpen, desc: 'Yeni not oluştur', action: () => { onOpenNoteModal?.(); onClose(); } },
    { id: 'new-task', label: 'Yeni Görev', icon: CheckSquare, desc: 'Yeni görev oluştur', action: () => { onOpenTaskModal?.(); onClose(); } },
  ];

  // Filter
  const filtered = commands.filter(c => 
    c.label.toLowerCase().includes(query.toLowerCase()) || 
    c.desc.toLowerCase().includes(query.toLowerCase())
  );

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filtered.length]);

  // Keyboard
  useEffect(() => {
    if (!isOpen) return;

    const handle = (e: KeyboardEvent) => {
      console.log('🔥🔥🔥 KEY:', e.key);
      
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        console.log('🔥🔥🔥 CLOSING');
        return;
      }
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => i >= filtered.length - 1 ? 0 : i + 1);
        console.log('🔥🔥🔥 DOWN');
        return;
      }
      
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => i <= 0 ? filtered.length - 1 : i - 1);
        console.log('🔥🔥🔥 UP');
        return;
      }
      
      if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
          console.log('🔥🔥🔥 ENTER:', filtered[selectedIndex].label);
        }
        return;
      }
    };

    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center pt-[15vh] px-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700"
        onClick={e => e.stopPropagation()}
      >
        {/* Search */}
        <div className="flex items-center gap-4 p-6 border-b border-gray-200 dark:border-gray-700">
          <Search className="w-6 h-6 text-gray-400" />
          <input
            autoFocus
            type="text"
            placeholder="Arama..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-gray-900 dark:text-white outline-none text-lg"
          />
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {filtered.map((cmd, i) => {
            const Icon = cmd.icon;
            const selected = i === selectedIndex;
            
            return (
              <div
                key={cmd.id}
                onClick={() => cmd.action()}
                className={`flex items-center gap-4 px-6 py-4 cursor-pointer ${
                  selected ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  selected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1">
                  <div className={`font-medium ${selected ? 'text-blue-700' : 'text-gray-900 dark:text-gray-100'}`}>
                    {cmd.label}
                  </div>
                  <div className="text-sm text-gray-500">{cmd.desc}</div>
                </div>
                
                {selected && <ArrowRight className="w-5 h-5 text-blue-500" />}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-500">
          ↑↓ Gezin • Enter Seç • Esc Kapat
        </div>
      </div>
    </div>
  );
};
